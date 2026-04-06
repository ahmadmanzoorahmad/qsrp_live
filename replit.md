# Qanoon & Standards Review Portal (QSRP)

## Project Overview
A government-grade digital platform for publishing laws, standards, and regulations with public review, AI-based feedback tracking, and full end-to-end document lifecycle workflow for Pakistan. All data is stored in-browser via IndexedDB — no backend required.

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 + Radix UI + shadcn/ui
- **Routing**: React Router v7
- **State**: React Context API (AuthContext)
- **Storage**: IndexedDB v3 (client-side persistence, no backend)
- **Charts**: Recharts
- **Animations**: Motion (Framer Motion)

## User Roles
- `public` – Submitters and organizations (anyone can register)
- `ministry_reviewer` – Government officials reviewing feedback (@gov.pk required in Live Mode)
- `approver` – Committee members making final decisions
- `legal_committee` – Legal reviewers
- `executive` – Read-only overview role (senior leadership visibility)
- `auditor` – Read-only audit role (oversight across all tickets)
- `admin` – Portal administrator (PDA)
- `super_admin` – Director-level full access

## Role Capabilities
- `canReviewTickets` — ministry_reviewer, approver, legal_committee, admin, super_admin
- `canApproveTickets` — approver, admin, super_admin
- `canManageDocuments` — admin, super_admin (document lifecycle management)
- `canAccessMinistryDashboard` — ministry_reviewer, approver, legal_committee, executive, auditor, admin, super_admin
- `canAccessAdminDashboard` — executive, auditor, admin, super_admin

## Operating Modes
- **Demo Mode**: Amber banner visible; sandbox data; 11 pre-built demo profiles; instant "Login as this Profile" switching; "Reset Demo Data"
- **Live Mode**: Real password authentication enforced; @gov.pk domain required for government roles

## Demo User Profiles (11)
- **Public**: citizen1@any.com, ngo.user@any.com, legal.expert@any.com
- **Reviewers**: reviewer.moitt@gov.pk, reviewer.law@gov.pk, reviewer.standards@gov.pk
- **Approvers**: approver.committee1@gov.pk, approver.legal@gov.pk, approver.final@gov.pk
- **Admin**: admin.pda@gov.pk
- **Super Admin**: superadmin.pda@gov.pk

## Live Credential Accounts (8, with passwords)
- `ctlive@gov.pk` / `ct12345` — citizen
- `mrlive@gov.pk` / `mr12345` — ministry_reviewer (MoST)
- `aplive@gov.pk` / `ap12345` — approver
- `lelive@gov.pk` / `le12345` — legal_committee (MoLJ)
- `exelive@gov.pk` / `exe12345` — executive
- `audlive@gov.pk` / `aud12345` — auditor
- `adlive@gov.pk` / `ad12345` — admin
- `salive@gov.pk` / `sa12345` — super_admin

## Document Lifecycle (8 Stages)
1. Draft
2. Internal Review
3. Public Review Open (requires review start/end dates)
4. Public Review Closed
5. Ministry Review
6. Final Decision
7. Revision in Progress
8. Final Publication

Admin/Super Admin can advance documents through stages via `/document-management`.

## Feedback & Ticket Workflow
1. Citizen submits clause-wise feedback on a document in Public Review
2. System auto-generates a ticket with AI classification (topic, priority, sentiment)
3. Ministry Reviewer adds notes, forwards to Legal if needed, or escalates
4. Approver makes decision: Approved / Partially Approved / Rejected (with reasoning)
5. Response is published transparently on the ticket and citizen is notified

## Key Pages / Routes
- `/` – Homepage (hero, stats, active reviews, how-it-works)
- `/documents` – Browse all documents with filters (ministry, status, category)
- `/documents/:id` – Document detail with content viewer and feedback submission
- `/my-tickets` – User's submitted feedback tracker (all tickets for admin/auditor/executive)
- `/tickets/:id` – Full ticket detail with workflow timeline + role-based actions
- `/dashboard` – Public transparency dashboard with charts
- `/ministry-dashboard` – Ministry reviewer + executive/auditor dashboard
- `/document-management` – Admin-only document lifecycle manager (8 stages)
- `/demo-access` – Demo/Live credential reference with two tabs
- `/admin-dashboard` – Admin analytics (executive/auditor/admin/super_admin)
- `/role-management` – User role management table (admin/super_admin only)

## Project Structure
```
src/
  app/
    components/
      RootLayout.tsx        # Nav with demo banner, role-based navigation, user menu
      LoginModal.tsx        # Login with quick demo profile access + live credentials
      ui/                   # shadcn/ui components
    contexts/
      AuthContext.tsx       # Auth, demo/live mode, password auth, role helpers
    data/
      database.ts           # IndexedDB v3 + live users + seedDatabase + resetDemoData
      mockData.ts           # 10 documents, 8 tickets, ministries, dashboard stats
    hooks/
      useTickets.ts         # AI classification + all ticket CRUD + 5 React hooks
    pages/
      HomePage.tsx, DocumentsPage.tsx, DocumentDetailPage.tsx
      MyTicketsPage.tsx, TicketDetailPage.tsx
      PublicDashboardPage.tsx, MinistryDashboardPage.tsx
      DocumentManagementPage.tsx   # Admin document lifecycle
      DemoAccessPage.tsx           # Demo/Live credentials with tabs
      AdminDashboardPage.tsx       # Admin analytics
      RoleManagementPage.tsx       # User role management
    routes.tsx              # All routes
  styles/                   # Global CSS, Tailwind, theme
  main.tsx
index.html
vite.config.ts
```

## Development
- **Run**: `npm run dev` (port 5000, host 0.0.0.0)
- **Build**: `npm run build`
- **Package Manager**: npm

## Deployment
- Configured as **static** deployment
- Build command: `npm run build`
- Public directory: `dist`
