const DB_NAME = 'QSRPDatabase';
const DB_VERSION = 3;

let db: IDBDatabase | null = null;

export type UserRole = 'public' | 'ministry_reviewer' | 'approver' | 'legal_committee' | 'executive' | 'auditor' | 'uploader' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  ministry?: string;
  department?: string;
  designation?: string;
  password?: string;
  isDemo?: boolean;
  isActive?: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  referenceId: string;
  ministry: string;
  department?: string;
  category: string;
  version: string;
  status: string;
  reviewStartDate?: string;
  reviewEndDate?: string;
  summary: string;
  publishedDate: string;
  totalComments?: number;
  content?: string;
  attachmentType?: 'none' | 'url' | 'file';
  attachmentUrl?: string;
  attachmentFileName?: string;
  attachmentFileType?: string;
  attachmentData?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  ticketId: string;
  documentId: string;
  documentTitle: string;
  submitterName: string;
  submitterEmail: string;
  submitterId: string;
  organizationType: string;
  clauseReference?: string;
  feedbackType: string;
  priority: string;
  category: string;
  aiConfidence: number;
  assignedMinistry: string;
  assignedOfficer?: string;
  dueDate: string;
  status: string;
  escalationLevel: number;
  decision?: string;
  decisionReason?: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  legalNotes?: string;
  submittedDate: string;
  feedbackContent: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  ticketId: string;
  status: string;
  date: string;
  user: string;
  description: string;
  completed: boolean;
}

export interface Ministry {
  id: string;
  name: string;
  shortName: string;
  totalDocuments: number;
  pendingTickets: number;
  avgResponseTime: number;
}

