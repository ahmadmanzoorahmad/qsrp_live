import { useParams, Link } from "react-router";
import { useState } from "react";
import {
  ArrowLeft, MessageSquare, Calendar, User, Building2,
  FileText, Clock, CheckCircle2, AlertCircle, TrendingUp,
  Loader2, Play, Scale, ArrowUpCircle, ThumbsUp, ThumbsDown, AlertTriangle
} from "lucide-react";
import { useAuth, canReviewTickets, canApproveTickets } from "../contexts/AuthContext";
import {
  useTicketDetail, startTicketReview, addReviewerNotes,
  forwardToLegal, escalateTicket, makeDecision, markLegallyApproved
} from "../hooks/useTickets";

function getCurrentStatusDescription(status: string): string {
  switch (status) {
    case "Submitted": return "Feedback received by QSRP Portal";
    case "Acknowledged": return "Automatic acknowledgment sent to submitter";
    case "AI Triaged": return "AI has classified and prioritised the feedback";
    case "Assigned": return "Routed to relevant ministry — awaiting review";
    case "In Review": return "Ministry reviewer is currently examining this feedback";
    case "Awaiting Legal Review": return "Legal Committee is reviewing for statutory compliance";
    case "Legal Review Complete": return "Legal Committee has approved — cleared for final decision";
    case "Committee Review": return "Full committee is deliberating";
    case "Approved": return "Feedback accepted — will be incorporated into final document";
    case "Rejected": return "Feedback reviewed but not accepted";
    case "Partially Approved": return "Some aspects of feedback accepted";
    case "Escalated": return "Escalated to approver level due to complexity or delay";
    case "Closed": return "Ticket closed";
    default: return "Processing in progress";
  }
}

