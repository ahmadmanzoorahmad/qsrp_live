import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  FileText, ArrowRight, CheckCircle2, AlertCircle,
  Clock, Eye, Edit3, Globe, Lock, BookOpen, Loader2,
  ChevronRight, Calendar, Building2, Shield, Plus, X,
  Upload, Link2, FileDown, Trash2, ChevronDown, Save,
  Paperclip, FileType, File
} from "lucide-react";
import { documentDB, type Document, ministries } from "../data/database";
import { useAuth, canManageDocuments } from "../contexts/AuthContext";

type DocStatus =
  | "Draft"
  | "Internal Review"
  | "Approved for Public Review"
  | "Public Review Open"
  | "Public Review Closed"
  | "Revision in Progress"
  | "Final Approval Pending"
  | "Published"
  | "Archived";

type AttachmentType = 'none' | 'url' | 'file';

const MINISTRY_DEPARTMENTS: Record<string, string[]> = {
  "Ministry of Science and Technology": [
    "Department of Science Policy",
    "Department of Technology Development",
    "Standards & Innovation Division",
    "Research & Development Unit",
    "ICT Policy Wing",
  ],
  "Ministry of Commerce": [
    "Trade Policy Division",
    "Export Promotion Bureau",
    "Import Regulation Department",
    "Trade Agreement Wing",
  ],
  "Ministry of Industries": [
    "Industrial Regulation Division",
    "Small & Medium Enterprises Department",
    "Manufacturing Standards Unit",
    "Investment Policy Wing",
  ],
  "Ministry of Health": [
    "Drug Regulatory Authority",
    "Public Health Department",
    "Medical Devices Division",
    "Food Safety Wing",
    "National Health Services",
  ],
  "Pakistan Standards & Quality Control Authority": [
    "Standards Development Division",
    "Testing & Calibration Department",
    "Market Surveillance Wing",
    "Metrology Division",
    "Certification Department",
  ],
  "Ministry of Environment": [
    "Environmental Policy Department",
    "Climate Change Division",
    "Pollution Control Wing",
    "Biodiversity Conservation Unit",
  ],
  "Ministry of Law & Justice": [
    "Legislative Drafting Division",
    "Law Reform Commission",
    "Constitutional Affairs Department",
    "Legal Aid Bureau",
  ],
  "Pakistan Digital Authority": [
    "Digital Policy Division",
    "Cybersecurity Department",
    "Digital Infrastructure Wing",
    "Data Governance Unit",
    "e-Government Services",
  ],
};

const CATEGORIES = ["Standards", "Regulations", "Policy", "Law", "Guidelines", "Amendment", "Notification"] as const;

const LIFECYCLE_STEPS: { status: DocStatus; icon: typeof FileText; color: string; description: string }[] = [
  { status: "Draft", icon: Edit3, color: "slate", description: "Initial draft — not visible to public" },
  { status: "Internal Review", icon: Eye, color: "cyan", description: "Under ministry internal review" },
  { status: "Approved for Public Review", icon: CheckCircle2, color: "teal", description: "Cleared for public consultation" },
  { status: "Public Review Open", icon: Globe, color: "emerald", description: "Public feedback collection active" },
  { status: "Public Review Closed", icon: Lock, color: "orange", description: "Review period ended — processing feedback" },
  { status: "Revision in Progress", icon: Edit3, color: "purple", description: "Document being revised based on feedback" },
  { status: "Final Approval Pending", icon: Shield, color: "amber", description: "Awaiting final approval from committee" },
  { status: "Published", icon: BookOpen, color: "blue", description: "Final published document" },
];

