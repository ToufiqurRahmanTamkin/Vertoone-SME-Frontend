import { RealtimeContext, type RealtimeContextValue } from "@/contexts/realtime-context";
import {
  connectSocket,
  disconnectSocket,
  getSocketStatus,
  isRealtimeConfigured,
  subscribeToSocketStatus,
} from "@/lib/socket";
import { logOut, selectCurrentToken, selectCurrentUser } from "@/redux/authSlice";
import { baseApi, type TagType } from "@/redux/baseApi";
import type {
  NotificationCreatedPayload,
  RealtimeStatus,
  ResourceChangedPayload,
  SessionRevokedPayload,
  SocketResource,
} from "@/types/domain/realtime";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TAGS_BY_RESOURCE: Record<SocketResource, TagType[]> = {
  DASHBOARD: ["Dashboard"],
  COMPANIES: ["Companies", "CompanySummary", "MyCompany"],
  SOLD_SUBSCRIPTIONS: ["SoldSubscriptions", "MyCompany"],
  SUBSCRIPTION_REQUESTS: [
    "SubscriptionRequests",
    "SubscriptionRequestSummary",
    "MySubscriptionRequests",
  ],
  SUBSCRIPTION_PLANS: ["SubscriptionPlans"],
  NOTIFICATIONS: ["Notifications", "NotificationsUnread"],
  EMAILS: ["Emails"],
  FINANCE: ["Incomes", "Expenses", "FinanceCategories", "Reports"],
  PERMISSIONS: ["Permissions", "Me", "MyCompany"],
  TEAM_MEMBERS: ["TeamMembers", "TeamSummary"],
  CONCERNS: ["Concerns", "ConcernSummary"],
  USERS: ["AllUsers"],
  TAGS: ["Tags", "TagSummary", "TagOptions"],
  EMPLOYEES: ["Employees", "EmployeeSummary", "EmployeeOptions", "EmployeeSalaries"],
  TEAMS: ["Teams", "TeamsSummary"],
  DEPARTMENTS: ["Departments", "DepartmentSummary", "DepartmentOptions", "Employees"],
  DESIGNATIONS: ["Designations", "DesignationSummary", "DesignationOptions", "Employees"],
  LEAD_SOURCES: ["LeadSources", "LeadSourceSummary", "LeadSourceOptions", "Contacts", "Leads"],
  CONTACT_TYPES: [
    "ContactTypes",
    "ContactTypeSummary",
    "ContactTypeOptions",
    "Contacts",
    "Leads",
  ],
  CONTACTS: ["Contacts", "ContactSummary", "ContactOptions", "Leads"],
  LEADS: ["Leads", "LeadSummary"],
  PIPELINES: ["Pipelines", "PipelineSummary", "PipelineOptions", "PipelineBoard"],
  PIPELINE_ENTRIES: [
    "PipelineEntries",
    "PipelineEntrySummary",
    "PipelineBoard",
    "Pipelines",
    "PipelineSummary",
  ],
  PIPELINE_ACTIVITIES: [
    "PipelineActivities",
    "PipelineActivitySummary",
    "PipelineBoard",
    "PipelineEntries",
  ],
  DEALS: ["Deals", "DealSummary", "DealOptions", "DealBoard", "DealActivities"],
  DEAL_ACTIVITIES: ["DealActivities", "DealActivitySummary", "Deals", "DealBoard"],
  TASK_BOARDS: ["TaskBoards", "TaskBoardSummary", "TaskBoardOptions", "TaskBoardView"],
  TASKS: [
    "Tasks",
    "TaskSummary",
    "TaskBoardView",
    "TaskBoards",
    "TaskBoardSummary",
    "TaskAssigneeOptions",
  ],
  TASK_ACTIVITIES: ["TaskActivities", "TaskActivitySummary", "Tasks", "TaskBoardView"],
  GOALS: ["Goals", "GoalSummary", "GoalOptions"],
  NOTES: ["Notes", "NoteSummary"],
  DOCUMENTS: ["Documents", "DocumentSummary", "DocumentFolders", "DocumentsOverview"],
  CONTRACTS: ["Contracts", "ContractSummary", "DocumentsOverview"],
  SUPPLIERS: ["Suppliers", "SupplierSummary", "SupplierOptions"],
  PRODUCTS: ["Products", "ProductSummary", "ProductOptions"],
  PRODUCT_CATEGORIES: [
    "ProductCategories",
    "ProductCategorySummary",
    "ProductCategoryOptions",
    "Products",
  ],
  PRODUCT_SUB_CATEGORIES: [
    "ProductSubCategories",
    "ProductSubCategorySummary",
    "ProductSubCategoryOptions",
    "ProductCategories",
    "Products",
  ],
  BRANDS: ["Brands", "BrandSummary", "BrandOptions", "Products"],
  MEETING_ROOMS: [
    "MeetingRooms",
    "MeetingRoomSummary",
    "MeetingRoomOptions",
    "MeetingRoomFloors",
  ],
  CALENDAR_EVENTS: [
    "CalendarEvents",
    "CalendarEvent",
    "CalendarEventSummary",
    "CalendarEventOptions",
  ],
  CALENDAR_MEETINGS: [
    "CalendarMeetings",
    "CalendarMeeting",
    "CalendarMeetingSummary",
    "CalendarMeetingOptions",
  ],
  CALENDAR_BOOKINGS: [
    "CalendarBookings",
    "CalendarBooking",
    "CalendarBookingSummary",
    "CalendarBookingOptions",
    "CalendarBookingSlots",
  ],
  CALENDAR_REGISTRATIONS: [
    "CalendarRegistrations",
    "CalendarRegistration",
    "CalendarRegistrationSummary",
    "CalendarBookingSlots",
  ],
  ROLES: ["Roles", "RoleSummary", "RoleOptions", "Permissions"],
  EMPLOYEE_ROLES: [
    "EmployeeRoles",
    "EmployeeRoleSummary",
    "EmployeeRoleOptions",
    "EmployeeRoleHolders",
    "Permissions",
  ],
  WAREHOUSES: ["Warehouses", "WarehouseSummary", "WarehouseOptions", "Stock", "StockSummary"],
  STOCK: ["Stock", "StockSummary", "StockMovements", "PosCatalog"],
  STOCK_TRANSFERS: ["StockTransfers", "StockTransferSummary", "Stock", "StockSummary"],
  STOCK_ADJUSTMENTS: ["StockAdjustments", "StockAdjustmentSummary", "Stock", "StockSummary"],
  PURCHASE_ORDERS: ["PurchaseOrders", "PurchaseOrderSummary", "Stock", "StockSummary"],
  PURCHASE_RETURNS: ["PurchaseReturns", "PurchaseReturnSummary", "PurchaseOrders", "Stock"],
  QUOTATIONS: ["Quotations", "QuotationSummary"],
  SALES_ORDERS: ["SalesOrders", "SalesOrderSummary", "Quotations", "Stock", "StockSummary"],
  SALES_INVOICES: ["SalesInvoices", "SalesInvoiceSummary", "SalesOrders", "Stock", "StockSummary"],
  SALES_RETURNS: ["SalesReturns", "SalesReturnSummary", "SalesInvoices", "Stock"],
  SHOP: ["Shop", "ShopSummary"],
  POS: ["PosSummary", "PosRecent", "PosCatalog", "SalesInvoices", "Stock", "StockSummary"],
  WEB_SITE: ["WebSites", "WebSite", "WebSiteSummary", "BusinessToolsDashboard"],
  WEB_PAGES: [
    "WebPages",
    "WebPage",
    "WebSites",
    "WebSite",
    "WebSiteSummary",
    "BusinessToolsDashboard",
  ],
  FORMS: ["Forms", "Form", "FormSummary", "FormOptions", "BusinessToolsDashboard"],
  FORM_SUBMISSIONS: [
    "FormSubmissions",
    "FormSubmission",
    "FormSubmissionSummary",
    "Forms",
    "FormSummary",
    "BusinessToolsDashboard",
  ],
  BUSINESS_TOOLS_SETTINGS: ["BusinessToolsSettings"],
  HRMS_SETTINGS: ["HrmsSettings", "HrmsSettingsSummary"],
  LEAVE_TYPES: ["LeaveTypes", "LeaveTypeSummary", "LeaveTypeOptions", "HrmsSettingsSummary"],
  SHIFTS: ["Shifts", "ShiftSummary", "ShiftOptions", "HrmsSettingsSummary"],
  HOLIDAYS: ["Holidays", "HolidaySummary", "HrmsSettingsSummary"],
  EMAIL_TEMPLATES: [
    "EmailTemplates",
    "EmailTemplate",
    "EmailTemplateSummary",
    "EmailTemplateOptions",
    "BusinessToolsDashboard",
  ],
  EMAIL_DELIVERIES: [
    "EmailDeliveries",
    "EmailDelivery",
    "EmailTemplateSummary",
    "BusinessToolsDashboard",
  ],
};

