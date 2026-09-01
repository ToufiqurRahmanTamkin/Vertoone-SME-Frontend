import { PrivateLayout } from "@/components/router/private-layout";
import { RoleDashboard } from "@/components/router/role-dashboard";
import { RootRedirect } from "@/components/router/root-redirect";
import { ProtectedRoute, PublicRoute } from "@/components/router/protected-route";
import { getMenuLeafPaths } from "@/config/navigation";
import { Navigate } from "react-router-dom";
import { lazy } from "react";

const Login = lazy(() => import("@/app/auth/login/LoginPage"));
const Register = lazy(() => import("@/app/auth/register/RegisterPage"));
const ForgotPassword = lazy(() => import("@/app/auth/forgot-password/ForgotPasswordPage"));
const Companies = lazy(() => import("@/app/companies/CompaniesPage"));
const AllUsers = lazy(() => import("@/app/allUsers/AllUsersPage"));
const MyCompany = lazy(() => import("@/app/myCompany/MyCompanyPage"));
const AccountSettings = lazy(() => import("@/app/settings/account/page"));
const SubscriptionPlans = lazy(() => import("@/app/plans/PlansPage"));
const SoldSubscriptions = lazy(() => import("@/app/soldSubscriptions/SoldSubscriptionsPage"));
const UserGuides = lazy(() => import("@/app/guides/GuidesPage"));
const FinanceDashboard = lazy(() => import("@/app/finance/dashboard/FinanceDashboardPage"));
const FinanceIncome = lazy(() => import("@/app/finance/income/IncomePage"));
const FinanceExpense = lazy(() => import("@/app/finance/expense/ExpensePage"));
const FinanceInvoices = lazy(() => import("@/app/finance/invoices/InvoicesPage"));
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
const Concerns = lazy(() => import("@/app/concerns/ConcernsPage"));
const MyConcern = lazy(() => import("@/app/myConcern/MyConcernPage"));
const MyProfile = lazy(() => import("@/app/myProfile/MyProfilePage"));
const TeamMembers = lazy(() => import("@/app/configuration/team/TeamMembersPage"));
const Roles = lazy(() => import("@/app/configuration/roles/RolesPage"));
const Tags = lazy(() => import("@/app/crm/tags/TagsPage"));
const Employees = lazy(() => import("@/app/hrms/people/employees/EmployeesPage"));
const Departments = lazy(() => import("@/app/hrms/people/departments/DepartmentsPage"));
const Designations = lazy(() => import("@/app/hrms/people/designations/DesignationsPage"));
const Teams = lazy(() => import("@/app/hrms/people/teams/TeamsPage"));
const LeadSources = lazy(() => import("@/app/crm/leadSources/LeadSourcesPage"));
const ContactTypes = lazy(() => import("@/app/crm/contactTypes/ContactTypesPage"));
const Contacts = lazy(() => import("@/app/crm/contacts/ContactsPage"));
const Leads = lazy(() => import("@/app/crm/leads/LeadsPage"));
const Pipelines = lazy(() => import("@/app/crm/pipelines/PipelinesPage"));
const PipelineDetail = lazy(() => import("@/app/crm/pipelines/PipelineDetailPage"));
const CalendarSettings = lazy(() => import("@/app/calendar/settings/CalendarSettingsPage"));
const Salaries = lazy(() => import("@/app/hrms/payroll/salaries/SalariesPage"));
const Products = lazy(() => import("@/app/sme/products/list/ProductsPage"));
const ProductCategories = lazy(
  () => import("@/app/sme/products/categories/ProductCategoriesPage")
);
const ProductSubCategories = lazy(
  () => import("@/app/sme/products/subCategories/ProductSubCategoriesPage")
);
const Brands = lazy(() => import("@/app/sme/products/brands/BrandsPage"));
const Stock = lazy(() => import("@/app/sme/inventory/stock/StockPage"));
const Warehouses = lazy(() => import("@/app/sme/inventory/warehouses/WarehousesPage"));
const StockTransfers = lazy(() => import("@/app/sme/inventory/transfers/StockTransfersPage"));
const StockAdjustments = lazy(
  () => import("@/app/sme/inventory/adjustments/StockAdjustmentsPage")
);
const Suppliers = lazy(() => import("@/app/sme/purchases/suppliers/SuppliersPage"));
const PurchaseOrders = lazy(() => import("@/app/sme/purchases/orders/PurchaseOrdersPage"));
const PurchaseReturns = lazy(() => import("@/app/sme/purchases/returns/PurchaseReturnsPage"));
const Quotations = lazy(() => import("@/app/sme/sales/quotations/QuotationsPage"));
const SalesOrders = lazy(() => import("@/app/sme/sales/orders/SalesOrdersPage"));
const SalesInvoices = lazy(() => import("@/app/sme/sales/invoices/SalesInvoicesPage"));
const SalesReturns = lazy(() => import("@/app/sme/sales/returns/SalesReturnsPage"));
const Pos = lazy(() => import("@/app/sme/pos/PosPage"));
const SmeEmailConfig = lazy(() => import("@/app/sme/configuration/email/EmailConfigPage"));
const SmePaymentConfig = lazy(
  () => import("@/app/sme/configuration/payment/PaymentConfigPage")
);
const Shop = lazy(() => import("@/app/sme/shop/ShopPage"));
const PublicShop = lazy(() => import("@/app/publicShop/PublicShopPage"));
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
  { path: "dashboard", element: <RoleDashboard /> },
  { path: "companies", element: <Companies /> },
  { path: "all-users", element: <AllUsers /> },
  { path: "my-company", element: <MyCompany /> },
  { path: "subscription-plans", element: <SubscriptionPlans /> },
  { path: "sold-subscriptions", element: <SoldSubscriptions /> },
  { path: "user-guides", element: <UserGuides /> },
  { path: "finance/dashboard", element: <FinanceDashboard /> },
  { path: "finance/income", element: <FinanceIncome /> },
  { path: "finance/expense", element: <FinanceExpense /> },
  { path: "finance/invoices", element: <FinanceInvoices /> },
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
  { path: "settings/company/profile", element: <CompanyProfile /> },
  { path: "settings/company/concerns", element: <Concerns /> },
  { path: "my-concern", element: <MyConcern /> },
  { path: "my-profile", element: <MyProfile /> },
  { path: "settings/access/users", element: <TeamMembers /> },
  { path: "settings/access/roles", element: <Roles /> },
  { path: "hrms/people/employees", element: <Employees /> },
  { path: "hrms/people/teams", element: <Teams /> },
  { path: "hrms/people/departments", element: <Departments /> },
  { path: "hrms/people/designations", element: <Designations /> },
  { path: "hrms/payroll/salaries", element: <Salaries /> },
  { path: "sme/products/list", element: <Products /> },
  { path: "sme/products/categories", element: <ProductCategories /> },
  { path: "sme/products/sub-categories", element: <ProductSubCategories /> },
  { path: "sme/products/brands", element: <Brands /> },
  { path: "sme/inventory/stock", element: <Stock /> },
  { path: "sme/inventory/warehouses", element: <Warehouses /> },
  { path: "sme/inventory/transfers", element: <StockTransfers /> },
  { path: "sme/inventory/adjustments", element: <StockAdjustments /> },
  { path: "sme/purchases/suppliers", element: <Suppliers /> },
  { path: "sme/purchases/orders", element: <PurchaseOrders /> },
  { path: "sme/purchases/returns", element: <PurchaseReturns /> },
  { path: "sme/sales/quotations", element: <Quotations /> },
  { path: "sme/sales/orders", element: <SalesOrders /> },
  { path: "sme/sales/invoices", element: <SalesInvoices /> },
  { path: "sme/sales/returns", element: <SalesReturns /> },
  { path: "sme/pos", element: <Pos /> },
  { path: "sme/shop", element: <Shop /> },
  { path: "settings/sales/email", element: <SmeEmailConfig /> },
  { path: "settings/sales/payment", element: <SmePaymentConfig /> },
  { path: "settings/crm/tags", element: <Tags /> },
  { path: "settings/crm/lead-sources", element: <LeadSources /> },
  { path: "settings/crm/contact-types", element: <ContactTypes /> },
  { path: "crm/contacts", element: <Contacts /> },
  { path: "crm/leads", element: <Leads /> },
  { path: "crm/pipelines", element: <Pipelines /> },
  { path: "crm/pipelines/:id", element: <PipelineDetail /> },
  { path: "settings/workspace/calendar", element: <CalendarSettings /> },
  { path: "settings/account", element: <AccountSettings /> },
];

