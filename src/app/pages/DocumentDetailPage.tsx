import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft, Download, MessageSquare, Calendar,
  Building2, FileText, Send, AlertCircle, LogIn,
  CheckCircle2, Loader2, Tag, Inbox, ChevronRight,
  Clock, CheckCircle, XCircle, AlertTriangle
} from "lucide-react";
import { documentDB, ticketDB, type Document, type Ticket } from "../data/database";
import { useAuth, canReviewTickets } from "../contexts/AuthContext";
import { submitFeedbackToDB } from "../hooks/useTickets";

export function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMode, setFeedbackMode] = useState<"full" | "section">("full");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<string>("general");
  const [orgType, setOrgType] = useState<string>("Individual / Citizen");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [submittedInternalId, setSubmittedInternalId] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docTickets, setDocTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const isStaffUser = user && user.role !== 'public';

  useEffect(() => {
    if (!id) return;
    documentDB.getById(id).then(doc => {
      setDocument(doc || null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !isStaffUser) return;
    setTicketsLoading(true);
    ticketDB.getAll().then(all => {
      setDocTickets(all.filter(t => t.documentId === id));
      setTicketsLoading(false);
    });
  }, [id, isStaffUser]);

  if (loading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading document...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl text-center">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Document Not Found</h2>
        <p className="text-slate-600 mb-6">The requested document could not be found.</p>
        <Link to="/documents" className="text-emerald-600 hover:text-emerald-700 font-semibold">
          ← Back to Documents
        </Link>
      </div>
    );
  }

  const canSubmitFeedback = document.status === "Public Review Open";
  const documentSections = document.content?.split('\n## ').filter(s => s.trim()) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Public Review Open": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Public Review Closed": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Published": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Revision in Progress": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Final Approval Pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Draft": return "bg-slate-100 text-slate-600 border-slate-200";
      case "Internal Review": return "bg-cyan-100 text-cyan-700 border-cyan-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowLoginPrompt(true); return; }
    if (!feedbackText.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const ticketId = await submitFeedbackToDB({
        documentId: document.id,
        documentTitle: document.title,
        documentMinistry: document.ministry,
        submitterId: user.id,
        submitterName: user.name,
        submitterEmail: user.email,
        organizationType: orgType,
        feedbackType,
        feedbackContent: feedbackText,
        clauseReference: feedbackMode === "section" && selectedSection ? selectedSection : undefined,
      });
      setSubmittedTicketId(ticketId);
      // Find the internal DB id to link to ticket detail
      const { ticketDB } = await import("../data/database");
      const allTickets = await ticketDB.getAll();
      const myNew = allTickets.find(t => t.ticketId === ticketId);
      setSubmittedInternalId(myNew?.id || null);
      setFeedbackText("");
      setSelectedSection("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Documents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(document.status)}`}>
                    {document.status === "Public Review Open" && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                    {document.status}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    {document.category}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{document.title}</h1>
                <div className="text-sm text-slate-500">
                  Reference: {document.referenceId} • Version {document.version}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{document.ministry}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Published {document.publishedDate}</span>
              </div>
              {document.totalComments !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{document.totalComments} public comments</span>
                </div>
              )}
              {document.reviewEndDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Review closes {document.reviewEndDate}</span>
                </div>
              )}
            </div>

            {canSubmitFeedback && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-emerald-900 mb-1">Public Review Period Active</div>
                    <div className="text-sm text-emerald-700">
                      This document is open for public consultation until {document.reviewEndDate}.
                      Your feedback will be reviewed and you'll receive an official tracked response.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Summary</h2>
            <p className="text-slate-600 leading-relaxed">{document.summary}</p>
          </div>

          {/* Document Content */}
          {document.content && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-slate-900">Full Document</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-mono bg-slate-50 p-6 rounded-lg max-h-[600px] overflow-y-auto">
                {document.content}
              </div>
            </div>
          )}

          {/* Staff: Submitted Feedback Tickets */}
          {isStaffUser && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Submitted Public Feedback
                  {docTickets.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      ({docTickets.length} ticket{docTickets.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </h2>
                {canReviewTickets(user?.role) && (
                  <Link
                    to="/ministry-dashboard"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Ministry Dashboard →
                  </Link>
                )}
              </div>

              {ticketsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mr-2" />
                  <span className="text-slate-500 text-sm">Loading feedback...</span>
                </div>
              ) : docTickets.length === 0 ? (
                <div className="text-center py-10">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <div className="font-medium text-slate-600 mb-1">No feedback submitted yet</div>
                  <div className="text-sm text-slate-400">
                    Public feedback submitted for this document will appear here.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {docTickets.map(ticket => {
                    const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
                      'Submitted': { icon: <Clock className="w-4 h-4" />, color: 'text-slate-500 bg-slate-100', label: 'Submitted' },
                      'Assigned': { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-700 bg-amber-100', label: 'Assigned' },
                      'Under Review': { icon: <Clock className="w-4 h-4" />, color: 'text-blue-700 bg-blue-100', label: 'Under Review' },
                      'Escalated': { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-orange-700 bg-orange-100', label: 'Escalated' },
                      'Decision Pending': { icon: <Clock className="w-4 h-4" />, color: 'text-purple-700 bg-purple-100', label: 'Decision Pending' },
                      'Approved': { icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-700 bg-emerald-100', label: 'Approved' },
                      'Partially Approved': { icon: <CheckCircle className="w-4 h-4" />, color: 'text-teal-700 bg-teal-100', label: 'Partially Approved' },
                      'Rejected': { icon: <XCircle className="w-4 h-4" />, color: 'text-red-700 bg-red-100', label: 'Rejected' },
                      'Closed': { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-slate-600 bg-slate-200', label: 'Closed' },
                    };
                    const sc = statusConfig[ticket.status] ?? statusConfig['Submitted'];
                    return (
                      <Link
                        key={ticket.id}
                        to={`/tickets/${ticket.id}`}
                        className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-semibold text-slate-500">
                              {ticket.ticketId}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                              {sc.icon}
                              {sc.label}
                            </span>
                            {ticket.priority && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                                ticket.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {ticket.priority} priority
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-2 mb-1">
                            {ticket.feedbackContent}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>{ticket.submitterName}</span>
                            {ticket.clauseReference && (
                              <span className="font-medium text-slate-500">§ {ticket.clauseReference}</span>
                            )}
                            <span>{ticket.feedbackType}</span>
                            <span>{new Date(ticket.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 flex-shrink-0 mt-1" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submit Feedback Section — public users only */}
          {!isStaffUser && canSubmitFeedback && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Submit Your Feedback</h2>

              {/* Success */}
              {submittedTicketId && (
                <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-emerald-900 mb-1">Feedback Submitted Successfully!</div>
                      <div className="text-sm text-emerald-700 mb-3">
                        Your feedback has been received, AI-classified, and routed to {document.ministry} for review.
                        You will receive an official response on the decision and reasoning.
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                          {submittedTicketId}
                        </span>
                        {submittedInternalId ? (
                          <Link
                            to={`/tickets/${submittedInternalId}`}
                            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 underline"
                          >
                            Track this ticket →
                          </Link>
                        ) : (
                          <Link
                            to="/my-tickets"
                            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 underline"
                          >
                            View in My Tickets →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Prompt */}
              {showLoginPrompt && !user && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <LogIn className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-amber-900 mb-1">Login Required</div>
                      <div className="text-sm text-amber-700 mb-3">
                        You must be logged in to submit feedback. This ensures accountability and allows you to track your ticket.
                      </div>
                      <button
                        onClick={() => navigate('/?openLogin=true')}
                        className="text-sm font-semibold text-amber-700 hover:text-amber-800 underline"
                      >
                        Login or Register →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              {!submittedTicketId && (
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  {/* Feedback Scope */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Feedback Scope</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["full", "section"] as const).map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setFeedbackMode(mode)}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            feedbackMode === mode
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {mode === "full" ? "Full Document" : "Specific Section / Clause"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {feedbackMode === "section" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Select Section / Clause</label>
                      <select
                        value={selectedSection}
                        onChange={e => setSelectedSection(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required={feedbackMode === "section"}
                      >
                        <option value="">Choose a section...</option>
                        {documentSections.map((section, index) => {
                          const title = section.split('\n')[0].replace(/^#+ /, '');
                          return <option key={index} value={title}>{title}</option>;
                        })}
                      </select>
                    </div>
                  )}

                  {/* Feedback Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Feedback Type</label>
                    <select
                      value={feedbackType}
                      onChange={e => setFeedbackType(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="general">General Comment</option>
                      <option value="technical">Technical Concern</option>
                      <option value="clarification">Clarification Request</option>
                      <option value="enhancement">Technical Enhancement</option>
                      <option value="cost">Cost Impact</option>
                      <option value="regulatory">Regulatory Concern</option>
                    </select>
                  </div>

                  {/* Organization Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Representing</label>
                    <select
                      value={orgType}
                      onChange={e => setOrgType(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>Individual / Citizen</option>
                      <option>Private Sector – SME</option>
                      <option>Private Sector – Large Enterprise</option>
                      <option>Banking / Financial Services</option>
                      <option>Telecom / Payment Provider</option>
                      <option>Construction Industry</option>
                      <option>Energy Sector</option>
                      <option>Healthcare / Pharma</option>
                      <option>Research Institution</option>
                      <option>NGO / Civil Society</option>
                      <option>Legal / Consultancy Firm</option>
                      <option>Government / Public Sector</option>
                    </select>
                  </div>

                  {/* Feedback Content */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Feedback</label>
                    <textarea
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      rows={6}
                      placeholder="Provide your detailed feedback, suggestions, or concerns. Be specific about the clause or section you are referring to for faster routing..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      required
                    />
                    <div className="mt-2 text-sm text-slate-500">
                      Your feedback will be AI-classified, routed to the relevant ministry, and you'll receive an official response with reasoning.
                    </div>
                  </div>

                  {!user && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      <LogIn className="inline w-4 h-4 mr-1" />
                      You'll need to be logged in to submit. Clicking submit will prompt you to log in.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting & AI Classifying...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Submit Feedback</>
                    )}
                  </button>
                </form>
              )}

              {submittedTicketId && (
                <button
                  onClick={() => { setSubmittedTicketId(null); setSubmittedInternalId(null); }}
                  className="w-full mt-2 px-6 py-3 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-sm"
                >
                  Submit Another Feedback
                </button>
              )}
            </div>
          )}

          {!isStaffUser && !canSubmitFeedback && document.status !== "Draft" && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
              <Tag className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <div className="font-medium text-slate-700 mb-1">Feedback Submission Closed</div>
              <div className="text-sm text-slate-500">
                {document.status === "Published"
                  ? "This document has been published. The public review period has ended."
                  : `This document is currently in "${document.status}" stage. Feedback collection is not yet open.`}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                Download DOC
              </button>
              <Link
                to="/my-tickets"
                className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                View My Feedback
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Document Information</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500 mb-1">Reference ID</dt>
                <dd className="font-medium text-slate-900">{document.referenceId}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Version</dt>
                <dd className="font-medium text-slate-900">{document.version}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Ministry / Authority</dt>
                <dd className="font-medium text-slate-900">{document.ministry}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Category</dt>
                <dd className="font-medium text-slate-900">{document.category}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Published Date</dt>
                <dd className="font-medium text-slate-900">{document.publishedDate}</dd>
              </div>
              {document.reviewStartDate && (
                <div>
                  <dt className="text-slate-500 mb-1">Review Period</dt>
                  <dd className="font-medium text-slate-900">
                    {document.reviewStartDate} → {document.reviewEndDate}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {document.totalComments !== undefined && document.totalComments > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Public Feedback</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-1">{document.totalComments}</div>
                <div className="text-sm text-slate-600">Comments Received</div>
              </div>
            </div>
          )}

          {/* Lifecycle status guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-3 text-sm">Document Lifecycle</h3>
            <div className="space-y-2">
              {[
                { stage: "Draft", done: true },
                { stage: "Internal Review", done: !["Draft"].includes(document.status) },
                { stage: "Public Review Open", done: ["Public Review Open", "Public Review Closed", "Revision in Progress", "Final Approval Pending", "Published"].includes(document.status), current: document.status === "Public Review Open" },
                { stage: "Feedback Collection", done: ["Public Review Closed", "Revision in Progress", "Final Approval Pending", "Published"].includes(document.status), current: document.status === "Public Review Open" },
                { stage: "Revision", done: ["Final Approval Pending", "Published"].includes(document.status), current: document.status === "Revision in Progress" },
                { stage: "Published", done: document.status === "Published", current: document.status === "Final Approval Pending" },
              ].map(({ stage, done, current }) => (
                <div key={stage} className={`flex items-center gap-2 text-xs ${done ? 'text-blue-700' : current ? 'text-blue-600 font-semibold' : 'text-blue-400'}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? 'bg-blue-600' : current ? 'bg-blue-400 animate-pulse' : 'bg-blue-200'}`} />
                  {stage}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
