import { Link } from "react-router";
import { useState } from "react";
import {
  AlertTriangle, Clock, CheckCircle2, FileText,
  MessageSquare, TrendingUp, AlertCircle, ArrowRight,
  Users, Play, ThumbsUp, ThumbsDown, Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth, canReviewTickets, canApproveTickets } from "../contexts/AuthContext";
import { useMinistryTickets, useAllTickets, startTicketReview, makeDecision } from "../hooks/useTickets";
import { documentDB, type Document } from "../data/database";
import { useEffect } from "react";

export function MinistryDashboardPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const isGlobalView = user?.role && ['admin', 'super_admin', 'executive', 'auditor'].includes(user.role);
  const userMinistry = user?.ministry || 'Ministry of Science and Technology';

  const { tickets: ministryTickets, loading: ministryLoading, refetch: refetchMinistry } = useMinistryTickets(!isGlobalView ? userMinistry : undefined);
  const { tickets: allTickets, loading: allLoading, refetch: refetchAll } = useAllTickets();

  const tickets = isGlobalView ? allTickets : ministryTickets;
  const loading = isGlobalView ? allLoading : ministryLoading;
  const refetch = isGlobalView ? refetchAll : refetchMinistry;

  useEffect(() => {
    documentDB.getAll().then(docs => setDocuments(docs));
  }, []);

  const myDocuments = isGlobalView
    ? documents
    : documents.filter(d => d.ministry === userMinistry);

  const overdueTickets = tickets.filter(t => {
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return dueDate < today && !["Approved", "Rejected", "Closed", "Partially Approved"].includes(t.status);
  });

  const escalatedTickets = tickets.filter(t => t.escalationLevel > 0 && !["Approved", "Rejected", "Closed", "Partially Approved"].includes(t.status));
  const pendingTickets = tickets.filter(t => !["Approved", "Rejected", "Closed", "Partially Approved"].includes(t.status));
  const resolvedTickets = tickets.filter(t => ["Approved", "Partially Approved", "Rejected", "Closed"].includes(t.status));

  const priorityBreakdown = [
    { priority: "Critical", count: tickets.filter(t => t.priority === "Critical").length },
    { priority: "High", count: tickets.filter(t => t.priority === "High").length },
    { priority: "Medium", count: tickets.filter(t => t.priority === "Medium").length },
    { priority: "Low", count: tickets.filter(t => t.priority === "Low").length },
  ];

  const statusBreakdown = [
    { status: "Assigned", count: tickets.filter(t => t.status === "Assigned").length },
    { status: "In Review", count: tickets.filter(t => t.status === "In Review").length },
    { status: "Awaiting Legal", count: tickets.filter(t => t.status === "Awaiting Legal Review").length },
    { status: "Escalated", count: tickets.filter(t => t.status === "Escalated").length },
    { status: "Approved", count: tickets.filter(t => t.status === "Approved").length },
    { status: "Rejected", count: tickets.filter(t => t.status === "Rejected").length },
  ];

  const doAction = async (ticketId: string, fn: () => Promise<void>) => {
    setActionLoading(ticketId);
    setActionError('');
    try {
      await fn();
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ministry Dashboard</h1>
          </div>
        </div>
        <p className="text-slate-600">
          {isGlobalView
            ? `Platform-wide view — all ministries — logged in as ${user?.name} (${user?.role?.replace('_', ' ')})`
            : `${userMinistry} — ${user?.name} — Review and respond to public feedback`}
        </p>
      </div>

      {/* Alerts */}
      {(overdueTickets.length > 0 || escalatedTickets.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {overdueTickets.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Overdue Tickets</h3>
                  <p className="text-sm text-red-700">{overdueTickets.length} ticket{overdueTickets.length !== 1 ? 's are' : ' is'} past the response deadline</p>
                </div>
              </div>
            </div>
          )}
          {escalatedTickets.length > 0 && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1">Escalated Tickets</h3>
                  <p className="text-sm text-orange-700">{escalatedTickets.length} ticket{escalatedTickets.length !== 1 ? 's require' : ' requires'} approver attention</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "My Documents", value: myDocuments.length, sub: `${myDocuments.filter(d => d.status === "Public Review Open").length} under review`, icon: FileText, color: "blue" },
          { label: "Total Feedback", value: tickets.length, sub: "Across all documents", icon: MessageSquare, color: "purple" },
          { label: "Pending Action", value: pendingTickets.length, sub: `${overdueTickets.length} overdue`, icon: Clock, color: "orange" },
          { label: "Resolved", value: resolvedTickets.length, sub: `${tickets.length > 0 ? Math.round((resolvedTickets.length / tickets.length) * 100) : 0}% resolution rate`, icon: CheckCircle2, color: "emerald" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
              <TrendingUp className={`w-5 h-5 text-${color}-500`} />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
            <div className="text-sm text-slate-600">{label}</div>
            <div className={`mt-2 text-xs text-${color}-600 font-medium`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Tickets by Priority</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={priorityBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="priority" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#059669" name="Tickets" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Tickets by Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusBreakdown} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis type="category" dataKey="status" stroke="#64748b" style={{ fontSize: '11px' }} width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#3b82f6" name="Count" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{actionError}</div>
      )}

      {/* Pending Tickets */}
      <div className="bg-white rounded-xl border border-slate-200 mb-8">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pending Tickets Requiring Action</h2>
            <p className="text-sm text-slate-600 mt-1">Review and respond to public feedback</p>
          </div>
          <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold">
            {pendingTickets.length} Pending
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {pendingTickets.slice(0, 8).map(ticket => (
            <div key={ticket.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm font-semibold text-emerald-600">{ticket.ticketId}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ticket.priority === "Critical" ? "bg-red-100 text-red-700" :
                      ticket.priority === "High" ? "bg-orange-100 text-orange-700" :
                      ticket.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {ticket.priority}
                    </span>
                    {ticket.escalationLevel > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">Escalated L{ticket.escalationLevel}</span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ticket.status === "In Review" ? "bg-yellow-100 text-yellow-700" :
                      ticket.status === "Assigned" ? "bg-slate-100 text-slate-600" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 mb-1">{ticket.documentTitle}</div>
                  <p className="text-sm text-slate-600 line-clamp-1 mb-2">{ticket.feedbackContent}</p>
                  <div className="text-xs text-slate-500">
                    By {ticket.submitterName} • {ticket.submittedDate} • Due: {ticket.dueDate}
                    {isGlobalView && <> • {ticket.assignedMinistry}</>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {canReviewTickets(user?.role) && ticket.status === 'Assigned' && (
                    <button
                      onClick={() => doAction(ticket.id, () => startTicketReview(ticket.id, user!.name))}
                      disabled={actionLoading === ticket.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      {actionLoading === ticket.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      Start Review
                    </button>
                  )}
                  {canApproveTickets(user?.role) && (
                    <button
                      onClick={() => doAction(ticket.id, () => makeDecision(ticket.id, 'Approved', 'Feedback accepted and incorporated into the revised document.', user!.name))}
                      disabled={actionLoading === ticket.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      Quick Approve
                    </button>
                  )}
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    Full Review
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {pendingTickets.length === 0 && (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-slate-600">No pending tickets requiring action.</p>
            </div>
          )}
        </div>
      </div>

      {/* My Documents */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isGlobalView ? 'All Documents' : 'Ministry Documents'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {isGlobalView ? 'All platform documents' : `Documents managed by ${userMinistry}`}
            </p>
          </div>
          {user?.role && ['admin', 'super_admin'].includes(user.role) && (
            <Link
              to="/document-management"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Manage Lifecycle
            </Link>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Feedback</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Review Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {myDocuments.slice(0, 10).map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{doc.title}</div>
                    <div className="text-sm text-slate-500">{doc.referenceId}</div>
                    {isGlobalView && <div className="text-xs text-slate-400">{doc.ministry}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === "Public Review Open" ? "bg-emerald-100 text-emerald-700" :
                      doc.status === "Published" ? "bg-blue-100 text-blue-700" :
                      doc.status === "Draft" ? "bg-slate-100 text-slate-600" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{doc.totalComments || 0} comments</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {doc.reviewEndDate ? `Until ${doc.reviewEndDate}` : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link to={`/documents/${doc.id}`} className="text-emerald-600 hover:text-emerald-700 font-medium">
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