const legacyRedirects: RouteConfig[] = [
  { path: "crm/my-social/facebook", element: <Navigate to="/crm/social/facebook" replace /> },
  { path: "crm/my-social/instagram", element: <Navigate to="/crm/social/instagram" replace /> },
  { path: "crm/my-social/whatsapp", element: <Navigate to="/crm/social/whatsapp" replace /> },
  { path: "crm/my-social/tiktok", element: <Navigate to="/crm/social/tiktok" replace /> },
  { path: "company-finance/invoice", element: <Navigate to="/company-finance/invoices" replace /> },
  { path: "configuration/team/dashboard", element: <Navigate to="/hrms/people/dashboard" replace /> },
  { path: "calendar", element: <Navigate to="/calendar/view" replace /> },
  { path: "reports/overview", element: <Navigate to="/insights" replace /> },
  { path: "reports/sales/summary", element: <Navigate to="/insights/trade/sales" replace /> },
  { path: "reports/sales/products", element: <Navigate to="/insights/trade/products" replace /> },
  { path: "reports/purchases/summary", element: <Navigate to="/insights/trade/purchases" replace /> },
  { path: "reports/inventory/stock", element: <Navigate to="/insights/inventory/stock" replace /> },
  { path: "reports/inventory/movement", element: <Navigate to="/insights/inventory/movement" replace /> },
  { path: "reports/finance/profit-loss", element: <Navigate to="/insights/finance/profit-loss" replace /> },
  { path: "reports/finance/cash-flow", element: <Navigate to="/insights/finance/cash-flow" replace /> },
  { path: "reports/finance/receivables", element: <Navigate to="/insights/finance/receivables" replace /> },
  { path: "reports/hr/headcount", element: <Navigate to="/insights/people/headcount" replace /> },
  { path: "reports/hr/attendance", element: <Navigate to="/insights/people/attendance" replace /> },
  { path: "reports/hr/leave", element: <Navigate to="/insights/people/leave" replace /> },
  { path: "reports/hr/payroll", element: <Navigate to="/insights/people/payroll" replace /> },
  { path: "reports/hr/recruitment", element: <Navigate to="/insights/people/recruitment" replace /> },
  { path: "reports/hr/performance", element: <Navigate to="/insights/people/performance" replace /> },
  { path: "reports/crm/pipeline", element: <Navigate to="/insights/customers/pipeline" replace /> },
  { path: "reports/crm/leads", element: <Navigate to="/insights/customers/leads" replace /> },
  { path: "reports/crm/deals", element: <Navigate to="/insights/customers/deals" replace /> },
  { path: "reports/crm/campaigns", element: <Navigate to="/insights/customers/campaigns" replace /> },
  { path: "reports/tasks/summary", element: <Navigate to="/insights/tasks" replace /> },
  { path: "organization/profile", element: <Navigate to="/settings/company/profile" replace /> },
  { path: "concerns", element: <Navigate to="/settings/company/concerns" replace /> },
  { path: "concerns/dashboard", element: <Navigate to="/settings/company/concerns-dashboard" replace /> },
  { path: "configuration/team", element: <Navigate to="/settings/access/users" replace /> },
  { path: "configuration/roles", element: <Navigate to="/settings/access/roles" replace /> },
  { path: "sme/configuration/email", element: <Navigate to="/settings/sales/email" replace /> },
  { path: "sme/configuration/payment", element: <Navigate to="/settings/sales/payment" replace /> },
  { path: "hrms/settings/leave", element: <Navigate to="/settings/people/leave" replace /> },
  { path: "hrms/settings/overtime", element: <Navigate to="/settings/people/overtime" replace /> },
  { path: "hrms/settings/attendance-rules", element: <Navigate to="/settings/people/attendance-rules" replace /> },
  { path: "hrms/settings/late-fine-rules", element: <Navigate to="/settings/people/late-fine-rules" replace /> },
  { path: "hrms/settings/holiday-calendar", element: <Navigate to="/settings/people/holiday-calendar" replace /> },
  { path: "hrms/settings/payroll-settings", element: <Navigate to="/settings/people/payroll" replace /> },
  { path: "crm/lead-sources", element: <Navigate to="/settings/crm/lead-sources" replace /> },
  { path: "crm/contact-types", element: <Navigate to="/settings/crm/contact-types" replace /> },
  { path: "crm/tags", element: <Navigate to="/settings/crm/tags" replace /> },
  { path: "crm/campaigns/settings", element: <Navigate to="/settings/crm/campaigns" replace /> },
  { path: "calendar/settings", element: <Navigate to="/settings/workspace/calendar" replace /> },
  { path: "automation/settings", element: <Navigate to="/settings/workspace/automation" replace /> },
  { path: "business-tools/settings", element: <Navigate to="/settings/workspace/business-tools" replace /> },
];

