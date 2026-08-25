import { PrivateLayout } from "@/components/router/private-layout";
import { ProtectedRoute, PublicRoute } from "@/components/router/protected-route";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Login = lazy(() => import("@/app/auth/login/LoginPage"));
const Dashboard = lazy(() => import("@/app/dashboard/page"));
const AccountSettings = lazy(() => import("@/app/settings/account/page"));
const Modules = lazy(() => import("@/app/modules/ModulesPage"));
const SubscriptionPlans = lazy(() => import("@/app/plans/PlansPage"));
const SoldSubscriptions = lazy(() => import("@/app/soldSubscriptions/SoldSubscriptionsPage"));
const UserGuides = lazy(() => import("@/app/guides/GuidesPage"));
const FinanceIncome = lazy(() => import("@/app/finance/income/IncomePage"));
const FinanceExpense = lazy(() => import("@/app/finance/expense/ExpensePage"));
const FinanceCategories = lazy(() => import("@/app/finance/categories/FinanceCategoriesPage"));
const SystemConfig = lazy(() => import("@/app/systemConfig/SystemConfigPage"));
const NotFound = lazy(() => import("@/app/errors/not-found/page"));
const Forbidden = lazy(() => import("@/app/errors/forbidden/page"));
const InternalServerError = lazy(() => import("@/app/errors/internal-server-error/page"));

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
  {
    path: "/",
    element: <Navigate to="dashboard" replace />,
  },

  {
    path: "/",
    element: <PublicRoute />,
    children: [{ path: "login", element: <Login /> }],
  },

  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <PrivateLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "modules", element: <Modules /> },
          { path: "subscription-plans", element: <SubscriptionPlans /> },
          { path: "sold-subscriptions", element: <SoldSubscriptions /> },
          { path: "user-guides", element: <UserGuides /> },
          { path: "finance/income", element: <FinanceIncome /> },
          { path: "finance/expense", element: <FinanceExpense /> },
          { path: "finance/categories", element: <FinanceCategories /> },
          { path: "system-config", element: <SystemConfig /> },
          { path: "settings/account", element: <AccountSettings /> },
        ],
      },
    ],
  },

  { path: "403", element: <Forbidden /> },
  { path: "500", element: <InternalServerError /> },

  {
    path: "*",
    element: <NotFound />,
  },
];