function getNextSteps(status: string): { label: string; newStatus: DocStatus; color: string }[] {
  switch (status) {
    case "Draft":
      return [{ label: "Submit for Internal Review", newStatus: "Internal Review", color: "cyan" }];
    case "Internal Review":
      return [
        { label: "Approve for Public Review", newStatus: "Approved for Public Review", color: "teal" },
        { label: "Return to Draft", newStatus: "Draft", color: "slate" },
      ];
    case "Approved for Public Review":
      return [{ label: "Open Public Review", newStatus: "Public Review Open", color: "emerald" }];
    case "Public Review Open":
      return [{ label: "Close Public Review", newStatus: "Public Review Closed", color: "orange" }];
    case "Public Review Closed":
      return [{ label: "Begin Revision", newStatus: "Revision in Progress", color: "purple" }];
    case "Revision in Progress":
      return [{ label: "Submit for Final Approval", newStatus: "Final Approval Pending", color: "amber" }];
    case "Final Approval Pending":
      return [
        { label: "Publish (Final)", newStatus: "Published", color: "blue" },
        { label: "Return for More Revision", newStatus: "Revision in Progress", color: "purple" },
      ];
    case "Published":
      return [{ label: "Archive Document", newStatus: "Archived", color: "slate" }];
    default:
      return [];
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Draft": return "bg-slate-100 text-slate-600";
    case "Internal Review": return "bg-cyan-100 text-cyan-700";
    case "Approved for Public Review": return "bg-teal-100 text-teal-700";
    case "Public Review Open": return "bg-emerald-100 text-emerald-700";
    case "Public Review Closed": return "bg-orange-100 text-orange-700";
    case "Revision in Progress": return "bg-purple-100 text-purple-700";
    case "Final Approval Pending": return "bg-amber-100 text-amber-700";
    case "Published": return "bg-blue-100 text-blue-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

const STEP_ORDER: DocStatus[] = [
  "Draft", "Internal Review", "Approved for Public Review",
  "Public Review Open", "Public Review Closed",
  "Revision in Progress", "Final Approval Pending", "Published"
];

function LifecycleStepper({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STEP_ORDER.indexOf(currentStatus as DocStatus);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STEP_ORDER.map((step, idx) => (
        <div key={step} className="flex items-center gap-1">
          <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            idx < currentIdx ? "bg-emerald-100 text-emerald-600" :
            idx === currentIdx ? "bg-emerald-600 text-white" :
            "bg-slate-100 text-slate-400"
          }`}>
            {step}
          </div>
          {idx < STEP_ORDER.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}

function AttachmentBadge({ doc }: { doc: Document }) {
  if (!doc.attachmentType || doc.attachmentType === 'none') return null;

  if (doc.attachmentType === 'url' && doc.attachmentUrl) {
    return (
      <a
        href={doc.attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <Link2 className="w-3.5 h-3.5" />
        External Link
      </a>
    );
  }

  if (doc.attachmentType === 'file' && doc.attachmentFileName) {
    const ext = doc.attachmentFileName.split('.').pop()?.toLowerCase() || '';
    const color = ext === 'pdf' ? 'red' : ext === 'doc' || ext === 'docx' ? 'blue' : ext === 'xls' || ext === 'xlsx' ? 'green' : 'slate';
    const colorClasses = `bg-${color}-50 text-${color}-700 hover:bg-${color}-100`;
    return (
      <a
        href={doc.attachmentData}
        download={doc.attachmentFileName}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${colorClasses}`}
        onClick={e => e.stopPropagation()}
      >
        <FileDown className="w-3.5 h-3.5" />
        {doc.attachmentFileName}
      </a>
    );
  }
  return null;
}

interface FormState {
  title: string;
  referenceId: string;
  ministry: string;
  department: string;
  category: string;
  version: string;
  summary: string;
  content: string;
  reviewStartDate: string;
  reviewEndDate: string;
  status: DocStatus;
}

const DEFAULT_FORM: FormState = {
  title: '',
  referenceId: '',
  ministry: '',
  department: '',
  category: 'Standards',
  version: '1.0',
  summary: '',
  content: '',
  reviewStartDate: '',
  reviewEndDate: '',
  status: 'Draft',
};

export function DocumentManagementPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [reviewDates, setReviewDates] = useState<Record<string, { start: string; end: string }>>({});
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [attachmentType, setAttachmentType] = useState<AttachmentType>('none');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentFileName, setAttachmentFileName] = useState('');
  const [attachmentFileType, setAttachmentFileType] = useState('');
  const [attachmentData, setAttachmentData] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => { loadDocs(); }, []);

  async function loadDocs() {
    setLoading(true);
    const docs = await documentDB.getAll();
    setDocuments(docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setLoading(false);
  }

  function openCreate() {
    setForm(DEFAULT_FORM);
    setAttachmentType('none');
    setAttachmentUrl('');
    setAttachmentFileName('');
    setAttachmentFileType('');
    setAttachmentData('');
    setSaveError('');
    setEditingDoc(null);
    setView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEdit(doc: Document) {
    setForm({
      title: doc.title,
      referenceId: doc.referenceId,
      ministry: doc.ministry,
      department: doc.department || '',
      category: doc.category,
      version: doc.version,
      summary: doc.summary,
      content: doc.content || '',
      reviewStartDate: doc.reviewStartDate || '',
      reviewEndDate: doc.reviewEndDate || '',
      status: doc.status as DocStatus,
    });
    setAttachmentType(doc.attachmentType || 'none');
    setAttachmentUrl(doc.attachmentUrl || '');
    setAttachmentFileName(doc.attachmentFileName || '');
    setAttachmentFileType(doc.attachmentFileType || '');
    setAttachmentData(doc.attachmentData || '');
    setSaveError('');
    setEditingDoc(doc);
    setView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setSaveError('File size exceeds 5 MB limit. Please choose a smaller file.');
      return;
    }
    setSaveError('');
    setAttachmentFileName(file.name);
    setAttachmentFileType(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachmentData(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function saveDocument() {
    setSaveError('');
    if (!form.title.trim()) { setSaveError('Document title is required.'); return; }
    if (!form.referenceId.trim()) { setSaveError('Reference ID is required.'); return; }
    if (!form.ministry) { setSaveError('Ministry is required.'); return; }
    if (!form.summary.trim()) { setSaveError('Summary is required.'); return; }
    if (attachmentType === 'url' && attachmentUrl && !/^https?:\/\//i.test(attachmentUrl)) {
      setSaveError('External link must start with http:// or https://');
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const docData: Partial<Document> = {
        title: form.title.trim(),
        referenceId: form.referenceId.trim(),
        ministry: form.ministry,
        department: form.department || undefined,
        category: form.category,
        version: form.version.trim() || '1.0',
        status: form.status,
        summary: form.summary.trim(),
        content: form.content.trim() || undefined,
        reviewStartDate: form.reviewStartDate || undefined,
        reviewEndDate: form.reviewEndDate || undefined,
        attachmentType,
        attachmentUrl: attachmentType === 'url' ? attachmentUrl.trim() : undefined,
        attachmentFileName: attachmentType === 'file' ? attachmentFileName : undefined,
        attachmentFileType: attachmentType === 'file' ? attachmentFileType : undefined,
        attachmentData: attachmentType === 'file' ? attachmentData : undefined,
        updatedAt: now,
      };

      if (view === 'create' || !editingDoc) {
        const newDoc: Document = {
          ...(docData as Document),
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          publishedDate: now.slice(0, 10),
          totalComments: 0,
          createdBy: user!.id,
          createdAt: now,
        };
        await documentDB.add(newDoc);
        setActionSuccess('Document created successfully.');
      } else {
        await documentDB.update({ ...editingDoc, ...docData });
        setActionSuccess('Document updated successfully.');
      }
      await loadDocs();
      setView('list');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function advanceStatus(docId: string, newStatus: DocStatus) {
    setActionLoading(docId);
    setActionError('');
    setActionSuccess('');
    try {
      const doc = await documentDB.getById(docId);
      if (!doc) throw new Error('Document not found');

      const updates: Partial<Document> = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      if (newStatus === "Public Review Open") {
        const dates = reviewDates[docId];
        if (!dates?.start || !dates?.end) {
          setActionError('Please set review start and end dates before opening public review.');
          setActionLoading(null);
          setShowDatePicker(docId);
          return;
        }
        updates.reviewStartDate = dates.start;
        updates.reviewEndDate = dates.end;
      }

      await documentDB.update({ ...doc, ...updates });
      setActionSuccess(`Status updated to "${newStatus}"`);
      await loadDocs();
      setShowDatePicker(null);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setActionLoading(null);
    }
  }

  if (!user || !canManageDocuments(user.role)) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl text-center">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-600 mb-6">Document management is available to Uploader, Admin, and Super Admin users only.</p>
        <Link to="/" className="text-emerald-600 hover:text-emerald-700 font-semibold">← Back to Home</Link>
      </div>
    );
  }

  const filteredDocs = filterStatus === "all" ? documents : documents.filter(d => d.status === filterStatus);
  const statusCounts = STEP_ORDER.reduce((acc, s) => {
    acc[s] = documents.filter(d => d.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const selectedMinistryDepts = form.ministry ? (MINISTRY_DEPARTMENTS[form.ministry] || []) : [];

  if (view === 'create' || view === 'edit') {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${view === 'create' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
              {view === 'create' ? <Plus className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4 text-blue-600" />}
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {view === 'create' ? 'Upload New Document' : `Edit: ${editingDoc?.title}`}
            </h1>
          </div>
        </div>

        {saveError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {saveError}
          </div>
        )}

        <div className="space-y-6">
          {/* Section 1 — Document Identity */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., National Cybersecurity Standards 2026"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Reference ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.referenceId}
                  onChange={e => setForm(f => ({ ...f, referenceId: e.target.value }))}
                  placeholder="e.g., MoST/STD/2026/042"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Document Version <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.version}
                  onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                  placeholder="e.g., 1.0, 2.3, Draft v4, Revised Edition"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">Use semantic versioning (1.0, 2.1) or descriptive labels (Draft v2, Final)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white pr-10"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Status</label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as DocStatus }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white pr-10"
                  >
                    {STEP_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Ministry & Department */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Ministry & Department
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ministry / Organisation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.ministry}
                    onChange={e => setForm(f => ({ ...f, ministry: e.target.value, department: '' }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white pr-10"
                  >
                    <option value="">— Select Ministry —</option>
                    {ministries.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    <option value="Pakistan Digital Authority">Pakistan Digital Authority</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department / Wing</label>
                {selectedMinistryDepts.length > 0 ? (
                  <div className="relative">
                    <select
                      value={form.department}
                      onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white pr-10"
                    >
                      <option value="">— Select Department —</option>
                      {selectedMinistryDepts.map(d => <option key={d} value={d}>{d}</option>)}
                      <option value="__other__">Other (type below)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    placeholder="e.g., Standards Development Division"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                )}
                {form.department === '__other__' && (
                  <input
                    type="text"
                    placeholder="Enter department name"
                    className="w-full mt-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    autoFocus
                  />
                )}
                <p className="text-xs text-slate-400 mt-1">Sub-division or wing within the ministry responsible for this document</p>
              </div>
            </div>
          </div>

          {/* Section 3 — Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description & Content
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Public Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                  placeholder="Brief description shown to the public on document listing pages..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Document Content</label>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Paste the full text of the document here. Citizens will read this when they open the document detail page..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4 — Attachment */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachment / Source File
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Attach the official document file or a link to the original source. Supported formats: PDF, Word (.doc/.docx), Excel (.xls/.xlsx), plain text. Max file size: 5 MB.
            </p>

            {/* Attachment type selector */}
            <div className="flex gap-3 mb-5">
              {(['none', 'url', 'file'] as AttachmentType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setAttachmentType(type); setSaveError(''); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    attachmentType === type
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {type === 'none' && <><X className="w-4 h-4" /> No Attachment</>}
                  {type === 'url' && <><Link2 className="w-4 h-4" /> External Link</>}
                  {type === 'file' && <><Upload className="w-4 h-4" /> Upload File</>}
                </button>
              ))}
            </div>

            {attachmentType === 'url' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">External Link URL</label>
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={e => setAttachmentUrl(e.target.value)}
                  placeholder="https://www.government.gov.pk/documents/example.pdf"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">Link to the document on an official government website or repository</p>
              </div>
            )}

            {attachmentType === 'file' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.odt,.ods"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {!attachmentFileName ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                  >
                    <Upload className="w-10 h-10 text-slate-300 group-hover:text-emerald-500 mx-auto mb-3 transition-colors" />
                    <p className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">Click to choose a file</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel, or plain text — max 5 MB</p>
                  </button>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <File className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{attachmentFileName}</p>
                      <p className="text-xs text-slate-400">{attachmentFileType || 'File attached'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentFileName('');
                        setAttachmentFileType('');
                        setAttachmentData('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
                    >
                      Replace
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 5 — Review Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Public Review Schedule
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Set the dates when public feedback will be open. These can also be updated later when advancing the lifecycle to "Public Review Open".
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Review Start Date</label>
                <input
                  type="date"
                  value={form.reviewStartDate}
                  onChange={e => setForm(f => ({ ...f, reviewStartDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Review End Date</label>
                <input
                  type="date"
                  value={form.reviewEndDate}
                  onChange={e => setForm(f => ({ ...f, reviewEndDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="flex items-center gap-4 pb-8">
            <button
              onClick={saveDocument}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving...' : view === 'create' ? 'Upload Document' : 'Save Changes'}
            </button>
            <button
              onClick={() => setView('list')}
              disabled={saving}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Document Management</h1>
            </div>
          </div>
          <p className="text-slate-600">
            Upload new documents and advance them through the publication lifecycle.
            Logged in as <span className="font-medium">{user.name}</span>
            <span className="ml-1 text-slate-400">({user.role.replace(/_/g, ' ')})</span>
            {user.ministry && <span className="ml-1 text-slate-400">— {user.ministry}</span>}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          Upload New Document
        </button>
      </div>

      {/* Stage Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">Stage Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {LIFECYCLE_STEPS.map(({ status, icon: Icon, description }) => (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? "all" : status)}
              title={description}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                filterStatus === status ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className={`text-2xl font-bold mb-1 ${statusCounts[status] > 0 ? "text-emerald-600" : "text-slate-300"}`}>
                {statusCounts[status] || 0}
              </div>
              <div className={`text-xs font-medium leading-tight ${getStatusColor(status)} px-1.5 py-0.5 rounded-full`}>
                {status === "Approved for Public Review" ? "Approved" : status}
              </div>
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {actionSuccess}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading documents...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map(doc => {
            const nextSteps = getNextSteps(doc.status);
            const isLoading = actionLoading === doc.id;
            const needsDates = showDatePicker === doc.id;

            return (
              <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {doc.category}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-mono">
                        v{doc.version}
                      </span>
                      <AttachmentBadge doc={doc} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{doc.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {doc.referenceId}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {doc.ministry}
                        {doc.department && <span className="text-slate-400"> › {doc.department}</span>}
                      </span>
                      {doc.reviewEndDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Review until {doc.reviewEndDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(doc)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <Link
                      to={`/documents/${doc.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Link>
                  </div>
                </div>

                {/* Lifecycle Progress */}
                <div className="mb-4 overflow-x-auto pb-1">
                  <LifecycleStepper currentStatus={doc.status} />
                </div>

                {/* Date picker for public review */}
                {needsDates && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <h4 className="font-medium text-emerald-900 mb-3 text-sm">Set Public Review Period</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-emerald-800 mb-1">Review Start Date</label>
                        <input
                          type="date"
                          value={reviewDates[doc.id]?.start || ''}
                          onChange={e => setReviewDates(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], start: e.target.value } }))}
                          className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-emerald-800 mb-1">Review End Date</label>
                        <input
                          type="date"
                          value={reviewDates[doc.id]?.end || ''}
                          onChange={e => setReviewDates(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], end: e.target.value } }))}
                          className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => advanceStatus(doc.id, "Public Review Open")}
                      disabled={isLoading}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                      Confirm & Open Public Review
                    </button>
                  </div>
                )}

                {/* Next Step Actions */}
                {nextSteps.length > 0 && !needsDates && (
                  <div className="flex flex-wrap gap-2">
                    {nextSteps.map(step => (
                      <button
                        key={step.newStatus}
                        onClick={() => {
                          if (step.newStatus === "Public Review Open") {
                            setShowDatePicker(doc.id);
                            setActionError('');
                          } else {
                            advanceStatus(doc.id, step.newStatus);
                          }
                        }}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                          step.color === 'emerald' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                          step.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                          step.color === 'amber' ? 'bg-amber-500 text-white hover:bg-amber-600' :
                          step.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                          step.color === 'orange' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                          step.color === 'cyan' ? 'bg-cyan-600 text-white hover:bg-cyan-700' :
                          step.color === 'teal' ? 'bg-teal-600 text-white hover:bg-teal-700' :
                          'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        {step.label}
                      </button>
                    ))}
                  </div>
                )}

                {doc.status === "Published" && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Document is published and publicly accessible.
                  </div>
                )}
              </div>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents in this stage</h3>
              <p className="text-slate-600 mb-6">Select a different stage filter or upload a new document.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setFilterStatus("all")} className="text-emerald-600 font-medium hover:text-emerald-700">
                  View All Documents →
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={openCreate} className="text-emerald-600 font-medium hover:text-emerald-700">
                  Upload New Document →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