const TOAST_BY_LEVEL: Record<string, (title: string, description: string) => void> = {
  SUCCESS: (title, description) => toast.success(title, { description }),
  WARNING: (title, description) => toast.warning(title, { description }),
  ERROR: (title, description) => toast.error(title, { description }),
  INFO: (title, description) => toast.info(title, { description }),
};

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  const socketStatus = React.useSyncExternalStore(subscribeToSocketStatus, getSocketStatus);
  const [lastEventAt, setLastEventAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isRealtimeConfigured()) return;

    if (!token || !user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);
    if (!socket) return;

    const markEvent = () => setLastEventAt(new Date().toISOString());

    const onNotification = (payload: NotificationCreatedPayload) => {
      markEvent();
      dispatch(baseApi.util.invalidateTags(["Notifications", "NotificationsUnread"]));

      const showToast = TOAST_BY_LEVEL[payload.level] ?? TOAST_BY_LEVEL.INFO;
      showToast(payload.title, payload.message);
    };

    const onResourceChanged = (payload: ResourceChangedPayload) => {
      markEvent();
      const tags = payload.resources.flatMap((resource) => TAGS_BY_RESOURCE[resource] ?? []);
      if (tags.length > 0) {
        dispatch(baseApi.util.invalidateTags(tags));
      }
    };

    const onConnect = () => {
      dispatch(baseApi.util.invalidateTags(TAGS_BY_RESOURCE.PERMISSIONS));
    };

    const onSessionRevoked = (payload: SessionRevokedPayload) => {
      toast.error("You have been signed out", { description: payload.reason });
      disconnectSocket();
      dispatch(logOut());
      navigate("/login", { replace: true });
    };

    socket.on("connect", onConnect);
    socket.on("notification:created", onNotification);
    socket.on("resource:changed", onResourceChanged);
    socket.on("session:revoked", onSessionRevoked);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("notification:created", onNotification);
      socket.off("resource:changed", onResourceChanged);
      socket.off("session:revoked", onSessionRevoked);
    };
  }, [token, user, dispatch, navigate]);

  React.useEffect(() => () => disconnectSocket(), []);

  const status: RealtimeStatus = !isRealtimeConfigured()
    ? "DISABLED"
    : !token || !user
      ? "DISCONNECTED"
      : socketStatus;

  const value = React.useMemo<RealtimeContextValue>(
    () => ({ status, isLive: status === "CONNECTED", lastEventAt }),
    [status, lastEventAt]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