export function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { ticket, activities, loading, refetch } = useTicketDetail(id);

  const [showDecisionPanel, setShowDecisionPanel] = useState(false);
  const [decisionType, setDecisionType] = useState<'Approved' | 'Partially Approved' | 'Rejected'>('Approved');
  const [decisionReason, setDecisionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [legalNotes, setLegalNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showEscalatePanel, setShowEscalatePanel] = useState(false);
  const [showLegalPanel, setShowLegalPanel] = useState(false);
  const [showLegalApprovalPanel, setShowLegalApprovalPanel] = useState(false);
  const [legalApprovalNotes, setLegalApprovalNotes] = useState('');

  if (loading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl text-center">
        <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Ticket Not Found</h2>
        <p className="text-slate-600 mb-6">The requested ticket could not be found.</p>
        <Link to="/my-tickets" className="text-emerald-600 hover:text-emerald-700 font-semibold">
          ← Back to My Tickets
        </Link>
      </div>
    );
  }

  const isReviewer = user && canReviewTickets(user.role);
  const isApprover = user && canApproveTickets(user.role);
  const isLegal = user?.role === 'legal_committee';
  const isOwner = user?.id === ticket.submitterId;
  const terminalStatuses = ['Approved', 'Rejected', 'Partially Approved', 'Closed'];
  const canAct = isReviewer && !isLegal && !terminalStatuses.includes(ticket.status);
  const canLegalAct = isLegal && !terminalStatuses.includes(ticket.status) && ticket.status !== 'Legal Review Complete';
  const canDecide = isApprover && ['Escalated', 'Awaiting Legal Review', 'Legal Review Complete', 'In Review', 'Assigned', 'Committee Review'].includes(ticket.status);

  const doAction = async (fn: () => Promise<void>) => {
    setActionLoading(true);
    setActionError('');
    try {
      await fn();
      await refetch();
      setShowDecisionPanel(false);
      setShowNotesPanel(false);
      setShowEscalatePanel(false);
      setShowLegalPanel(false);
      setShowLegalApprovalPanel(false);
      setDecisionReason('');
      setReviewNotes('');
      setEscalateReason('');
      setLegalNotes('');
      setLegalApprovalNotes('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <Link to="/my-tickets" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </Link>

      {/* Role-based action panel */}
      {(canAct || canLegalAct || canDecide) && (
        <div className={`mb-6 bg-white rounded-xl border-2 p-5 ${
          canLegalAct ? 'border-indigo-300' : 'border-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">
                {canLegalAct ? 'Legal Committee Actions' : isApprover ? 'Approver Actions' : 'Reviewer Actions'}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {canLegalAct
                  ? 'Review the ticket for statutory and regulatory compliance, then mark as legally approved'
                  : isApprover
                  ? 'Make a binding decision on this feedback'
                  : 'Review and advance this ticket through the workflow'}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              ticket.status === 'Escalated' ? 'bg-orange-100 text-orange-700' :
              ticket.status === 'Awaiting Legal Review' ? 'bg-indigo-100 text-indigo-700' :
              ticket.status === 'Legal Review Complete' ? 'bg-emerald-100 text-emerald-700' :
              ticket.status === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {ticket.status}
            </span>
          </div>

          {actionError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{actionError}</div>
          )}

          {/* Legal Committee — only Legally Approved action */}
          {canLegalAct && (
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => { setShowNotesPanel(!showNotesPanel); setShowLegalApprovalPanel(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Add Notes
              </button>
              <button
                onClick={() => { setShowLegalApprovalPanel(!showLegalApprovalPanel); setShowNotesPanel(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
              >
                <Scale className="w-4 h-4" />
                Legally Approved
              </button>
            </div>
          )}

          {/* Standard Reviewer buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {canAct && ticket.status === 'Assigned' && (
              <button
                onClick={() => doAction(() => startTicketReview(ticket.id, user!.name))}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-60"
              >
                <Play className="w-4 h-4" />
                Start Review
              </button>
            )}
            {canAct && (
              <>
                <button
                  onClick={() => { setShowNotesPanel(!showNotesPanel); setShowDecisionPanel(false); setShowEscalatePanel(false); setShowLegalPanel(false); }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Add Notes
                </button>
                <button
                  onClick={() => { setShowLegalPanel(!showLegalPanel); setShowDecisionPanel(false); setShowEscalatePanel(false); setShowNotesPanel(false); }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
                >
                  <Scale className="w-4 h-4" />
                  Forward to Legal
                </button>
                {!isApprover && (
                  <button
                    onClick={() => { setShowEscalatePanel(!showEscalatePanel); setShowDecisionPanel(false); setShowNotesPanel(false); setShowLegalPanel(false); }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium transition-colors"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Escalate
                  </button>
                )}
              </>
            )}
            {(canDecide || (canAct && isApprover)) && (
              <button
                onClick={() => { setShowDecisionPanel(!showDecisionPanel); setShowNotesPanel(false); setShowEscalatePanel(false); setShowLegalPanel(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Make Decision
              </button>
            )}
          </div>

          {/* Legal Approval Panel */}
          {showLegalApprovalPanel && (
            <div className="mt-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <h4 className="font-medium text-indigo-900 mb-1 text-sm">Confirm Legal Approval</h4>
              <p className="text-xs text-indigo-600 mb-3">
                This will mark the ticket as legally cleared and forward it for final approver decision.
              </p>
              <textarea
                value={legalApprovalNotes}
                onChange={e => setLegalApprovalNotes(e.target.value)}
                rows={2}
                placeholder="Legal compliance notes (optional)..."
                className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => doAction(() => markLegallyApproved(ticket.id, user!.name, legalApprovalNotes))}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? 'Approving...' : 'Confirm Legal Approval'}
                </button>
                <button onClick={() => setShowLegalApprovalPanel(false)} className="px-4 py-2 text-slate-600 text-sm hover:text-slate-900">Cancel</button>
              </div>
            </div>
          )}

          {/* Add Notes Panel */}
          {showNotesPanel && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-medium text-slate-900 mb-2 text-sm">Internal Review Notes</h4>
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="Add internal notes about this feedback (visible to ministry reviewers only)..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => doAction(() => addReviewerNotes(ticket.id, reviewNotes, user!.name))}
                  disabled={!reviewNotes.trim() || actionLoading}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? 'Saving...' : 'Save Notes'}
                </button>
                <button onClick={() => setShowNotesPanel(false)} className="px-4 py-2 text-slate-600 text-sm hover:text-slate-900">Cancel</button>
              </div>
            </div>
          )}

          {/* Forward to Legal Panel */}
          {showLegalPanel && (
            <div className="mt-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <h4 className="font-medium text-indigo-900 mb-2 text-sm">Forward to Legal Committee</h4>
              <textarea
                value={legalNotes}
                onChange={e => setLegalNotes(e.target.value)}
                rows={2}
                placeholder="Reason for legal review (optional)..."
                className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => doAction(() => forwardToLegal(ticket.id, user!.name, legalNotes))}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? 'Forwarding...' : 'Forward to Legal'}
                </button>
                <button onClick={() => setShowLegalPanel(false)} className="px-4 py-2 text-slate-600 text-sm hover:text-slate-900">Cancel</button>
              </div>
            </div>
          )}

          {/* Escalate Panel */}
          {showEscalatePanel && (
            <div className="mt-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <h4 className="font-medium text-orange-900 mb-2 text-sm">Escalate Ticket</h4>
              <textarea
                value={escalateReason}
                onChange={e => setEscalateReason(e.target.value)}
                rows={2}
                placeholder="Reason for escalation (optional)..."
                className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => doAction(() => escalateTicket(ticket.id, user!.name, escalateReason))}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? 'Escalating...' : 'Confirm Escalation'}
                </button>
                <button onClick={() => setShowEscalatePanel(false)} className="px-4 py-2 text-slate-600 text-sm hover:text-slate-900">Cancel</button>
              </div>
            </div>
          )}

          {/* Decision Panel */}
          {showDecisionPanel && (
            <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <h4 className="font-medium text-emerald-900 mb-3 text-sm">Final Decision</h4>
              <div className="flex gap-2 mb-3">
                {(['Approved', 'Partially Approved', 'Rejected'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDecisionType(d)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      decisionType === d
                        ? d === 'Approved' ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                          : d === 'Rejected' ? 'border-red-500 bg-red-100 text-red-700'
                          : 'border-blue-500 bg-blue-100 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {d === 'Approved' ? <ThumbsUp className="w-4 h-4" /> : d === 'Rejected' ? <ThumbsDown className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {d}
                  </button>
                ))}
              </div>
              <textarea
                value={decisionReason}
                onChange={e => setDecisionReason(e.target.value)}
                rows={3}
                placeholder="Provide official reasoning for this decision. This will be sent to the submitter as the transparent government response..."
                className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                required
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => decisionReason.trim() && doAction(() => makeDecision(ticket.id, decisionType, decisionReason, user!.name))}
                  disabled={!decisionReason.trim() || actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? 'Submitting...' : `Confirm: ${decisionType}`}
                </button>
                <button onClick={() => setShowDecisionPanel(false)} className="px-4 py-2 text-slate-600 text-sm hover:text-slate-900">Cancel</button>
              </div>
            </div>
          )}

          {/* Internal Notes display */}
          {ticket.reviewerNotes && (
            <div className="mt-3 p-3 bg-slate-100 rounded-lg border border-slate-200 text-sm text-slate-700">
              <span className="font-medium">Internal Notes: </span>{ticket.reviewerNotes}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-lg font-bold text-emerald-600">{ticket.ticketId}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ticket.priority === "Critical" ? "bg-red-100 text-red-700" :
                  ticket.priority === "High" ? "bg-orange-100 text-orange-700" :
                  ticket.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-slate-100 text-slate-700"
                }`}>
                  {ticket.priority} Priority
                </span>
              </div>
              <Link to={`/documents/${ticket.documentId}`} className="text-xl font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                {ticket.documentTitle}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{ticket.submitterName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{ticket.organizationType}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Submitted {ticket.submittedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Due {ticket.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className={`rounded-xl border p-6 ${
            ticket.decision === "Approved" ? "bg-emerald-50 border-emerald-200" :
            ticket.decision === "Rejected" ? "bg-red-50 border-red-200" :
            ticket.status === "Escalated" ? "bg-orange-50 border-orange-200" :
            "bg-yellow-50 border-yellow-200"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                ticket.decision === "Approved" ? "bg-emerald-100" :
                ticket.decision === "Rejected" ? "bg-red-100" :
                ticket.status === "Escalated" ? "bg-orange-100" : "bg-yellow-100"
              }`}>
                {ticket.decision === "Approved" ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> :
                 ticket.decision === "Rejected" ? <AlertCircle className="w-6 h-6 text-red-600" /> :
                 ticket.status === "Escalated" ? <AlertTriangle className="w-6 h-6 text-orange-600" /> :
                 <Clock className="w-6 h-6 text-yellow-600" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1">Current Status: {ticket.status}</div>
                <div className="text-sm opacity-80">{getCurrentStatusDescription(ticket.status)}</div>
                {ticket.assignedOfficer && (
                  <div className="mt-2 text-sm font-medium">
                    Assigned to: {ticket.assignedOfficer} ({ticket.assignedMinistry})
                  </div>
                )}
                {!ticket.assignedOfficer && (
                  <div className="mt-2 text-sm">
                    Ministry: {ticket.assignedMinistry}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Submitted Feedback</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Feedback Type</div>
                <div className="font-medium text-slate-900">{ticket.feedbackType}</div>
              </div>
              {ticket.clauseReference && (
                <div>
                  <div className="text-sm text-slate-500 mb-1">Section / Clause Reference</div>
                  <div className="font-medium text-slate-900">{ticket.clauseReference}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-slate-500 mb-1">AI Category</div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{ticket.category}</span>
                  <span className="text-xs text-slate-500">({Math.round(ticket.aiConfidence * 100)}% confidence)</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-2">Feedback Details</div>
                <div className="p-4 bg-slate-50 rounded-lg text-slate-700 leading-relaxed">{ticket.feedbackContent}</div>
              </div>
            </div>
          </div>

          {/* Official Response */}
          {ticket.decision && ticket.decisionReason && (
            <div className={`rounded-xl border p-6 ${
              ticket.decision === "Approved" ? "bg-emerald-50 border-emerald-200" :
              ticket.decision === "Rejected" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
            }`}>
              <h2 className={`font-semibold mb-4 ${
                ticket.decision === "Approved" ? "text-emerald-900" :
                ticket.decision === "Rejected" ? "text-red-900" : "text-blue-900"
              }`}>
                Official Response
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Decision</div>
                  <div className={`text-lg font-semibold ${
                    ticket.decision === "Approved" ? "text-emerald-700" :
                    ticket.decision === "Rejected" ? "text-red-700" : "text-blue-700"
                  }`}>
                    {ticket.decision}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-2">Official Reasoning</div>
                  <div className="p-4 bg-white rounded-lg leading-relaxed text-slate-800">{ticket.decisionReason}</div>
                </div>
                {ticket.approvedBy && (
                  <div className="text-xs text-slate-500">
                    Decision by {ticket.approvedBy} • {ticket.approvedAt?.slice(0, 10)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Workflow Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-6">Workflow Timeline</h2>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-500">No activity records found.</p>
            ) : (
              <div className="space-y-6">
                {activities.map((step, index) => (
                  <div key={step.id} className="relative">
                    {index < activities.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-emerald-200" style={{ height: "calc(100% + 1.5rem)" }} />
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                        step.completed ? "bg-emerald-100 border-emerald-500" : "bg-slate-100 border-slate-300"
                      }`}>
                        {step.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <TrendingUp className="w-6 h-6 text-slate-400" />}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="font-semibold text-slate-900 mb-1">{step.status}</div>
                        <div className="text-sm text-slate-600 mb-1">{step.description}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{step.user}</span>
                          <span>•</span>
                          <span>{new Date(step.date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Ticket Information</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500 mb-1">Ticket ID</dt>
                <dd className="font-mono font-semibold text-slate-900">{ticket.ticketId}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Status</dt>
                <dd className="font-medium text-slate-900">{ticket.status}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Priority</dt>
                <dd className="font-medium text-slate-900">{ticket.priority}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Ministry</dt>
                <dd className="font-medium text-slate-900">{ticket.assignedMinistry}</dd>
              </div>
              {ticket.assignedOfficer && (
                <div>
                  <dt className="text-slate-500 mb-1">Assigned Officer</dt>
                  <dd className="font-medium text-slate-900">{ticket.assignedOfficer}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500 mb-1">Submitted</dt>
                <dd className="font-medium text-slate-900">{ticket.submittedDate}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Due Date</dt>
                <dd className="font-medium text-slate-900">{ticket.dueDate}</dd>
              </div>
              {ticket.escalationLevel > 0 && (
                <div>
                  <dt className="text-slate-500 mb-1">Escalation Level</dt>
                  <dd className="font-medium text-orange-600">Level {ticket.escalationLevel}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">AI Classification</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-slate-500 mb-1">Category</div>
                <div className="font-medium text-slate-900">{ticket.category}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Confidence Score</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${ticket.aiConfidence * 100}%` }} />
                  </div>
                  <span className="font-medium text-slate-900">{Math.round(ticket.aiConfidence * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to={`/documents/${ticket.documentId}`}
                className="w-full flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                View Document
              </Link>
              <Link
                to="/my-tickets"
                className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                All Tickets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
