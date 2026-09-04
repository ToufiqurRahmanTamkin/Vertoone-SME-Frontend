import { PrivateLayout } from "@/components/router/private-layout";
import { RootRedirect } from "@/components/router/root-redirect";
import { WorkspaceRedirect } from "@/components/router/workspace-redirect";
import { ProtectedRoute, PublicRoute } from "@/components/router/protected-route";
import { MENU_BRANCH_PATHS, MENU_WORKSPACES, getMenuLeafPaths } from "@/config/navigation";
import { Navigate } from "react-router-dom";
import { lazy } from "react";

const Login = lazy(() => import("@/app/auth/login/LoginPage"));
const Register = lazy(() => import("@/app/auth/register/RegisterPage"));
const ForgotPassword = lazy(() => import("@/app/auth/forgot-password/ForgotPasswordPage"));
const PlatformDashboard = lazy(() => import("@/app/dashboard/page"));
const Companies = lazy(() => import("@/app/companies/CompaniesPage"));
const AllUsers = lazy(() => import("@/app/allUsers/AllUsersPage"));
const Maintainers = lazy(() => import("@/app/maintainers/MaintainersPage"));
const CompanyDashboard = lazy(() => import("@/app/myCompany/MyCompanyPage"));
const AccountSettings = lazy(() => import("@/app/settings/account/page"));
const SubscriptionPlans = lazy(() => import("@/app/plans/PlansPage"));
const SoldSubscriptions = lazy(() => import("@/app/soldSubscriptions/SoldSubscriptionsPage"));
const SubscriptionRequests = lazy(
  () => import("@/app/subscriptionRequests/SubscriptionRequestsPage")
);
const UserGuides = lazy(() => import("@/app/guides/GuidesPage"));
const FinanceDashboard = lazy(() => import("@/app/finance/dashboard/FinanceDashboardPage"));
const FinanceIncome = lazy(() => import("@/app/finance/income/IncomePage"));
const FinanceExpense = lazy(() => import("@/app/finance/expense/ExpensePage"));
const FinanceInvoices = lazy(() => import("@/app/finance/invoices/InvoicesPage"));
const FinanceCategories = lazy(() => import("@/app/finance/categories/FinanceCategoriesPage"));
const SystemConfig = lazy(() => import("@/app/systemConfig/SystemConfigPage"));
const SystemOverview = lazy(() => import("@/app/systemOverview/SystemOverviewPage"));
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
const Deals = lazy(() => import("@/app/crm/deals/DealsPage"));
const TasksGoalsOverview = lazy(
  () => import("@/app/tasksGoals/overview/TasksGoalsOverviewPage")
);
const Tasks = lazy(() => import("@/app/tasksGoals/tasks/TasksPage"));
const TaskBoard = lazy(() => import("@/app/tasksGoals/tasks/TaskBoardPage"));
const Goals = lazy(() => import("@/app/tasksGoals/goals/GoalsPage"));
const Notes = lazy(() => import("@/app/tasksGoals/notes/NotesPage"));
const Pipelines = lazy(() => import("@/app/crm/pipelines/PipelinesPage"));
const PipelineDetail = lazy(() => import("@/app/crm/pipelines/PipelineDetailPage"));
const CalendarOverview = lazy(() => import("@/app/calendar/overview/CalendarOverviewPage"));
const Schedule = lazy(() => import("@/app/calendar/schedule/SchedulePage"));
const CalendarSettings = lazy(() => import("@/app/calendar/settings/CalendarSettingsPage"));
const Events = lazy(() => import("@/app/calendar/events/EventsPage"));
const EventRegistrations = lazy(() => import("@/app/calendar/events/EventRegistrationsPage"));
const Meetings = lazy(() => import("@/app/calendar/meetings/MeetingsPage"));
const MeetingRegistrations = lazy(
  () => import("@/app/calendar/meetings/MeetingRegistrationsPage")
);
const Bookings = lazy(() => import("@/app/calendar/bookings/BookingsPage"));
const CommunityOverview = lazy(
  () => import("@/app/community/overview/CommunityOverviewPage")
);
const CommunityFeeds = lazy(() => import("@/app/community/feeds/FeedsPage"));
const CommunityMembers = lazy(() => import("@/app/community/members/MembersPage"));
const CommunityGroups = lazy(() => import("@/app/community/groups/GroupsPage"));
const CommunityChats = lazy(() => import("@/app/community/chats/ChatsPage"));
const JobOpenings = lazy(() => import("@/app/hrms/recruitment/jobOpenings/JobOpeningsPage"));
const CommunitySettings = lazy(
  () => import("@/app/community/settings/CommunitySettingsPage")
);
const BookingRequests = lazy(() => import("@/app/calendar/bookings/BookingRequestsPage"));
const Salaries = lazy(() => import("@/app/hrms/payroll/salaries/SalariesPage"));
const HrmsSettingsOverview = lazy(
  () => import("@/app/hrms/settings/overview/HrmsSettingsOverviewPage")
);
const LeaveSettings = lazy(() => import("@/app/hrms/settings/leave/LeaveSettingsPage"));
const ShiftSettings = lazy(() => import("@/app/hrms/settings/shifts/ShiftSettingsPage"));
const AttendanceRuleSettings = lazy(
  () => import("@/app/hrms/settings/attendance/AttendanceRuleSettingsPage")
);
const LateFineSettings = lazy(
  () => import("@/app/hrms/settings/lateFine/LateFineSettingsPage")
);
const OvertimeSettings = lazy(
  () => import("@/app/hrms/settings/overtime/OvertimeSettingsPage")
);
const ProvidentFundSettings = lazy(
  () => import("@/app/hrms/settings/providentFund/ProvidentFundSettingsPage")
);
const AttendanceOverview = lazy(
  () => import("@/app/hrms/attendance/overview/AttendanceOverviewPage")
);
const DailyAttendance = lazy(
  () => import("@/app/hrms/attendance/daily/DailyAttendancePage")
);
const ShiftAssignments = lazy(
  () => import("@/app/hrms/attendance/shiftAssignments/ShiftAssignmentsPage")
);
const RosterPlanning = lazy(() => import("@/app/hrms/attendance/roster/RosterPage"));
const WorkHistory = lazy(() => import("@/app/hrms/workHistory/WorkHistoryPage"));
const MyAttendanceCorrections = lazy(
  () => import("@/app/hrms/myRequests/AttendanceCorrectionPage")
);
const AttendanceApprovals = lazy(
  () => import("@/app/hrms/approvals/AttendanceApprovalsPage")
);
const PoliciesOverview = lazy(() => import("@/app/hrms/policies/overview/PoliciesOverviewPage"));
const PoliciesHandbook = lazy(() => import("@/app/hrms/policies/handbook/PoliciesPage"));
const PolicyAcknowledgements = lazy(
  () => import("@/app/hrms/policies/acknowledgements/PolicyAcknowledgementsPage")
);
const Announcements = lazy(() => import("@/app/hrms/announcements/AnnouncementsPage"));
const MyAttendance = lazy(() => import("@/app/hrms/myWork/MyAttendancePage"));
const MyShifts = lazy(() => import("@/app/hrms/myWork/MyShiftPage"));
const MyWorkHistory = lazy(() => import("@/app/hrms/myWork/MyWorkHistoryPage"));
const MyWorkOverview = lazy(() => import("@/app/hrms/myWork/overview/MyWorkOverviewPage"));
const MyTimesheet = lazy(() => import("@/app/hrms/myWork/timesheet/MyTimesheetPage"));
const MyTasks = lazy(() => import("@/app/hrms/myWork/tasks/MyTasksPage"));
const MyGoals = lazy(() => import("@/app/hrms/myWork/goals/MyGoalsPage"));
const MyPolicies = lazy(() => import("@/app/hrms/myRecords/MyPoliciesPage"));
const MyAnnouncements = lazy(() => import("@/app/hrms/myRecords/MyAnnouncementsPage"));
const AssetsOverview = lazy(() => import("@/app/hrms/assets/overview/AssetsOverviewPage"));
const AssetRegister = lazy(() => import("@/app/hrms/assets/register/AssetsPage"));
const AssetAssignments = lazy(() => import("@/app/hrms/assets/assignments/AssetAssignmentsPage"));
const AssetMaintenance = lazy(() => import("@/app/hrms/assets/maintenance/AssetMaintenancePage"));
const AssetCategories = lazy(() => import("@/app/hrms/assets/categories/AssetCategoriesPage"));
const MyAssets = lazy(() => import("@/app/hrms/myRecords/MyAssetsPage"));
const HolidayCalendar = lazy(
  () => import("@/app/hrms/settings/holidays/HolidayCalendarPage")
);
const PayrollSettings = lazy(
  () => import("@/app/hrms/settings/payroll/PayrollSettingsPage")
);
const EmployeeRoles = lazy(
  () => import("@/app/hrms/settings/employeeRoles/EmployeeRolesPage")
);
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
const EmailConfig = lazy(() => import("@/app/settings/system/EmailConfigPage"));
const PaymentConfig = lazy(() => import("@/app/settings/system/PaymentConfigPage"));
const ApiWebhooks = lazy(() => import("@/app/settings/system/ApiWebhooksPage"));
const Shop = lazy(() => import("@/app/sme/shop/ShopPage"));
const BusinessToolsDashboard = lazy(
  () => import("@/app/businessTools/dashboard/BusinessToolsDashboardPage")
);
const EmailTemplates = lazy(() => import("@/app/businessTools/emailBuilder/EmailTemplatesPage"));
const EmailTemplateBuilder = lazy(
  () => import("@/app/businessTools/emailBuilder/EmailTemplateBuilderPage")
);
const EmailDeliveries = lazy(
  () => import("@/app/businessTools/emailBuilder/EmailDeliveriesPage")
);
const Websites = lazy(() => import("@/app/businessTools/webBuilder/WebsitesPage"));
const SitePages = lazy(() => import("@/app/businessTools/webBuilder/SitePagesPage"));
const PageBuilder = lazy(() => import("@/app/businessTools/webBuilder/PageBuilderPage"));
const Forms = lazy(() => import("@/app/businessTools/formBuilder/FormsPage"));
const FormBuilder = lazy(() => import("@/app/businessTools/formBuilder/FormBuilderPage"));
const FormResponses = lazy(() => import("@/app/businessTools/formBuilder/FormResponsesPage"));
const BusinessToolsSettings = lazy(
  () => import("@/app/businessTools/settings/BusinessToolsSettingsPage")
);
const FileManager = lazy(() => import("@/app/fileManager/FileManagerPage"));
const DocumentsOverview = lazy(
  () => import("@/app/documents/overview/DocumentsOverviewPage")
);
const AllDocuments = lazy(
  () => import("@/app/documents/allDocuments/AllDocumentsPage")
);
const DigitalContracts = lazy(
  () => import("@/app/documents/digitalContracts/DigitalContractsPage")
);
const SignContract = lazy(() => import("@/app/publicContract/SignContractPage"));
const PublicShop = lazy(() => import("@/app/publicShop/PublicShopPage"));
const PublicEvent = lazy(() => import("@/app/publicCalendar/PublicEventPage"));
const PublicMeeting = lazy(() => import("@/app/publicCalendar/PublicMeetingPage"));
const PublicBooking = lazy(() => import("@/app/publicCalendar/PublicBookingPage"));
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
  { path: "platform/dashboard", element: <PlatformDashboard /> },
  { path: "platform/companies", element: <Companies /> },
  { path: "platform/users", element: <AllUsers /> },
  { path: "platform/maintainers", element: <Maintainers /> },
  { path: "platform/subscription-plans", element: <SubscriptionPlans /> },
  { path: "platform/sold-subscriptions", element: <SoldSubscriptions /> },
  { path: "platform/subscription-requests", element: <SubscriptionRequests /> },
  { path: "platform/finance/overview", element: <FinanceDashboard /> },
  { path: "platform/finance/income", element: <FinanceIncome /> },
  { path: "platform/finance/expense", element: <FinanceExpense /> },
  { path: "platform/finance/invoices", element: <FinanceInvoices /> },
  { path: "platform/finance/categories", element: <FinanceCategories /> },
  { path: "platform/reports/overview", element: <Reports /> },
  { path: "platform/reports/revenue", element: <RevenueReport /> },
  { path: "platform/reports/subscriptions", element: <SubscriptionsReport /> },
  { path: "platform/reports/plan-performance", element: <PlansReport /> },
  { path: "platform/reports/income-and-expense", element: <FinanceReport /> },
  { path: "platform/reports/customers", element: <CustomersReport /> },
  { path: "platform/reports/sign-in-activity", element: <SecurityReport /> },
  { path: "platform/user-guides", element: <UserGuides /> },
  { path: "platform/emails", element: <Emails /> },
  { path: "platform/system/overview", element: <SystemOverview /> },
  { path: "platform/system/configuration", element: <SystemConfig /> },
  { path: "platform/system/activity-log", element: <SystemActivity /> },
  { path: "platform/system/wipe-data", element: <DataWipe /> },

  { path: "company/dashboard", element: <CompanyDashboard /> },
  { path: "company/my-concern", element: <MyConcern /> },
  { path: "company/my-profile", element: <MyProfile /> },
  { path: "company/finance/overview", element: <FinanceDashboard /> },
  { path: "company/finance/income", element: <FinanceIncome /> },
  { path: "company/finance/expenses", element: <FinanceExpense /> },
  { path: "company/finance/invoices", element: <FinanceInvoices /> },
  { path: "company/finance/categories", element: <FinanceCategories /> },
  { path: "company/file-manager", element: <FileManager /> },
  { path: "company/documents/overview", element: <DocumentsOverview /> },
  { path: "company/documents/all-documents", element: <AllDocuments /> },
  { path: "company/documents/digital-contracts", element: <DigitalContracts /> },
  { path: "company/tasks-and-goals/overview", element: <TasksGoalsOverview /> },
  { path: "company/tasks-and-goals/tasks", element: <Tasks /> },
  { path: "company/tasks-and-goals/tasks/:id", element: <TaskBoard /> },
  { path: "company/tasks-and-goals/goals", element: <Goals /> },
  { path: "company/tasks-and-goals/notes", element: <Notes /> },
  { path: "company/calendar/overview", element: <CalendarOverview /> },
  { path: "company/calendar/schedule", element: <Schedule /> },
  { path: "company/calendar/events", element: <Events /> },
  { path: "company/calendar/events/:id/registrations", element: <EventRegistrations /> },
  { path: "company/calendar/meetings", element: <Meetings /> },
  { path: "company/calendar/meetings/:id/registrations", element: <MeetingRegistrations /> },
  { path: "company/calendar/bookings", element: <Bookings /> },
  { path: "company/calendar/bookings/:id/requests", element: <BookingRequests /> },
  { path: "company/calendar/settings", element: <CalendarSettings /> },
  { path: "company/community/overview", element: <CommunityOverview /> },
  { path: "company/community/feeds", element: <CommunityFeeds /> },
  { path: "company/community/members", element: <CommunityMembers /> },
  { path: "company/community/groups", element: <CommunityGroups /> },
  { path: "company/community/chats", element: <CommunityChats /> },
  { path: "hrms/recruitment/job-openings", element: <JobOpenings /> },
  { path: "company/community/settings", element: <CommunitySettings /> },
  { path: "crm/business-tools/overview", element: <BusinessToolsDashboard /> },
  { path: "crm/business-tools/email-builder", element: <EmailTemplates /> },
  { path: "crm/business-tools/email-builder/deliveries", element: <EmailDeliveries /> },
  { path: "crm/business-tools/email-builder/:templateId", element: <EmailTemplateBuilder /> },
  { path: "crm/business-tools/web-builder", element: <Websites /> },
  { path: "crm/business-tools/web-builder/:siteId", element: <SitePages /> },
  {
    path: "crm/business-tools/web-builder/:siteId/pages/:pageId",
    element: <PageBuilder />,
  },
  { path: "crm/business-tools/form-builder", element: <Forms /> },
  { path: "crm/business-tools/form-builder/:formId", element: <FormBuilder /> },
  { path: "crm/business-tools/form-builder/:formId/responses", element: <FormResponses /> },
  { path: "crm/business-tools/settings", element: <BusinessToolsSettings /> },

  { path: "sme/products/all-products", element: <Products /> },
  { path: "sme/products/categories", element: <ProductCategories /> },
  { path: "sme/products/subcategories", element: <ProductSubCategories /> },
  { path: "sme/products/brands", element: <Brands /> },
  { path: "sme/inventory/stock", element: <Stock /> },
  { path: "sme/inventory/warehouses", element: <Warehouses /> },
  { path: "sme/inventory/stock-transfers", element: <StockTransfers /> },
  { path: "sme/inventory/stock-adjustments", element: <StockAdjustments /> },
  { path: "sme/purchases/suppliers", element: <Suppliers /> },
  { path: "sme/purchases/orders", element: <PurchaseOrders /> },
  { path: "sme/purchases/returns", element: <PurchaseReturns /> },
  { path: "sme/sales/quotations", element: <Quotations /> },
  { path: "sme/sales/orders", element: <SalesOrders /> },
  { path: "sme/sales/invoices", element: <SalesInvoices /> },
  { path: "sme/sales/returns", element: <SalesReturns /> },
  { path: "sme/point-of-sale", element: <Pos /> },
  { path: "sme/online-shop", element: <Shop /> },

  { path: "crm/leads", element: <Leads /> },
  { path: "crm/deals", element: <Deals /> },
  { path: "crm/pipelines", element: <Pipelines /> },
  { path: "crm/pipelines/:id", element: <PipelineDetail /> },
  { path: "crm/contacts", element: <Contacts /> },
  { path: "crm/settings/lead-sources", element: <LeadSources /> },
  { path: "crm/settings/contact-types", element: <ContactTypes /> },
  { path: "crm/settings/tags", element: <Tags /> },

  { path: "hrms/directory/employees", element: <Employees /> },
  { path: "hrms/directory/work-history", element: <WorkHistory /> },
  { path: "hrms/attendance/overview", element: <AttendanceOverview /> },
  { path: "hrms/attendance/daily-attendance", element: <DailyAttendance /> },
  { path: "hrms/attendance/shift-assignments", element: <ShiftAssignments /> },
  { path: "hrms/attendance/roster", element: <RosterPlanning /> },
  { path: "hrms/approvals/attendance", element: <AttendanceApprovals /> },
  { path: "hrms/my-work/attendance", element: <MyAttendance /> },
  { path: "hrms/my-work/shifts", element: <MyShifts /> },
  { path: "hrms/my-work/work-history", element: <MyWorkHistory /> },
  { path: "hrms/my-requests/attendance-correction", element: <MyAttendanceCorrections /> },
  { path: "hrms/directory/teams", element: <Teams /> },
  { path: "hrms/directory/departments", element: <Departments /> },
  { path: "hrms/directory/designations", element: <Designations /> },
  { path: "hrms/payroll/salaries", element: <Salaries /> },
  { path: "hrms/settings/overview", element: <HrmsSettingsOverview /> },
  { path: "hrms/settings/leave", element: <LeaveSettings /> },
  { path: "hrms/settings/shifts", element: <ShiftSettings /> },
  { path: "hrms/settings/attendance-rules", element: <AttendanceRuleSettings /> },
  { path: "hrms/settings/late-fine-rules", element: <LateFineSettings /> },
  { path: "hrms/settings/overtime", element: <OvertimeSettings /> },
  { path: "hrms/policies/overview", element: <PoliciesOverview /> },
  { path: "hrms/policies/handbook", element: <PoliciesHandbook /> },
  { path: "hrms/policies/acknowledgements", element: <PolicyAcknowledgements /> },
  { path: "hrms/announcements", element: <Announcements /> },
  { path: "hrms/my-work/overview", element: <MyWorkOverview /> },
  { path: "hrms/my-work/timesheet", element: <MyTimesheet /> },
  { path: "hrms/my-work/tasks", element: <MyTasks /> },
  { path: "hrms/my-work/goals", element: <MyGoals /> },
  { path: "hrms/my-records/policies", element: <MyPolicies /> },
  { path: "hrms/my-records/announcements", element: <MyAnnouncements /> },
  { path: "hrms/assets/overview", element: <AssetsOverview /> },
  { path: "hrms/assets/register", element: <AssetRegister /> },
  { path: "hrms/assets/assignments", element: <AssetAssignments /> },
  { path: "hrms/assets/maintenance", element: <AssetMaintenance /> },
  { path: "hrms/assets/categories", element: <AssetCategories /> },
  { path: "hrms/my-records/assets", element: <MyAssets /> },
  { path: "hrms/settings/holiday-calendar", element: <HolidayCalendar /> },
  { path: "hrms/settings/provident-fund", element: <ProvidentFundSettings /> },
  { path: "hrms/settings/payroll", element: <PayrollSettings /> },
  {
    path: "hrms/settings/employee-roles-and-permissions",
    element: <EmployeeRoles />,
  },

  { path: "settings/company/profile", element: <CompanyProfile /> },
  { path: "settings/company/concerns", element: <Concerns /> },
  { path: "settings/users-and-roles/users", element: <TeamMembers /> },
  { path: "settings/users-and-roles/roles-and-permissions", element: <Roles /> },
  { path: "settings/system/email", element: <EmailConfig /> },
  { path: "settings/system/payments", element: <PaymentConfig /> },
  { path: "settings/system/api-and-webhooks", element: <ApiWebhooks /> },
  { path: "settings/my-account", element: <AccountSettings /> },
];