export const ministries: Ministry[] = [
  { id: "1", name: "Ministry of Science and Technology", shortName: "MoST", totalDocuments: 45, pendingTickets: 23, avgResponseTime: 8 },
  { id: "2", name: "Ministry of Commerce", shortName: "MoC", totalDocuments: 38, pendingTickets: 15, avgResponseTime: 6 },
  { id: "3", name: "Ministry of Industries", shortName: "MoI", totalDocuments: 52, pendingTickets: 31, avgResponseTime: 12 },
  { id: "4", name: "Ministry of Health", shortName: "MoH", totalDocuments: 67, pendingTickets: 19, avgResponseTime: 7 },
  { id: "5", name: "Pakistan Standards & Quality Control Authority", shortName: "PSQCA", totalDocuments: 89, pendingTickets: 42, avgResponseTime: 10 },
  { id: "6", name: "Ministry of Environment", shortName: "MoE", totalDocuments: 34, pendingTickets: 12, avgResponseTime: 5 },
  { id: "7", name: "Ministry of Law & Justice", shortName: "MoLJ", totalDocuments: 29, pendingTickets: 8, avgResponseTime: 9 },
];

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      if (!database.objectStoreNames.contains('users')) {
        const userStore = database.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
        userStore.createIndex('role', 'role', { unique: false });
      }

      if (!database.objectStoreNames.contains('documents')) {
        const docStore = database.createObjectStore('documents', { keyPath: 'id' });
        docStore.createIndex('ministry', 'ministry', { unique: false });
        docStore.createIndex('status', 'status', { unique: false });
        docStore.createIndex('category', 'category', { unique: false });
      }

      if (!database.objectStoreNames.contains('tickets')) {
        const ticketStore = database.createObjectStore('tickets', { keyPath: 'id' });
        ticketStore.createIndex('documentId', 'documentId', { unique: false });
        ticketStore.createIndex('submitterId', 'submitterId', { unique: false });
        ticketStore.createIndex('assignedMinistry', 'assignedMinistry', { unique: false });
        ticketStore.createIndex('status', 'status', { unique: false });
      }

      if (!database.objectStoreNames.contains('activities')) {
        const activityStore = database.createObjectStore('activities', { keyPath: 'id' });
        activityStore.createIndex('ticketId', 'ticketId', { unique: false });
      }

      // v2 → v3: clear old data so live users + extended ticket fields get seeded fresh
      if (oldVersion > 0 && oldVersion < 3) {
        if (database.objectStoreNames.contains('users')) {
          const tx = (event.target as IDBOpenDBRequest).transaction!;
          tx.objectStore('users').clear();
          tx.objectStore('documents').clear();
          tx.objectStore('tickets').clear();
          tx.objectStore('activities').clear();
        }
      }
    };
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getById<T>(storeName: string, id: string): Promise<T | undefined> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function add<T>(storeName: string, data: T): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function update<T>(storeName: string, data: T): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function remove(storeName: string, id: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function clearStore(storeName: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export const userDB = {
  getAll: () => getAll<User>('users'),
  getById: (id: string) => getById<User>('users', id),
  getByEmail: async (email: string) => {
    const users = await getByIndex<User>('users', 'email', email);
    return users[0];
  },
  getByRole: (role: string) => getByIndex<User>('users', 'role', role),
  add: (user: User) => add('users', user),
  update: (user: User) => update('users', user),
  delete: (id: string) => remove('users', id),
  clear: () => clearStore('users'),
};

export const documentDB = {
  getAll: () => getAll<Document>('documents'),
  getById: (id: string) => getById<Document>('documents', id),
  getByMinistry: (ministry: string) => getByIndex<Document>('documents', 'ministry', ministry),
  getByStatus: (status: string) => getByIndex<Document>('documents', 'status', status),
  add: (doc: Document) => add('documents', doc),
  update: (doc: Document) => update('documents', doc),
  delete: (id: string) => remove('documents', id),
  clear: () => clearStore('documents'),
};

export const ticketDB = {
  getAll: () => getAll<Ticket>('tickets'),
  getById: (id: string) => getById<Ticket>('tickets', id),
  getByDocument: (documentId: string) => getByIndex<Ticket>('tickets', 'documentId', documentId),
  getByUser: (userId: string) => getByIndex<Ticket>('tickets', 'submitterId', userId),
  getByMinistry: (ministry: string) => getByIndex<Ticket>('tickets', 'assignedMinistry', ministry),
  add: (ticket: Ticket) => add('tickets', ticket),
  update: (ticket: Ticket) => update('tickets', ticket),
  delete: (id: string) => remove('tickets', id),
  clear: () => clearStore('tickets'),
};

export const activityDB = {
  getAll: () => getAll<Activity>('activities'),
  getById: (id: string) => getById<Activity>('activities', id),
  getByTicket: (ticketId: string) => getByIndex<Activity>('activities', 'ticketId', ticketId),
  add: (activity: Activity) => add('activities', activity),
  update: (activity: Activity) => update('activities', activity),
  delete: (id: string) => remove('activities', id),
  clear: () => clearStore('activities'),
};

// === DEMO USERS (no password required in demo mode) ===
export const DEMO_USERS: User[] = [
  {
    id: 'demo-citizen1',
    email: 'citizen1@any.com',
    name: 'Tariq Mahmood',
    role: 'public',
    designation: 'Private Citizen',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-ngo',
    email: 'ngo.user@any.com',
    name: 'Sana Mirza',
    role: 'public',
    designation: 'NGO Representative – Pakistan Policy Institute',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-legal-expert',
    email: 'legal.expert@any.com',
    name: 'Barrister Khalid Rana',
    role: 'public',
    designation: 'Legal Expert – Independent Consultant',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-reviewer-moitt',
    email: 'reviewer.moitt@gov.pk',
    name: 'Dr. Amna Shahid',
    role: 'ministry_reviewer',
    ministry: 'Ministry of Science and Technology',
    designation: 'Senior Policy Analyst',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-reviewer-law',
    email: 'reviewer.law@gov.pk',
    name: 'Asad Karim',
    role: 'ministry_reviewer',
    ministry: 'Ministry of Law & Justice',
    designation: 'Legal Reviewer',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-reviewer-standards',
    email: 'reviewer.standards@gov.pk',
    name: 'Eng. Rafia Noor',
    role: 'ministry_reviewer',
    ministry: 'Pakistan Standards & Quality Control Authority',
    designation: 'Standards Engineer',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-approver-committee1',
    email: 'approver.committee1@gov.pk',
    name: 'Dr. Nadia Hussain',
    role: 'approver',
    ministry: 'Ministry of Science and Technology',
    designation: 'Technical Committee Chair',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-approver-legal',
    email: 'approver.legal@gov.pk',
    name: 'Justice (Rtd.) Imtiaz Sipra',
    role: 'approver',
    ministry: 'Ministry of Law & Justice',
    designation: 'Legal Committee Approver',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-approver-final',
    email: 'approver.final@gov.pk',
    name: 'Mr. Zaheer Abbas',
    role: 'approver',
    ministry: 'Pakistan Digital Authority',
    designation: 'Final Approver – PDA',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-admin-pda',
    email: 'admin.pda@gov.pk',
    name: 'Ms. Rukhsana Toor',
    role: 'admin',
    ministry: 'Pakistan Digital Authority',
    designation: 'Portal Administrator – PDA',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-superadmin-pda',
    email: 'superadmin.pda@gov.pk',
    name: 'Mr. Faisal Qureshi',
    role: 'super_admin',
    ministry: 'Pakistan Digital Authority',
    designation: 'Director General – PDA',
    isDemo: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// === LIVE USERS (password required) ===
export const LIVE_USERS: User[] = [
  {
    id: 'live-citizen-1',
    email: 'ctlive@gov.pk',
    name: 'Ali Imran Khan',
    role: 'public',
    designation: 'Registered Citizen',
    password: 'ct12345',
    isDemo: false,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'live-reviewer-1',
    email: 'mrlive@gov.pk',
    name: 'Dr. Zara Malik',
    role: 'ministry_reviewer',
    ministry: 'Ministry of Science and Technology',
    designation: 'Senior Policy Analyst',
    password: 'mr12345',
    isDemo: false,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'live-approver-1',
    email: 'aplive@gov.pk',
    name: 'Mr. Hassan Farouk',
    role: 'approver',
    ministry: 'Pakistan Digital Authority',
    designation: 'Committee Approver',
    password: 'ap12345',
    isDemo: false,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'live-legal-1',
    email: 'lelive@gov.pk',
    name: 'Adv. Sana Mirza',
    role: 'legal_committee',
    ministry: 'Ministry of Law & Justice',
    designation: 'Legal Committee Member',
    password: 'le12345',
    isDemo: false,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'live-executive-1',
    email: 'exelive@gov.pk',
    name: 'Secretary Nadia Rehman',
    role: 'executive',
    ministry: 'Pakistan Digital Authority',
    designation: 'Executive Secretary – PDA',
    password: 'exe12345',
    isDemo: false,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'live-auditor-1',
    email: 'audlive@gov.pk',
    name: 'Syed Bilal Chaudhry',
    role: 'auditor',
    ministry: 'Pakistan Digital Authority',
    designation: 'Platform Auditor – PDA',
    password: 'aud12345',
    isDemo: false,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'live-uploader-1',
    email: 'uplive@gov.pk',
    name: 'Ms. Hira Baig',
    role: 'uploader',
    ministry: 'Ministry of Science and Technology',
    designation: 'Document Uploader – MoST',
    password: 'up12345',
    isDemo: false,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'live-admin-1',
    email: 'adlive@gov.pk',
    name: 'Ms. Amna Siddiqui',
    role: 'admin',
    ministry: 'Pakistan Digital Authority',
    designation: 'Portal Administrator – PDA',
    password: 'ad12345',
    isDemo: false,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'live-superadmin-1',
    email: 'salive@gov.pk',
    name: 'DG Muhammad Tariq Baig',
    role: 'super_admin',
    ministry: 'Pakistan Digital Authority',
    designation: 'Director General – PDA',
    password: 'sa12345',
    isDemo: false,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export async function seedDatabase() {
  // Always ensure all users exist (idempotent)
  const allUsers = [...DEMO_USERS, ...LIVE_USERS];
  for (const u of allUsers) {
    const existing = await userDB.getById(u.id);
    if (!existing) {
      try { await userDB.add(u); } catch { /* already exists */ }
    } else {
      // Update existing to ensure password field is current
      try { await userDB.update({ ...existing, ...u }); } catch { /* ignore */ }
    }
  }

  const documents = await documentDB.getAll();
  if (documents.length > 0) return;

  const { documents: mockDocs, tickets: mockTickets } = await import('./mockData');

  for (const doc of mockDocs) {
    const document: Document = {
      ...doc,
      createdBy: 'demo-admin-pda',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await documentDB.add(document);
  }

  for (const ticket of mockTickets) {
    const ticketData: Ticket = {
      ...ticket,
      submitterId: 'demo-citizen1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await ticketDB.add(ticketData);

    const activities: Activity[] = [
      {
        id: `activity-${ticket.id}-submitted`,
        ticketId: ticket.id,
        status: 'Submitted',
        date: ticket.submittedDate,
        user: ticket.submitterName,
        description: 'Feedback submitted by citizen',
        completed: true,
      },
      {
        id: `activity-${ticket.id}-acknowledged`,
        ticketId: ticket.id,
        status: 'Acknowledged',
        date: ticket.submittedDate,
        user: 'QSRP System',
        description: 'Automatic acknowledgment sent to submitter',
        completed: true,
      },
      {
        id: `activity-${ticket.id}-triaged`,
        ticketId: ticket.id,
        status: 'AI Triaged',
        date: ticket.submittedDate,
        user: 'AI Engine',
        description: `Classified as "${ticket.category}" – ${Math.round(ticket.aiConfidence * 100)}% confidence. Priority set to ${ticket.priority}.`,
        completed: true,
      },
      {
        id: `activity-${ticket.id}-assigned`,
        ticketId: ticket.id,
        status: 'Assigned',
        date: ticket.submittedDate,
        user: 'Routing Engine',
        description: `Routed to ${ticket.assignedMinistry}${ticket.assignedOfficer ? ' / ' + ticket.assignedOfficer : ''}`,
        completed: true,
      },
    ];

    if (ticket.decision) {
      activities.push({
        id: `activity-${ticket.id}-decision`,
        ticketId: ticket.id,
        status: ticket.decision,
        date: ticket.dueDate,
        user: ticket.assignedOfficer || 'Committee',
        description: `Final decision: ${ticket.decision}. ${ticket.decisionReason || ''}`,
        completed: true,
      });
    }

    for (const activity of activities) {
      await activityDB.add(activity);
    }
  }

  console.log('QSRP Database seeded successfully!');
}

export async function resetDemoData() {
  await documentDB.clear();
  await ticketDB.clear();
  await activityDB.clear();
  await userDB.clear();
  db = null;
  await initDB();
  await seedDatabase();
  console.log('Demo data reset successfully!');
}
