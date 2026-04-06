import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { DocumentDetailPage } from "./pages/DocumentDetailPage";
import { MyTicketsPage } from "./pages/MyTicketsPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { PublicDashboardPage } from "./pages/PublicDashboardPage";
import { MinistryDashboardPage } from "./pages/MinistryDashboardPage";
import { DemoAccessPage } from "./pages/DemoAccessPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { RoleManagementPage } from "./pages/RoleManagementPage";
import { DocumentManagementPage } from "./pages/DocumentManagementPage";
import { RootLayout } from "./components/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "documents", Component: DocumentsPage },
      { path: "documents/:id", Component: DocumentDetailPage },
      { path: "my-tickets", Component: MyTicketsPage },
      { path: "tickets/:id", Component: TicketDetailPage },
      { path: "dashboard", Component: PublicDashboardPage },
      { path: "ministry-dashboard", Component: MinistryDashboardPage },
      { path: "document-management", Component: DocumentManagementPage },
      { path: "demo-access", Component: DemoAccessPage },
      { path: "admin-dashboard", Component: AdminDashboardPage },
      { path: "role-management", Component: RoleManagementPage },
    ],
  },
]);
