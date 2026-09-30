import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "./AppLayout";
import { SuperAdminLayout } from "./SuperAdminLayout";
import { NotFoundPage } from "./NotFoundPage";
import { RouteErrorBoundary } from "./RouteErrorBoundary";
import { LandingPage } from "./landing/LandingPage";
import { DashboardPage } from "./dashboard/DashboardPage";
import { AccountPage } from "../features/account/pages/AccountPage";
import { UsersPage } from "../features/users/pages/UsersPage";
import { WalletPage } from "../features/wallet/pages/WalletPage";
import { SenderIdsPage } from "../features/sender-ids/pages/SenderIdsPage";
import { PricingPage } from "../features/pricing/pages/PricingPage";
import { AppsPage } from "../features/apps/pages/AppsPage";
import { AppDetailPage } from "../features/apps/pages/AppDetailPage";
import { SendMessagePage } from "../features/apps/pages/SendMessagePage";
import { SendPage } from "../features/messaging/pages/SendPage";
import { SuperAdminDashboard } from "../features/super-admin/pages/SuperAdminDashboard";
import { SuperAdminTenantsPage } from "../features/super-admin/pages/SuperAdminTenantsPage";
import { SuperAdminUsersPage } from "../features/super-admin/pages/SuperAdminUsersPage";
import { SuperAdminProvidersPage } from "../features/super-admin/pages/SuperAdminProvidersPage";
import { SuperAdminPricingPage } from "../features/super-admin/pages/SuperAdminPricingPage";
import { SuperAdminAuditLogsPage } from "../features/super-admin/pages/SuperAdminAuditLogsPage";
import { SuperAdminSenderIdsPage } from "../features/super-admin/pages/SuperAdminSenderIdsPage";
import { SuperAdminSettingsPage } from "../features/super-admin/pages/SuperAdminSettingsPage";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage />, errorElement: <RouteErrorBoundary /> },
  {
    path: "/login",
    element: <Navigate to="/" state={{ openLogin: true }} replace />,
  },

  // ── Regular tenant portal ──────────────────────────────────────────────
  {
    path: "/app",
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { index: true, element: <DashboardPage />, errorElement: <RouteErrorBoundary /> },
          { path: "account", element: <AccountPage />, errorElement: <RouteErrorBoundary /> },
          { path: "users", element: <UsersPage />, errorElement: <RouteErrorBoundary /> },
          { path: "wallet", element: <WalletPage />, errorElement: <RouteErrorBoundary /> },
          { path: "sender-ids", element: <SenderIdsPage />, errorElement: <RouteErrorBoundary /> },
          { path: "pricing", element: <PricingPage />, errorElement: <RouteErrorBoundary /> },
          { path: "send", element: <SendPage />, errorElement: <RouteErrorBoundary /> },
          { path: "apps", element: <AppsPage />, errorElement: <RouteErrorBoundary /> },
          { path: "apps/:appId", element: <AppDetailPage />, errorElement: <RouteErrorBoundary /> },
          { path: "apps/:appId/send", element: <SendMessagePage />, errorElement: <RouteErrorBoundary /> },
        ],
      },
    ],
  },

  // ── Super Admin portal ────────────────────────────────────────────────
  {
    path: "/super-admin",
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <SuperAdminLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { index: true, element: <SuperAdminDashboard />, errorElement: <RouteErrorBoundary /> },
          { path: "tenants", element: <SuperAdminTenantsPage />, errorElement: <RouteErrorBoundary /> },
          { path: "users", element: <SuperAdminUsersPage />, errorElement: <RouteErrorBoundary /> },
          { path: "sender-ids", element: <SuperAdminSenderIdsPage />, errorElement: <RouteErrorBoundary /> },
          { path: "providers", element: <SuperAdminProvidersPage />, errorElement: <RouteErrorBoundary /> },
          { path: "pricing", element: <SuperAdminPricingPage />, errorElement: <RouteErrorBoundary /> },
          { path: "audit-logs", element: <SuperAdminAuditLogsPage />, errorElement: <RouteErrorBoundary /> },
          { path: "settings", element: <SuperAdminSettingsPage />, errorElement: <RouteErrorBoundary /> },
        ],
      },
    ],
  },

  { path: "*", element: <NotFoundPage />, errorElement: <RouteErrorBoundary /> },
]);
