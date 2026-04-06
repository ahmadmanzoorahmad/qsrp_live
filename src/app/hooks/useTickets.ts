import { useState, useEffect, useCallback } from 'react';
import { ticketDB, activityDB, type Ticket, type Activity } from '../data/database';

// ── AI Classification ────────────────────────────────────────────────────────
function classifyFeedback(feedbackType: string, content: string): {
  category: string;
  aiConfidence: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
} {
  const text = (feedbackType + ' ' + content).toLowerCase();
  let category = 'General Concern';
  let aiConfidence = 0.82;
  let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';

  if (text.includes('access') || text.includes('authentication') || text.includes('password') || text.includes('login') || text.includes('mfa')) {
    category = 'Access Control'; aiConfidence = 0.91;
  } else if (text.includes('incident') || text.includes('breach') || text.includes('attack') || text.includes('hack')) {
    category = 'Incident Response'; aiConfidence = 0.89;
  } else if (text.includes('data') || text.includes('privacy') || text.includes('encryption') || text.includes('loss')) {
    category = 'Data Protection'; aiConfidence = 0.88;
  } else if (text.includes('cost') || text.includes('expense') || text.includes('budget') || text.includes('price') || text.includes('pkr')) {
    category = 'Cost Impact'; aiConfidence = 0.87;
  } else if (text.includes('safety') || text.includes('hazard') || text.includes('accident') || text.includes('ppe') || text.includes('helmet')) {
    category = 'Worker Safety'; aiConfidence = 0.90;
  } else if (text.includes('seismic') || text.includes('earthquake') || text.includes('structural') || text.includes('zone')) {
    category = 'Seismic Design'; aiConfidence = 0.94;
  } else if (text.includes('environment') || text.includes('pollution') || text.includes('emission') || text.includes('waste')) {
    category = 'Environmental Compliance'; aiConfidence = 0.86;
  } else if (text.includes('food') || text.includes('hygiene') || text.includes('contamination') || text.includes('haccp')) {
    category = 'Food Safety'; aiConfidence = 0.85;
  } else if (text.includes('grid') || text.includes('solar') || text.includes('renewable') || text.includes('energy') || text.includes('kw')) {
    category = 'Grid Connection'; aiConfidence = 0.88;
  } else if (text.includes('legal') || text.includes('regulat') || text.includes('compliance') || text.includes('law') || text.includes('statute')) {
    category = 'Regulatory Concern'; aiConfidence = 0.92;
  } else if (text.includes('technical') || text.includes('implement') || text.includes('standard') || text.includes('requirement')) {
    category = 'Technical Implementation'; aiConfidence = 0.84;
  } else if (text.includes('biometric') || text.includes('fingerprint') || text.includes('otp') || text.includes('sms')) {
    category = 'Authentication'; aiConfidence = 0.91;
  }

  if (feedbackType === 'technical' || feedbackType === 'enhancement') {
    if (category === 'General Concern') category = 'Technical Enhancement';
    aiConfidence = Math.max(aiConfidence, 0.85);
  } else if (feedbackType === 'regulatory') {
    category = 'Regulatory Concern'; aiConfidence = 0.92;
  } else if (feedbackType === 'cost') {
    category = 'Cost Impact'; aiConfidence = 0.86;
  } else if (feedbackType === 'clarification') {
    aiConfidence = Math.min(aiConfidence, 0.80);
  }

  if (text.includes('critical') || text.includes('extremely') || text.includes('dangerous') || text.includes('urgent') || text.includes('immediate') || text.includes('emergency')) {
    priority = 'Critical';
  } else if (text.includes('important') || text.includes('significant') || text.includes('serious') || text.includes('major') || text.includes('high')) {
    priority = 'High';
  } else if (text.includes('minor') || text.includes('small') || text.includes('trivial') || text.includes('little') || text.includes('low')) {
    priority = 'Low';
  }

  return { category, aiConfidence: Math.round(aiConfidence * 100) / 100, priority };
}

// ── Submit Feedback ────────────────────────────────────────────────────────────
export interface SubmitFeedbackParams {
  documentId: string;
  documentTitle: string;
  documentMinistry: string;
  submitterId: string;
  submitterName: string;
  submitterEmail: string;
  organizationType: string;
  feedbackType: string;
  feedbackContent: string;
  clauseReference?: string;
}

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  general: 'General Comment',
  technical: 'Technical Concern',
  clarification: 'Clarification Request',
  enhancement: 'Technical Enhancement',
  cost: 'Cost Impact',
  regulatory: 'Regulatory Concern',
};