const legacyRedirects: RouteConfig[] = [
  { path: "dashboard", element: <RootRedirect /> },
  { path: "ads-manager/google-ads", element: <Navigate to="/crm/ads-manager/google-ads" replace /> },
  { path: "ads-manager/meta-ads", element: <Navigate to="/crm/ads-manager/meta-ads" replace /> },
  { path: "ads-manager/overview", element: <Navigate to="/crm/ads-manager/overview" replace /> },
  { path: "all-users", element: <Navigate to="/platform/users" replace /> },
  { path: "automation/overview", element: <Navigate to="/company/automation/overview" replace /> },
  { path: "automation/settings", element: <Navigate to="/company/automation/settings" replace /> },
  { path: "automation/workflows", element: <Navigate to="/company/automation/workflows" replace /> },
  { path: "business-tools/email-builder", element: <Navigate to="/crm/business-tools/email-builder" replace /> },
  { path: "business-tools/form-builder", element: <Navigate to="/crm/business-tools/form-builder" replace /> },
  { path: "business-tools/overview", element: <Navigate to="/crm/business-tools/overview" replace /> },
  { path: "business-tools/settings", element: <Navigate to="/crm/business-tools/settings" replace /> },
  { path: "business-tools/web-builder", element: <Navigate to="/crm/business-tools/web-builder" replace /> },
  { path: "calendar", element: <Navigate to="/company/calendar/schedule" replace /> },
  { path: "calendar/bookings", element: <Navigate to="/company/calendar/bookings" replace /> },
  { path: "calendar/events", element: <Navigate to="/company/calendar/events" replace /> },
  { path: "calendar/meetings", element: <Navigate to="/company/calendar/meetings" replace /> },
  { path: "calendar/overview", element: <Navigate to="/company/calendar/overview" replace /> },
  { path: "calendar/schedule", element: <Navigate to="/company/calendar/schedule" replace /> },
  { path: "calendar/settings", element: <Navigate to="/company/calendar/settings" replace /> },
  { path: "companies", element: <Navigate to="/platform/companies" replace /> },
  { path: "company-finance/categories", element: <Navigate to="/company/finance/categories" replace /> },
  { path: "company-finance/dashboard", element: <Navigate to="/company/finance/overview" replace /> },
  { path: "company-finance/expenses", element: <Navigate to="/company/finance/expenses" replace /> },
  { path: "company-finance/income", element: <Navigate to="/company/finance/income" replace /> },
  { path: "company-finance/invoice", element: <Navigate to="/company/finance/invoices" replace /> },
  { path: "company-finance/invoices", element: <Navigate to="/company/finance/invoices" replace /> },
  { path: "company/business-tools/email-builder", element: <Navigate to="/crm/business-tools/email-builder" replace /> },
  { path: "company/business-tools/form-builder", element: <Navigate to="/crm/business-tools/form-builder" replace /> },
  { path: "company/business-tools/overview", element: <Navigate to="/crm/business-tools/overview" replace /> },
  { path: "company/business-tools/settings", element: <Navigate to="/crm/business-tools/settings" replace /> },
  { path: "company/business-tools/web-builder", element: <Navigate to="/crm/business-tools/web-builder" replace /> },
  { path: "concerns", element: <Navigate to="/settings/company/concerns" replace /> },
  { path: "concerns/dashboard", element: <Navigate to="/settings/company/concerns-overview" replace /> },
  { path: "configuration/roles", element: <Navigate to="/settings/users-and-roles/roles-and-permissions" replace /> },
  { path: "configuration/team", element: <Navigate to="/settings/users-and-roles/users" replace /> },
  { path: "configuration/team/dashboard", element: <Navigate to="/hrms/directory/overview" replace /> },
  { path: "crm/campaigns/settings", element: <Navigate to="/crm/settings/campaigns" replace /> },
  { path: "crm/contact-types", element: <Navigate to="/crm/settings/contact-types" replace /> },
  { path: "crm/lead-sources", element: <Navigate to="/crm/settings/lead-sources" replace /> },
  { path: "crm/my-social/facebook", element: <Navigate to="/crm/social-accounts/facebook" replace /> },
  { path: "crm/my-social/instagram", element: <Navigate to="/crm/social-accounts/instagram" replace /> },
  { path: "crm/my-social/tiktok", element: <Navigate to="/crm/social-accounts/tiktok" replace /> },
  { path: "crm/my-social/whatsapp", element: <Navigate to="/crm/social-accounts/whatsapp" replace /> },
  { path: "crm/tags", element: <Navigate to="/crm/settings/tags" replace /> },
  { path: "documents/all-documents", element: <Navigate to="/company/documents/all-documents" replace /> },
  { path: "documents/digital-contracts", element: <Navigate to="/company/documents/digital-contracts" replace /> },
  { path: "documents/overview", element: <Navigate to="/company/documents/overview" replace /> },
  { path: "emails", element: <Navigate to="/platform/emails" replace /> },
  { path: "finance/categories", element: <Navigate to="/platform/finance/categories" replace /> },
  { path: "finance/dashboard", element: <Navigate to="/platform/finance/overview" replace /> },
  { path: "finance/expense", element: <Navigate to="/platform/finance/expense" replace /> },
  { path: "finance/income", element: <Navigate to="/platform/finance/income" replace /> },
  { path: "finance/invoices", element: <Navigate to="/platform/finance/invoices" replace /> },
  { path: "hrms/attendance/shifts", element: <Navigate to="/hrms/settings/shifts" replace /> },
  { path: "hrms/settings/payroll-settings", element: <Navigate to="/hrms/settings/payroll" replace /> },
  { path: "insights/customers/campaigns", element: <Navigate to="/crm/insights/campaigns" replace /> },
  { path: "insights/customers/deals", element: <Navigate to="/crm/insights/deals" replace /> },
  { path: "insights/customers/leads", element: <Navigate to="/crm/insights/leads" replace /> },
  { path: "insights/customers/pipeline", element: <Navigate to="/crm/insights/pipeline" replace /> },
  { path: "insights/finance/cash-flow", element: <Navigate to="/company/insights/cash-flow" replace /> },
  { path: "insights/finance/profit-and-loss", element: <Navigate to="/company/insights/profit-and-loss" replace /> },
  { path: "insights/finance/receivables", element: <Navigate to="/company/insights/receivables" replace /> },
  { path: "insights/inventory/stock", element: <Navigate to="/sme/insights/stock" replace /> },
  { path: "insights/inventory/stock-movement", element: <Navigate to="/sme/insights/stock-movement" replace /> },
  { path: "insights/overview", element: <Navigate to="/company/insights/overview" replace /> },
  { path: "insights/people/attendance", element: <Navigate to="/hrms/insights/attendance" replace /> },
  { path: "insights/people/headcount", element: <Navigate to="/hrms/insights/headcount" replace /> },
  { path: "insights/people/leave", element: <Navigate to="/hrms/insights/leave" replace /> },
  { path: "insights/people/payroll", element: <Navigate to="/hrms/insights/payroll" replace /> },
  { path: "insights/people/performance", element: <Navigate to="/hrms/insights/performance" replace /> },
  { path: "insights/people/recruitment", element: <Navigate to="/hrms/insights/recruitment" replace /> },
  { path: "insights/sales-and-purchases/purchases", element: <Navigate to="/sme/insights/purchases" replace /> },
  { path: "insights/sales-and-purchases/sales", element: <Navigate to="/sme/insights/sales" replace /> },
  { path: "insights/sales-and-purchases/sales-by-product", element: <Navigate to="/sme/insights/sales-by-product" replace /> },
  { path: "insights/tasks-and-goals", element: <Navigate to="/company/insights/tasks-and-goals" replace /> },
  { path: "my-company", element: <Navigate to="/company/dashboard" replace /> },
  { path: "my-concern", element: <Navigate to="/company/my-concern" replace /> },
  { path: "my-profile", element: <Navigate to="/company/my-profile" replace /> },
  { path: "organization/profile", element: <Navigate to="/settings/company/profile" replace /> },
  { path: "reports/crm/campaigns", element: <Navigate to="/crm/insights/campaigns" replace /> },
  { path: "reports/crm/deals", element: <Navigate to="/crm/insights/deals" replace /> },
  { path: "reports/crm/leads", element: <Navigate to="/crm/insights/leads" replace /> },
  { path: "reports/crm/pipeline", element: <Navigate to="/crm/insights/pipeline" replace /> },
  { path: "reports/customers", element: <Navigate to="/platform/reports/customers" replace /> },
  { path: "reports/finance/cash-flow", element: <Navigate to="/company/insights/cash-flow" replace /> },
  { path: "reports/finance/profit-loss", element: <Navigate to="/company/insights/profit-and-loss" replace /> },
  { path: "reports/finance/receivables", element: <Navigate to="/company/insights/receivables" replace /> },
  { path: "reports/hr/attendance", element: <Navigate to="/hrms/insights/attendance" replace /> },
  { path: "reports/hr/headcount", element: <Navigate to="/hrms/insights/headcount" replace /> },
  { path: "reports/hr/leave", element: <Navigate to="/hrms/insights/leave" replace /> },
  { path: "reports/hr/payroll", element: <Navigate to="/hrms/insights/payroll" replace /> },
  { path: "reports/hr/performance", element: <Navigate to="/hrms/insights/performance" replace /> },
  { path: "reports/hr/recruitment", element: <Navigate to="/hrms/insights/recruitment" replace /> },
  { path: "reports/income-and-expense", element: <Navigate to="/platform/reports/income-and-expense" replace /> },
  { path: "reports/inventory/movement", element: <Navigate to="/sme/insights/stock-movement" replace /> },
  { path: "reports/inventory/stock", element: <Navigate to="/sme/insights/stock" replace /> },
  { path: "reports/overview", element: <Navigate to="/platform/reports/overview" replace /> },
  { path: "reports/plan-performance", element: <Navigate to="/platform/reports/plan-performance" replace /> },
  { path: "reports/purchases/summary", element: <Navigate to="/sme/insights/purchases" replace /> },
  { path: "reports/revenue", element: <Navigate to="/platform/reports/revenue" replace /> },
  { path: "reports/sales/products", element: <Navigate to="/sme/insights/sales-by-product" replace /> },
  { path: "reports/sales/summary", element: <Navigate to="/sme/insights/sales" replace /> },
  { path: "reports/sign-in-activity", element: <Navigate to="/platform/reports/sign-in-activity" replace /> },
  { path: "reports/subscriptions", element: <Navigate to="/platform/reports/subscriptions" replace /> },
  { path: "reports/tasks/summary", element: <Navigate to="/company/insights/tasks-and-goals" replace /> },
  { path: "settings/customers/campaigns", element: <Navigate to="/crm/settings/campaigns" replace /> },
  { path: "settings/customers/contact-types", element: <Navigate to="/crm/settings/contact-types" replace /> },
  { path: "settings/customers/lead-sources", element: <Navigate to="/crm/settings/lead-sources" replace /> },
  { path: "settings/customers/tags", element: <Navigate to="/crm/settings/tags" replace /> },
  { path: "settings/people/attendance-rules", element: <Navigate to="/hrms/settings/attendance-rules" replace /> },
  { path: "settings/people/holiday-calendar", element: <Navigate to="/hrms/settings/holiday-calendar" replace /> },
  { path: "settings/people/late-fine-rules", element: <Navigate to="/hrms/settings/late-fine-rules" replace /> },
  { path: "settings/people/leave", element: <Navigate to="/hrms/settings/leave" replace /> },
  { path: "settings/people/overtime", element: <Navigate to="/hrms/settings/overtime" replace /> },
  { path: "settings/people/payroll", element: <Navigate to="/hrms/settings/payroll" replace /> },
  { path: "settings/sales-and-billing/email-sending", element: <Navigate to="/settings/system/email" replace /> },
  { path: "settings/sales-and-billing/payment-gateways", element: <Navigate to="/settings/system/payments" replace /> },
  { path: "settings/workspace/automation", element: <Navigate to="/company/automation/settings" replace /> },
  { path: "settings/workspace/business-tools", element: <Navigate to="/crm/business-tools/settings" replace /> },
  { path: "settings/workspace/calendar", element: <Navigate to="/company/calendar/settings" replace /> },
  { path: "sme/configuration/email", element: <Navigate to="/settings/system/email" replace /> },
  { path: "sme/configuration/payment", element: <Navigate to="/settings/system/payments" replace /> },
  { path: "sme/inventory/stock-overview", element: <Navigate to="/sme/inventory/stock" replace /> },
  { path: "sold-subscriptions", element: <Navigate to="/platform/sold-subscriptions" replace /> },
  { path: "subscription-plans", element: <Navigate to="/platform/subscription-plans" replace /> },
  { path: "system-activity", element: <Navigate to="/platform/system/activity-log" replace /> },
  { path: "system-config", element: <Navigate to="/platform/system/configuration" replace /> },
  { path: "tasks-and-goals/goals", element: <Navigate to="/company/tasks-and-goals/goals" replace /> },
  { path: "tasks-and-goals/notes", element: <Navigate to="/company/tasks-and-goals/notes" replace /> },
  { path: "tasks-and-goals/tasks", element: <Navigate to="/company/tasks-and-goals/tasks" replace /> },
  { path: "user-guides", element: <Navigate to="/platform/user-guides" replace /> },
  { path: "wipe-data", element: <Navigate to="/platform/system/wipe-data" replace /> },
];

