// Mock data for the QSRP portal

export type DocumentStatus = 
  | "Draft" 
  | "Internal Review" 
  | "Approved for Public Review" 
  | "Public Review Open" 
  | "Public Review Closed" 
  | "Revision in Progress" 
  | "Final Approval Pending" 
  | "Published" 
  | "Archived";

export type TicketStatus = 
  | "Submitted"
  | "Acknowledged"
  | "AI Triaged"
  | "Assigned"
  | "In Review"
  | "Awaiting Department Response"
  | "Awaiting Legal Review"
  | "Committee Review"
  | "Approved"
  | "Partially Approved"
  | "Rejected"
  | "Escalated"
  | "Closed";

export type UserRole = "public" | "ministry_reviewer" | "approver" | "legal_committee" | "admin" | "super_admin";

export interface Document {
  id: string;
  title: string;
  referenceId: string;
  ministry: string;
  category: string;
  version: string;
  status: DocumentStatus;
  reviewStartDate?: string;
  reviewEndDate?: string;
  summary: string;
  publishedDate: string;
  totalComments?: number;
  content?: string;
}

export interface FeedbackTicket {
  id: string;
  ticketId: string;
  documentId: string;
  documentTitle: string;
  submitterName: string;
  submitterEmail: string;
  organizationType: string;
  clauseReference?: string;
  feedbackType: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  category: string;
  aiConfidence: number;
  assignedMinistry: string;
  assignedOfficer?: string;
  dueDate: string;
  status: TicketStatus;
  escalationLevel: number;
  decision?: "Approved" | "Partially Approved" | "Rejected";
  decisionReason?: string;
  submittedDate: string;
  feedbackContent: string;
  isPublic: boolean;
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

export const documents: Document[] = [
  {
    id: "1",
    title: "National Cybersecurity Standards for Financial Institutions",
    referenceId: "NCFS-2026-001",
    ministry: "Ministry of Science and Technology",
    category: "Standards",
    version: "2.1",
    status: "Public Review Open",
    reviewStartDate: "2026-03-15",
    reviewEndDate: "2026-04-30",
    summary: "Comprehensive cybersecurity framework establishing minimum security requirements for banks, financial institutions, and fintech companies operating in Pakistan. Covers data protection, incident response, access controls, and compliance monitoring.",
    publishedDate: "2026-03-15",
    totalComments: 47,
    content: `# National Cybersecurity Standards for Financial Institutions

## Chapter 1: Introduction and Scope

### 1.1 Purpose
This standard establishes minimum cybersecurity requirements for all financial institutions operating within Pakistan, including commercial banks, microfinance institutions, payment service providers, and fintech companies.

### 1.2 Applicability
All entities licensed under the State Bank of Pakistan and Securities and Exchange Commission of Pakistan regulations.

## Chapter 2: Information Security Governance

### 2.1 Board Oversight
The Board of Directors shall establish and maintain oversight of the institution's cybersecurity program through:
- Quarterly cybersecurity risk assessments
- Annual independent security audits
- Designated Chief Information Security Officer (CISO) reporting directly to the Board

### 2.2 Risk Management Framework
Institutions must implement a comprehensive risk management framework that includes:
- Asset classification and inventory
- Threat modeling and vulnerability assessment
- Risk treatment and mitigation strategies
- Continuous monitoring and improvement

## Chapter 3: Technical Security Controls

### 3.1 Access Control
- Multi-factor authentication for all privileged accounts
- Role-based access control (RBAC) implementation
- Regular access reviews and recertification
- Privileged access management (PAM) systems

### 3.2 Data Protection
- Encryption at rest and in transit for all customer data
- Data loss prevention (DLP) mechanisms
- Secure data disposal procedures
- Privacy by design principles

### 3.3 Network Security
- Network segmentation and micro-segmentation
- Intrusion detection and prevention systems (IDS/IPS)
- Regular vulnerability scanning and penetration testing
- Secure configuration of network devices

## Chapter 4: Incident Response

### 4.1 Incident Response Plan
All institutions must maintain a documented incident response plan covering:
- Detection and analysis procedures
- Containment strategies
- Eradication and recovery processes
- Post-incident review and lessons learned

### 4.2 Reporting Requirements
Critical security incidents must be reported to SBP within 2 hours of discovery.

## Chapter 5: Compliance and Enforcement

### 5.1 Audit Requirements
Annual third-party security audits are mandatory.

### 5.2 Penalties
Non-compliance may result in fines up to PKR 50 million or license suspension.`
  },
  {
    id: "2",
    title: "Revised Building Construction Safety Regulations 2026",
    referenceId: "BCSR-2026-003",
    ministry: "Ministry of Industries",
    category: "Regulations",
    version: "3.0",
    status: "Public Review Open",
    reviewStartDate: "2026-03-01",
    reviewEndDate: "2026-04-15",
    summary: "Updated construction safety standards incorporating earthquake-resistant design requirements, worker safety protocols, material quality standards, and environmental impact assessments for buildings above 3 stories.",
    publishedDate: "2026-03-01",
    totalComments: 62,
    content: `# Revised Building Construction Safety Regulations 2026

## Part I: General Provisions

### Section 1: Definitions
- "High-rise building": Any structure exceeding 23 meters (75 feet) in height
- "Competent person": Individual certified by Pakistan Engineering Council
- "Safety officer": Designated professional responsible for site safety

### Section 2: Applicability
These regulations apply to all construction projects exceeding 1000 square meters or three stories in height.

## Part II: Structural Safety

### Section 3: Seismic Design Requirements
All buildings must comply with:
- Building Code of Pakistan (Seismic Provisions) BCP-SP-2007
- Minimum seismic zone factor of 0.16g for Zone 2A
- Enhanced requirements for hospitals and schools

### Section 4: Foundation Standards
- Soil investigation mandatory for all projects
- Minimum foundation depth: 1.5 meters
- Professional engineer certification required

## Part III: Worker Safety

### Section 5: Site Safety Requirements
- Safety helmets, boots, and high-visibility vests mandatory
- Fall protection systems required above 2 meters
- First aid facilities and trained personnel on site
- Maximum working hours: 8 hours with 1 hour break

### Section 6: Equipment Safety
- Regular inspection and certification of cranes and hoists
- Load capacity markings clearly visible
- Operator licensing and certification required

## Part IV: Material Quality

### Section 7: Cement and Concrete
- Only PSQCA-certified cement allowed
- Minimum concrete strength: 3000 PSI for structural elements
- Regular testing and documentation required

### Section 8: Steel Reinforcement
- Grade 60 steel minimum for structural use
- Mill test certificates mandatory
- On-site testing at 2% frequency

## Part V: Environmental Compliance

### Section 9: Dust and Noise Control
- Water spraying during excavation
- Noise barriers where necessary
- Working hours restricted in residential areas

### Section 10: Waste Management
- Designated waste segregation areas
- Recycling of construction debris where feasible

## Part VI: Penalties

### Section 11: Violations
- First violation: Warning and 30-day correction period
- Second violation: Fine of PKR 500,000
- Third violation: Project suspension and license revocation`
  },
  {
    id: "3",
    title: "National Food Safety and Hygiene Standards",
    referenceId: "NFHS-2026-012",
    ministry: "Ministry of Health",
    category: "Standards",
    version: "1.5",
    status: "Published",
    reviewStartDate: "2025-11-01",
    reviewEndDate: "2025-12-31",
    summary: "Comprehensive food safety standards covering production, processing, packaging, storage, and distribution of food products. Includes HACCP requirements, hygiene protocols, and testing standards.",
    publishedDate: "2026-01-15",
    totalComments: 89,
  },
  {
    id: "4",
    title: "Digital Payment Systems Security Framework",
    referenceId: "DPSSF-2026-007",
    ministry: "Ministry of Commerce",
    category: "Policy",
    version: "1.0",
    status: "Public Review Open",
    reviewStartDate: "2026-03-20",
    reviewEndDate: "2026-05-10",
    summary: "Security framework for digital payment platforms, mobile wallets, and online banking systems. Establishes authentication standards, fraud prevention measures, and consumer protection guidelines.",
    publishedDate: "2026-03-20",
    totalComments: 34,
  },
  {
    id: "5",
    title: "Environmental Impact Assessment Guidelines for Industrial Projects",
    referenceId: "EIA-2026-005",
    ministry: "Ministry of Environment",
    category: "Guidelines",
    version: "2.0",
    status: "Public Review Closed",
    reviewStartDate: "2026-02-01",
    reviewEndDate: "2026-03-20",
    summary: "Mandatory EIA procedures for industrial projects with potential environmental impact. Covers baseline studies, impact prediction, mitigation measures, and monitoring requirements.",
    publishedDate: "2026-02-01",
    totalComments: 56,
  },
  {
    id: "6",
    title: "National Quality Standards for Textile Products",
    referenceId: "PSQCA-TX-2026-018",
    ministry: "Pakistan Standards & Quality Control Authority",
    category: "Standards",
    version: "4.2",
    status: "Published",
    reviewStartDate: "2025-10-15",
    reviewEndDate: "2025-12-01",
    summary: "Quality benchmarks for textile manufacturing including fiber content, colorfastness, dimensional stability, and chemical safety limits. Applies to domestic and export production.",
    publishedDate: "2026-01-20",
    totalComments: 71,
  },
  {
    id: "7",
    title: "Pharmaceutical Manufacturing Good Practices",
    referenceId: "GMP-2026-009",
    ministry: "Ministry of Health",
    category: "Regulations",
    version: "3.1",
    status: "Revision in Progress",
    reviewStartDate: "2026-01-10",
    reviewEndDate: "2026-02-28",
    summary: "Good Manufacturing Practices (GMP) for pharmaceutical production facilities. Covers facility design, equipment qualification, process validation, quality control, and documentation.",
    publishedDate: "2026-01-10",
    totalComments: 103,
  },
  {
    id: "8",
    title: "Renewable Energy Grid Integration Standards",
    referenceId: "REGIS-2026-004",
    ministry: "Ministry of Science and Technology",
    category: "Standards",
    version: "1.0",
    status: "Public Review Open",
    reviewStartDate: "2026-03-25",
    reviewEndDate: "2026-05-15",
    summary: "Technical standards for connecting solar, wind, and other renewable energy sources to the national grid. Includes power quality requirements, safety disconnects, and metering standards.",
    publishedDate: "2026-03-25",
    totalComments: 28,
  },
  {
    id: "9",
    title: "E-Commerce Consumer Protection Policy",
    referenceId: "ECCP-2026-011",
    ministry: "Ministry of Commerce",
    category: "Policy",
    version: "1.0",
    status: "Draft",
    summary: "Policy framework protecting online consumers from fraud, data breaches, and unfair business practices. Establishes dispute resolution mechanisms and seller accountability standards.",
    publishedDate: "2026-04-01",
    totalComments: 0,
  },
  {
    id: "10",
    title: "National AI Governance Framework",
    referenceId: "NAIGF-2026-002",
    ministry: "Ministry of Science and Technology",
    category: "Policy",
    version: "1.0",
    status: "Internal Review",
    summary: "Comprehensive governance framework for artificial intelligence systems deployed in government and regulated sectors. Covers accountability, transparency, bias mitigation, and safety requirements.",
    publishedDate: "2026-04-05",
    totalComments: 0,
  },
];

export const tickets: FeedbackTicket[] = [
  {
    id: "1",
    ticketId: "QSRP-2026-0847",
    documentId: "1",
    documentTitle: "National Cybersecurity Standards for Financial Institutions",
    submitterName: "Ahmed Hassan",
    submitterEmail: "citizen1@any.com",
    organizationType: "Private Sector - FinTech",
    clauseReference: "Chapter 3, Section 3.1",
    feedbackType: "Technical Concern",
    priority: "High",
    category: "Access Control",
    aiConfidence: 0.89,
    assignedMinistry: "Ministry of Science and Technology",
    assignedOfficer: "Dr. Amna Shahid",
    dueDate: "2026-04-12",
    status: "In Review",
    escalationLevel: 0,
    submittedDate: "2026-03-28",
    feedbackContent: "The requirement for multi-factor authentication on ALL privileged accounts may be overly restrictive for small microfinance institutions with limited IT infrastructure. Suggest tiering requirements based on institution size and transaction volume. Institutions under PKR 500M in assets could use MFA for critical systems only.",
    isPublic: true,
  },
  {
    id: "2",
    ticketId: "QSRP-2026-0823",
    documentId: "1",
    documentTitle: "National Cybersecurity Standards for Financial Institutions",
    submitterName: "Fatima Malik",
    submitterEmail: "legal.expert@any.com",
    organizationType: "Banking Sector",
    clauseReference: "Chapter 4, Section 4.2",
    feedbackType: "Clarification Request",
    priority: "Medium",
    category: "Incident Response",
    aiConfidence: 0.92,
    assignedMinistry: "Ministry of Science and Technology",
    assignedOfficer: "Dr. Amna Shahid",
    dueDate: "2026-04-10",
    status: "Approved",
    escalationLevel: 0,
    decision: "Approved",
    decisionReason: "Excellent point. The 2-hour reporting window will be clarified to begin from 'confirmed detection' rather than 'initial suspicion' to allow time for preliminary investigation and validation. Amendment accepted for final version.",
    submittedDate: "2026-03-26",
    feedbackContent: "The 2-hour incident reporting requirement is unclear. Does this start from the moment of detection or from the moment of confirmation? In complex environments, preliminary investigation is needed before reporting to avoid false alarms. Recommend clarifying this timeline.",
    isPublic: true,
  },
  {
    id: "3",
    ticketId: "QSRP-2026-0891",
    documentId: "2",
    documentTitle: "Revised Building Construction Safety Regulations 2026",
    submitterName: "Imran Siddiqui",
    submitterEmail: "ngo.user@any.com",
    organizationType: "Construction Industry",
    clauseReference: "Part III, Section 5",
    feedbackType: "Cost Impact",
    priority: "High",
    category: "Worker Safety",
    aiConfidence: 0.87,
    assignedMinistry: "Ministry of Industries",
    assignedOfficer: "Engr. Bilal Ahmed",
    dueDate: "2026-04-08",
    status: "Partially Approved",
    escalationLevel: 0,
    decision: "Partially Approved",
    decisionReason: "Safety equipment requirements will remain mandatory as worker safety is non-negotiable. However, the committee has approved a 6-month transition period and will work with industry associations to establish a subsidized PPE procurement program for small contractors.",
    submittedDate: "2026-03-22",
    feedbackContent: "The mandatory safety equipment requirements (helmets, boots, high-vis vests) will significantly increase costs for small contractors. Estimated additional cost of PKR 15,000 per worker. Request phased implementation over 12 months and possible subsidy program for contractors with fewer than 50 workers.",
    isPublic: true,
  },
  {
    id: "4",
    ticketId: "QSRP-2026-0856",
    documentId: "2",
    documentTitle: "Revised Building Construction Safety Regulations 2026",
    submitterName: "Dr. Ayesha Rahman",
    submitterEmail: "legal.expert@any.com",
    organizationType: "Research Institution",
    clauseReference: "Part II, Section 3",
    feedbackType: "Technical Enhancement",
    priority: "Medium",
    category: "Seismic Design",
    aiConfidence: 0.94,
    assignedMinistry: "Ministry of Industries",
    assignedOfficer: "Engr. Bilal Ahmed",
    dueDate: "2026-04-15",
    status: "Awaiting Legal Review",
    escalationLevel: 0,
    submittedDate: "2026-03-29",
    feedbackContent: "The seismic zone factor of 0.16g for Zone 2A is based on outdated 2007 data. Recent seismological studies by Pakistan Meteorological Department (2024) suggest this should be increased to 0.20g for Lahore and Islamabad regions. Recommend updating based on latest geological surveys.",
    isPublic: true,
  },
  {
    id: "5",
    ticketId: "QSRP-2026-0812",
    documentId: "4",
    documentTitle: "Digital Payment Systems Security Framework",
    submitterName: "Zainab Khan",
    submitterEmail: "ngo.user@any.com",
    organizationType: "Telecom/Payment Provider",
    clauseReference: "Section 4.3",
    feedbackType: "Implementation Challenge",
    priority: "Critical",
    category: "Authentication",
    aiConfidence: 0.91,
    assignedMinistry: "Ministry of Commerce",
    assignedOfficer: "Mr. Kashif Mahmood",
    dueDate: "2026-04-20",
    status: "Escalated",
    escalationLevel: 1,
    submittedDate: "2026-03-21",
    feedbackContent: "The proposed biometric authentication requirement for transactions above PKR 10,000 is technically problematic. Many rural users have smartphones without fingerprint sensors. This will exclude millions from digital financial services. Suggest raising threshold to PKR 50,000 or allowing SMS-OTP as alternative.",
    isPublic: true,
  },
  {
    id: "6",
    ticketId: "QSRP-2026-0902",
    documentId: "8",
    documentTitle: "Renewable Energy Grid Integration Standards",
    submitterName: "Ali Raza",
    submitterEmail: "citizen1@any.com",
    organizationType: "Energy Sector",
    clauseReference: "Chapter 2",
    feedbackType: "Regulatory Concern",
    priority: "High",
    category: "Grid Connection",
    aiConfidence: 0.88,
    assignedMinistry: "Ministry of Science and Technology",
    assignedOfficer: "Engr. Hamza Tariq",
    dueDate: "2026-04-25",
    status: "Assigned",
    escalationLevel: 0,
    submittedDate: "2026-04-01",
    feedbackContent: "The grid synchronization requirements mandate expensive equipment that may not be necessary for small solar installations under 100kW. This adds PKR 800,000 to project costs. International standards (IEEE 1547) allow simplified interconnection for small systems. Recommend tiered approach.",
    isPublic: true,
  },
  {
    id: "7",
    ticketId: "QSRP-2026-0778",
    documentId: "3",
    documentTitle: "National Food Safety and Hygiene Standards",
    submitterName: "Dr. Saman Qureshi",
    submitterEmail: "ngo.user@any.com",
    organizationType: "Food Industry Association",
    clauseReference: "Chapter 3, HACCP Section",
    feedbackType: "Implementation Challenge",
    priority: "Medium",
    category: "Food Safety",
    aiConfidence: 0.85,
    assignedMinistry: "Ministry of Health",
    assignedOfficer: "Dr. Hina Baig",
    dueDate: "2025-12-20",
    status: "Closed",
    escalationLevel: 0,
    decision: "Approved",
    decisionReason: "The HACCP implementation timeline has been extended to 18 months for SMEs. Full compliance certificate will be required upon renewal of food business license.",
    submittedDate: "2025-11-15",
    feedbackContent: "The HACCP implementation requirements are stringent for small food businesses. We request an extended timeline and simplified templates for businesses with fewer than 25 employees.",
    isPublic: true,
  },
  {
    id: "8",
    ticketId: "QSRP-2026-0933",
    documentId: "5",
    documentTitle: "Environmental Impact Assessment Guidelines",
    submitterName: "Naila Fatima",
    submitterEmail: "legal.expert@any.com",
    organizationType: "Environmental Consultancy",
    clauseReference: "Section 7 – Baseline Studies",
    feedbackType: "Technical Enhancement",
    priority: "Low",
    category: "Environmental Compliance",
    aiConfidence: 0.79,
    assignedMinistry: "Ministry of Environment",
    assignedOfficer: "Mr. Sadiq Hussain",
    dueDate: "2026-03-28",
    status: "Rejected",
    escalationLevel: 0,
    decision: "Rejected",
    decisionReason: "The current baseline study period of 1 year is consistent with international EIA standards (ISO 14001) and cannot be reduced without compromising data integrity. The request for a 6-month baseline period is not supported by scientific evidence.",
    submittedDate: "2026-02-10",
    feedbackContent: "The baseline data collection period of one year is excessive for straightforward industrial projects. Recommend reducing to 6 months for Category B projects which have limited environmental impact.",
    isPublic: true,
  },
];

export const dashboardStats = {
  totalDocuments: 234,
  underReview: 8,
  published: 198,
  totalFeedback: 2847,
  resolved: 2156,
  pending: 691,
  avgResponseTime: 8.4,
  publicParticipants: 1523,
  escalations: 47,
  ministryPerformance: [
    { ministry: "MoST", onTime: 78, delayed: 22 },
    { ministry: "MoC", onTime: 85, delayed: 15 },
    { ministry: "MoI", onTime: 62, delayed: 38 },
    { ministry: "MoH", onTime: 81, delayed: 19 },
    { ministry: "PSQCA", onTime: 73, delayed: 27 },
    { ministry: "MoE", onTime: 89, delayed: 11 },
    { ministry: "MoLJ", onTime: 91, delayed: 9 },
  ],
  feedbackTrend: [
    { month: "Oct", submitted: 234, resolved: 198 },
    { month: "Nov", submitted: 267, resolved: 223 },
    { month: "Dec", submitted: 198, resolved: 210 },
    { month: "Jan", submitted: 312, resolved: 289 },
    { month: "Feb", submitted: 289, resolved: 267 },
    { month: "Mar", submitted: 356, resolved: 298 },
  ],
  categoryDistribution: [
    { category: "Standards", count: 89, percentage: 38 },
    { category: "Regulations", count: 67, percentage: 29 },
    { category: "Policies", count: 45, percentage: 19 },
    { category: "Guidelines", count: 33, percentage: 14 },
  ],
  priorityBreakdown: [
    { priority: "Critical", count: 34, color: "#ef4444" },
    { priority: "High", count: 187, color: "#f97316" },
    { priority: "Medium", count: 312, color: "#eab308" },
    { priority: "Low", count: 158, color: "#22c55e" },
  ],
};