const placeholderRoutes: RouteConfig[] = getMenuLeafPaths()
  .map((path) => path.replace(/^\//, ""))
  .filter((path) => path && !builtRoutes.some((route) => route.path === path))
  .map((path) => ({ path, element: <ModulePlaceholder /> }));

const ROUTES_WITHOUT_MENU = new Set(["my-company", "crm/pipelines/:id"]);

const assertRouteCoverage = (): void => {
  const menuPaths = new Set(getMenuLeafPaths().map((path) => path.replace(/^\//, "")));

  const orphans = builtRoutes
    .map((route) => route.path)
    .filter((path) => !menuPaths.has(path) && !ROUTES_WITHOUT_MENU.has(path));

  if (orphans.length > 0) {
    throw new Error(`Routes with no menu entry: ${orphans.join(", ")}`);
  }

  const seen = new Set<string>();
  [...builtRoutes, ...placeholderRoutes, ...legacyRedirects].forEach((route) => {
    if (seen.has(route.path)) {
      throw new Error(`Duplicate route path: ${route.path}`);
    }
    seen.add(route.path);
  });
};

if (import.meta.env.DEV) assertRouteCoverage();

export const routes: RouteConfig[] = [
  {
    path: "/",
    element: <RootRedirect />,
  },

  { path: "shop/:slug", element: <PublicShop /> },

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
      ...legacyRedirects,
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