export async function submitFeedbackToDB(params: SubmitFeedbackParams): Promise<string> {
  const { category, aiConfidence, priority } = classifyFeedback(params.feedbackType, params.feedbackContent);
  const now = new Date();
  const ticketNumber = Math.floor(1000 + Math.random() * 8999);
  const ticketId = `QSRP-${now.getFullYear()}-${ticketNumber.toString().padStart(4, '0')}`;
  const id = `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const ticket: Ticket = {
    id,
    ticketId,
    documentId: params.documentId,
    documentTitle: params.documentTitle,
    submitterName: params.submitterName,
    submitterEmail: params.submitterEmail,
    submitterId: params.submitterId,
    organizationType: params.organizationType || 'Individual / Citizen',
    clauseReference: params.clauseReference,
    feedbackType: FEEDBACK_TYPE_LABELS[params.feedbackType] || params.feedbackType,
    priority,
    category,
    aiConfidence,
    assignedMinistry: params.documentMinistry,
    assignedOfficer: undefined,
    dueDate,
    status: 'Assigned',
    escalationLevel: 0,
    submittedDate: now.toISOString().slice(0, 10),
    feedbackContent: params.feedbackContent,
    isPublic: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  await ticketDB.add(ticket);

  const activities: Activity[] = [
    {
      id: `act-${id}-1`,
      ticketId: id,
      status: 'Submitted',
      date: now.toISOString(),
      user: params.submitterName,
      description: `Feedback submitted via QSRP Portal. Type: ${ticket.feedbackType}${params.clauseReference ? ` — Section: ${params.clauseReference}` : ''}.`,
      completed: true,
    },
    {
      id: `act-${id}-2`,
      ticketId: id,
      status: 'Acknowledged',
      date: now.toISOString(),
      user: 'QSRP System',
      description: `Automatic acknowledgment sent. Ticket ${ticketId} assigned. You can track progress in My Tickets.`,
      completed: true,
    },
    {
      id: `act-${id}-3`,
      ticketId: id,
      status: 'AI Triaged',
      date: now.toISOString(),
      user: 'AI Classification Engine',
      description: `Classified as "${category}" with ${Math.round(aiConfidence * 100)}% confidence. Priority automatically set to ${priority} based on content analysis.`,
      completed: true,
    },
    {
      id: `act-${id}-4`,
      ticketId: id,
      status: 'Assigned',
      date: now.toISOString(),
      user: 'Routing Engine',
      description: `Routed to ${params.documentMinistry} for review. Official response due by ${dueDate}.`,
      completed: true,
    },
  ];

  for (const activity of activities) {
    await activityDB.add(activity);
  }

  return ticketId;
}

// ── Ticket Action Operations ───────────────────────────────────────────────────
export async function startTicketReview(ticketId: string, reviewerName: string): Promise<void> {
  const ticket = await ticketDB.getById(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  const now = new Date().toISOString();
  const updated: Ticket = { ...ticket, status: 'In Review', reviewedBy: reviewerName, reviewedAt: now, updatedAt: now };
  await ticketDB.update(updated);
  await activityDB.add({
    id: `act-${ticketId}-review-${Date.now()}`,
    ticketId,
    status: 'In Review',
    date: now,
    user: reviewerName,
    description: `Review started by ${reviewerName}. Document is being examined for the submitted feedback.`,
    completed: true,
  });
}

export async function addReviewerNotes(ticketId: string, notes: string, reviewerName: string): Promise<void> {
  const ticket = await ticketDB.getById(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  const now = new Date().toISOString();
  const updated: Ticket = { ...ticket, reviewerNotes: notes, updatedAt: now };
  await ticketDB.update(updated);
  await activityDB.add({
    id: `act-${ticketId}-notes-${Date.now()}`,
    ticketId,
    status: 'Notes Added',
    date: now,
    user: reviewerName,
    description: `Internal notes recorded by ${reviewerName}.`,
    completed: true,
  });
}

export async function forwardToLegal(ticketId: string, reviewerName: string, notes?: string): Promise<void> {
  const ticket = await ticketDB.getById(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  const now = new Date().toISOString();
  const updated: Ticket = { ...ticket, status: 'Awaiting Legal Review', legalNotes: notes, updatedAt: now };
  await ticketDB.update(updated);
  await activityDB.add({
    id: `act-${ticketId}-legal-${Date.now()}`,
    ticketId,
    status: 'Awaiting Legal Review',
    date: now,
    user: reviewerName,
    description: `Forwarded to Legal Committee by ${reviewerName} for statutory compliance review.${notes ? ' Notes: ' + notes : ''}`,
    completed: true,
  });
}

export async function markLegallyApproved(ticketId: string, legalMemberName: string, notes?: string): Promise<void> {
  const ticket = await ticketDB.getById(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  const now = new Date().toISOString();
  const updated: Ticket = { ...ticket, status: 'Legal Review Complete', updatedAt: now };
  await ticketDB.update(updated);
  await activityDB.add({
    id: `act-${ticketId}-legal-approved-${Date.now()}`,
    ticketId,
    status: 'Legal Review Complete',
    date: now,
    user: legalMemberName,
    description: `Legally approved by ${legalMemberName} (Legal Committee). Ticket cleared for final decision.${notes ? ' Legal notes: ' + notes : ''}`,
    completed: true,
  });
}

export async function escalateTicket(ticketId: string, reviewerName: string, reason?: string): Promise<void> {
  const ticket = await ticketDB.getById(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  const now = new Date().toISOString();
  const updated: Ticket = { ...ticket, status: 'Escalated', escalationLevel: ticket.escalationLevel + 1, updatedAt: now };
  await ticketDB.update(updated);
  await activityDB.add({
    id: `act-${ticketId}-escalate-${Date.now()}`,
    ticketId,
    status: 'Escalated',
    date: now,
    user: reviewerName,
    description: `Escalated to Level ${updated.escalationLevel} by ${reviewerName}. Requires approver attention.${reason ? ' Reason: ' + reason : ''}`,
    completed: true,
  });
}

export async function makeDecision(
  ticketId: string,
  decision: 'Approved' | 'Partially Approved' | 'Rejected',
  reason: string,
  decisionMaker: string
): Promise<void> {
  const ticket = await ticketDB.getById(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  const now = new Date().toISOString();
  const updated: Ticket = {
    ...ticket,
    status: decision,
    decision,
    decisionReason: reason,
    approvedBy: decisionMaker,
    approvedAt: now,
    updatedAt: now,
  };
  await ticketDB.update(updated);
  await activityDB.add({
    id: `act-${ticketId}-decision-${Date.now()}`,
    ticketId,
    status: decision,
    date: now,
    user: decisionMaker,
    description: `Final decision: ${decision}. Official reasoning: "${reason}"`,
    completed: true,
  });
  await activityDB.add({
    id: `act-${ticketId}-notified-${Date.now()}`,
    ticketId,
    status: 'Response Sent',
    date: now,
    user: 'QSRP System',
    description: 'Official response and decision reasoning delivered to submitter. Ticket closed.',
    completed: true,
  });
}

// ── React Hooks ────────────────────────────────────────────────────────────────
export function useMyTickets(userId: string | undefined) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setTickets([]); setLoading(false); return; }
    setLoading(true);
    const ts = await ticketDB.getByUser(userId);
    setTickets(ts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { tickets, loading, refetch: fetch };
}

export function useMinistryTickets(ministry: string | undefined) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!ministry) { setTickets([]); setLoading(false); return; }
    setLoading(true);
    const ts = await ticketDB.getByMinistry(ministry);
    setTickets(ts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }, [ministry]);

  useEffect(() => { fetch(); }, [fetch]);
  return { tickets, loading, refetch: fetch };
}

export function useAllTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const ts = await ticketDB.getAll();
    setTickets(ts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { tickets, loading, refetch: fetch };
}

export function useTicketDetail(id: string | undefined) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [t, acts] = await Promise.all([
      ticketDB.getById(id),
      activityDB.getByTicket(id),
    ]);
    setTicket(t || null);
    setActivities(acts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setLoading(false);
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);
  return { ticket, activities, loading, refetch: fetch };
}

export function useDocumentTickets(documentId: string | undefined) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!documentId) { setLoading(false); return; }
    setLoading(true);
    const ts = await ticketDB.getByDocument(documentId);
    setTickets(ts);
    setLoading(false);
  }, [documentId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { tickets, loading, refetch: fetch };
}
