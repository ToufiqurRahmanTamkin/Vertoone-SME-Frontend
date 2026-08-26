import { PrivateLayout } from "@/components/router/private-layout";
import { RootRedirect } from "@/components/router/root-redirect";
import { ProtectedRoute, PublicRoute } from "@/components/router/protected-route";
import { getMenuLeafPaths } from "@/config/navigation";
import { lazy } from "react";

const Login = lazy(() => import("@/app/auth/login/LoginPage"));
const Register = lazy(() => import("@/app/auth/register/RegisterPage"));
const ForgotPassword = lazy(() => import("@/app/auth/forgot-password/ForgotPasswordPage"));
const Companies = lazy(() => import("@/app/companies/CompaniesPage"));
const MyCompany = lazy(() => import("@/app/myCompany/MyCompanyPage"));
const Dashboard = lazy(() => import("@/app/dashboard/page"));
const AccountSettings = lazy(() => import("@/app/settings/account/page"));
const SubscriptionPlans = lazy(() => import("@/app/plans/PlansPage"));
const SoldSubscriptions = lazy(() => import("@/app/soldSubscriptions/SoldSubscriptionsPage"));
const UserGuides = lazy(() => import("@/app/guides/GuidesPage"));
const FinanceIncome = lazy(() => import("@/app/finance/income/IncomePage"));
const FinanceExpense = lazy(() => import("@/app/finance/expense/ExpensePage"));
const FinanceCategories = lazy(() => import("@/app/finance/categories/FinanceCategoriesPage"));
const SystemConfig = lazy(() => import("@/app/systemConfig/SystemConfigPage"));
const Emails = lazy(() => import("@/app/emails/EmailsPage"));
const SystemActivity = lazy(() => import("@/app/activity/ActivityPage"));
const DataWipe = lazy(() => import("@/app/dataWipe/DataWipePage"));
const Reports = lazy(() => import("@/app/reports/ReportsPage"));
const RevenueReport = lazy(() => import("@/app/reports/RevenueReportPage"));
const SubscriptionsReport = lazy(() => import("@/app/reports/SubscriptionsReportPage"));
const PlansReport = lazy(() => import("@/app/reports/PlansReportPage"));
const FinanceReport = lazy(() => import("@/app/reports/FinanceReportPage"));
const CustomersReport = lazy(() => import("@/app/reports/CustomersReportPage"));
const SecurityReport = lazy(() => import("@/app/reports/SecurityReportPage"));
const CompanyProfile = lazy(() => import("@/app/organization/CompanyProfilePage"));
const SisterConcerns = lazy(() => import("@/app/organization/SisterConcernsPage"));
const ModulePlaceholder = lazy(() => import("@/app/placeholder/ModulePlaceholderPage"));
const NotFound = lazy(() => import("@/app/errors/not-found/page"));
const Forbidden = lazy(() => import("@/app/errors/forbidden/page"));
const InternalServerError = lazy(() => import("@/app/errors/internal-server-error/page"));

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

const builtRoutes: RouteConfig[] = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "companies", element: <Companies /> },
  { path: "my-company", element: <MyCompany /> },
  { path: "subscription-plans", element: <SubscriptionPlans /> },
  { path: "sold-subscriptions", element: <SoldSubscriptions /> },
  { path: "user-guides", element: <UserGuides /> },
  { path: "finance/income", element: <FinanceIncome /> },
  { path: "finance/expense", element: <FinanceExpense /> },
  { path: "finance/categories", element: <FinanceCategories /> },
  { path: "reports", element: <Reports /> },
  { path: "reports/revenue", element: <RevenueReport /> },
  { path: "reports/subscriptions", element: <SubscriptionsReport /> },
  { path: "reports/plans", element: <PlansReport /> },
  { path: "reports/finance", element: <FinanceReport /> },
  { path: "reports/customers", element: <CustomersReport /> },
  { path: "reports/security", element: <SecurityReport /> },
  { path: "emails", element: <Emails /> },
  { path: "system-config", element: <SystemConfig /> },
  { path: "activity", element: <SystemActivity /> },
  { path: "data-wipe", element: <DataWipe /> },
  { path: "organization/profile", element: <CompanyProfile /> },
  { path: "organization/sister-concerns", element: <SisterConcerns /> },
  { path: "settings/account", element: <AccountSettings /> },
];

// Menu entries whose screen has not been built yet still need a route, or the
// sidebar link would fall through to Not Found. They render the placeholder
// until the real page replaces them in `builtRoutes`.
const placeholderRoutes: RouteConfig[] = getMenuLeafPaths()
  .map((path) => path.replace(/^\//, ""))
  .filter((path) => path && !builtRoutes.some((route) => route.path === path))
  .map((path) => ({ path, element: <ModulePlaceholder /> }));

export const routes: RouteConfig[] = [
  {
    path: "/",
    element: <RootRedirect />,
  },

  {
    path: "/",
    element: <PublicRoute />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
    ],
  },

  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <PrivateLayout />,
        children: [...builtRoutes, ...placeholderRoutes],
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