const branchRedirects: RouteConfig[] = [
  ...MENU_WORKSPACES.map((workspace) => ({
    path: workspace.id,
    element: <WorkspaceRedirect workspaceId={workspace.id} />,
  })),
  ...MENU_BRANCH_PATHS.map((path) => ({
    path: path.slice(1),
    element: <Navigate to={`${path}/overview`} replace />,
  })),
];

const placeholderRoutes: RouteConfig[] = getMenuLeafPaths()
  .map((path) => path.slice(1))
  .filter((path) => !builtRoutes.some((route) => route.path === path))
  .map((path) => ({ path, element: <ModulePlaceholder /> }));

const ROUTES_WITHOUT_MENU = new Set([
  "crm/business-tools/email-builder/deliveries",
  "crm/business-tools/email-builder/:templateId",
  "crm/business-tools/web-builder/:siteId",
  "crm/business-tools/web-builder/:siteId/pages/:pageId",
  "crm/business-tools/form-builder/:formId",
  "crm/business-tools/form-builder/:formId/responses",
  "company/calendar/events/:id/registrations",
  "company/calendar/meetings/:id/registrations",
  "company/calendar/bookings/:id/requests",
  "company/tasks-and-goals/tasks/:id",
  "crm/pipelines/:id",
]);

const assertRouteCoverage = (): void => {
  const menuPaths = new Set(getMenuLeafPaths().map((path) => path.slice(1)));

  const orphans = builtRoutes
    .map((route) => route.path)
    .filter((path) => !menuPaths.has(path) && !ROUTES_WITHOUT_MENU.has(path));

  if (orphans.length > 0) {
    throw new Error(`Routes with no menu entry: ${orphans.join(", ")}`);
  }

  const seen = new Set<string>();
  [...builtRoutes, ...placeholderRoutes, ...branchRedirects, ...legacyRedirects].forEach(
    (route) => {
      if (seen.has(route.path)) {
        throw new Error(`Duplicate route path: ${route.path}`);
      }
      seen.add(route.path);
    }
  );
};

if (import.meta.env.DEV) assertRouteCoverage();

export const routes: RouteConfig[] = [
  { path: "/", element: <RootRedirect /> },

  { path: "shop/:slug", element: <PublicShop /> },

  { path: "sign/:token", element: <SignContract /> },

  { path: "events/:slug", element: <PublicEvent /> },
  { path: "meetings/:slug", element: <PublicMeeting /> },
  { path: "book/:slug", element: <PublicBooking /> },

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
        children: [...builtRoutes, ...placeholderRoutes, ...branchRedirects],
      },
    ],
  },

  { path: "403", element: <Forbidden /> },
  { path: "500", element: <InternalServerError /> },

  { path: "*", element: <NotFound /> },
];
