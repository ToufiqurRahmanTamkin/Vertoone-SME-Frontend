import { PrivateLayout } from "@/components/router/private-layout";
import { RoleDashboard } from "@/components/router/role-dashboard";
import { RootRedirect } from "@/components/router/root-redirect";
import { ProtectedRoute, PublicRoute } from "@/components/router/protected-route";
import { getMenuLeafPaths } from "@/config/navigation";
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
const SmeGeneralConfig = lazy(
  () => import("@/app/sme/configuration/general/GeneralConfigPage")
);
const SmeEmailConfig = lazy(() => import("@/app/sme/configuration/email/EmailConfigPage"));
const SmePaymentConfig = lazy(
  () => import("@/app/sme/configuration/payment/PaymentConfigPage")
);
const SmeFinanceConfig = lazy(
  () => import("@/app/sme/configuration/finance/FinanceConfigPage")
);
const SmeTaxConfig = lazy(() => import("@/app/sme/configuration/tax/TaxConfigPage"));
const SmeInvoiceConfig = lazy(
  () => import("@/app/sme/configuration/invoice/InvoiceConfigPage")
);
const SmeNotificationConfig = lazy(
  () => import("@/app/sme/configuration/notifications/NotificationConfigPage")
);
const SmeIntegrationsConfig = lazy(
  () => import("@/app/sme/configuration/integrations/IntegrationsConfigPage")
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
  { path: "organization/profile", element: <CompanyProfile /> },
  { path: "concerns", element: <Concerns /> },
  { path: "my-concern", element: <MyConcern /> },
  { path: "my-profile", element: <MyProfile /> },
  { path: "configuration/team", element: <TeamMembers /> },
  { path: "configuration/roles", element: <Roles /> },
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
  { path: "sme/configuration/general", element: <SmeGeneralConfig /> },
  { path: "sme/configuration/email", element: <SmeEmailConfig /> },
  { path: "sme/configuration/payment", element: <SmePaymentConfig /> },
  { path: "sme/configuration/finance", element: <SmeFinanceConfig /> },
  { path: "sme/configuration/tax", element: <SmeTaxConfig /> },
  { path: "sme/configuration/invoice", element: <SmeInvoiceConfig /> },
  { path: "sme/configuration/notifications", element: <SmeNotificationConfig /> },
  { path: "sme/configuration/integrations", element: <SmeIntegrationsConfig /> },
  { path: "crm/tags", element: <Tags /> },
  { path: "crm/lead-sources", element: <LeadSources /> },
  { path: "crm/contact-types", element: <ContactTypes /> },
  { path: "crm/contacts", element: <Contacts /> },
  { path: "crm/leads", element: <Leads /> },
  { path: "calendar/settings", element: <CalendarSettings /> },
  { path: "settings/account", element: <AccountSettings /> },
];

const placeholderRoutes: RouteConfig[] = getMenuLeafPaths()
  .map((path) => path.replace(/^\//, ""))
  .filter((path) => path && !builtRoutes.some((route) => route.path === path))
  .map((path) => ({ path, element: <ModulePlaceholder /> }));

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
