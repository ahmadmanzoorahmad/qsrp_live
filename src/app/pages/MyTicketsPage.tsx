import { Link } from "react-router";
import { useState } from "react";
import {
  MessageSquare, Search, Clock, CheckCircle2,
  XCircle, AlertTriangle, ArrowRight, TrendingUp, LogIn, FileText
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMyTickets, useAllTickets } from "../hooks/useTickets";
import type { Ticket } from "../data/database";

type TicketStatus = string;

function getStatusColor(status: TicketStatus) {
  switch (status) {
    case "Approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Partially Approved": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Rejected": return "bg-red-100 text-red-700 border-red-200";
    case "Escalated": return "bg-orange-100 text-orange-700 border-orange-200";
    case "In Review":
    case "Awaiting Department Response":
    case "Awaiting Legal Review":
    case "Committee Review": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getStatusIcon(status: TicketStatus) {
  switch (status) {
    case "Approved": return CheckCircle2;
    case "Rejected": return XCircle;
    case "Escalated": return AlertTriangle;
    case "In Review":
    case "Awaiting Department Response":
    case "Awaiting Legal Review":
    case "Committee Review": return Clock;
    default: return TrendingUp;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "Critical": return "bg-red-100 text-red-700";
    case "High": return "bg-orange-100 text-orange-700";
    case "Medium": return "bg-yellow-100 text-yellow-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const StatusIcon = getStatusIcon(ticket.status);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm font-semibold text-emerald-600">{ticket.ticketId}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              <Link to={`/documents/${ticket.documentId}`} className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors">
                {ticket.documentTitle}
              </Link>
            </div>
          </div>

          <p className="text-slate-600 text-sm mb-4 line-clamp-2">{ticket.feedbackContent}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
            <div><span className="font-medium">Type:</span> {ticket.feedbackType}</div>
            {ticket.clauseReference && <div><span className="font-medium">Section:</span> {ticket.clauseReference}</div>}
            <div><span className="font-medium">Submitted:</span> {ticket.submittedDate}</div>
            <div><span className="font-medium">Due:</span> {ticket.dueDate}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {ticket.status}
            </span>
            <span className="text-xs text-slate-600">
              Assigned to: <span className="font-medium">{ticket.assignedMinistry}</span>
              {ticket.assignedOfficer && <> • {ticket.assignedOfficer}</>}
            </span>
            {ticket.escalationLevel > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                Escalation Level {ticket.escalationLevel}
              </span>
            )}
          </div>

          {ticket.decision && ticket.decisionReason && (
            <div className={`mt-4 p-4 rounded-lg border ${
              ticket.decision === "Approved" ? "bg-emerald-50 border-emerald-200" :
              ticket.decision === "Rejected" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
            }`}>
              <div className={`font-medium mb-1 text-sm ${
                ticket.decision === "Approved" ? "text-emerald-900" :
                ticket.decision === "Rejected" ? "text-red-900" : "text-blue-900"
              }`}>
                Official Decision: {ticket.decision}
              </div>
              <div className={`text-sm ${
                ticket.decision === "Approved" ? "text-emerald-700" :
                ticket.decision === "Rejected" ? "text-red-700" : "text-blue-700"
              }`}>
                {ticket.decisionReason}
              </div>
            </div>
          )}
        </div>

        <div className="flex lg:flex-col gap-2">
          <Link
            to={`/tickets/${ticket.id}`}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function MyTicketsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const isAdminView = user?.role && ['admin', 'super_admin', 'auditor', 'executive'].includes(user.role);
  const { tickets: myTickets, loading: myLoading } = useMyTickets(!isAdminView ? user?.id : undefined);
  const { tickets: allTickets, loading: allLoading } = useAllTickets();

  const tickets = isAdminView ? allTickets : myTickets;
  const loading = isAdminView ? allLoading : myLoading;

  if (!user) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <LogIn className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Login to View Your Tickets</h2>
          <p className="text-slate-600 mb-6">
            Track all your submitted feedback and receive official responses from ministries.
          </p>
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
          >
            <FileText className="w-5 h-5" />
            Browse Documents
          </Link>
        </div>
      </div>
    );
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.feedbackContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.submitterName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: tickets.length,
    pending: tickets.filter(t => !["Approved", "Partially Approved", "Rejected", "Closed"].includes(t.status)).length,
    approved: tickets.filter(t => t.status === "Approved" || t.status === "Partially Approved").length,
    rejected: tickets.filter(t => t.status === "Rejected").length,
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl text-center">
        <div className="text-slate-600">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {isAdminView ? 'All Tickets (Platform View)' : 'My Feedback Tickets'}
        </h1>
        <p className="text-slate-600">
          {isAdminView
            ? `Viewing all ${tickets.length} tickets across the platform as ${user.role.replace('_', ' ')}.`
            : 'Track the status and progress of your submitted feedback on documents under review.'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Submitted", value: statusCounts.all, icon: MessageSquare, color: "text-slate-900" },
          { label: "Under Review", value: statusCounts.pending, icon: Clock, color: "text-yellow-600" },
          { label: "Approved", value: statusCounts.approved, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Rejected", value: statusCounts.rejected, icon: XCircle, color: "text-red-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <Icon className={`w-8 h-8 opacity-30 ${color}`} />
            </div>
            <div className="text-sm text-slate-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={isAdminView ? "Search by ticket, document, submitter..." : "Search by ticket ID or document title..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Review">In Review</option>
            <option value="Awaiting Department Response">Awaiting Department Response</option>
            <option value="Awaiting Legal Review">Awaiting Legal Review</option>
            <option value="Escalated">Escalated</option>
            <option value="Approved">Approved</option>
            <option value="Partially Approved">Partially Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="mb-4 text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{filteredTickets.length}</span> ticket{filteredTickets.length !== 1 ? 's' : ''}
      </div>

      <div className="space-y-4">
        {filteredTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}

        {filteredTickets.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            {tickets.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tickets Yet</h3>
                <p className="text-slate-600 mb-6">
                  You haven't submitted any feedback yet. Browse documents with active public review periods to get started.
                </p>
                <Link
                  to="/documents"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Browse Documents
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No tickets found</h3>
                <p className="text-slate-600">Try adjusting your search or filter criteria</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
