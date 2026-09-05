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
  EMAIL_SETTINGS: ["EmailSettings"],
  JOB_OPENINGS: [
    "JobOpenings",
    "JobOpening",
    "JobOpeningSummary",
    "JobOpeningOptions",
  ],
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
  LEADS: ["Leads", "LeadSummary", "LeadOptions", "CrmActivities"],
  PIPELINES: ["Pipelines", "PipelineSummary", "PipelineOptions", "DealBoard"],
  DEALS: [
    "Deals",
    "DealSummary",
    "DealOptions",
    "DealBoard",
    "CrmActivities",
    "Pipelines",
    "PipelineSummary",
    "Forecast",
    "Territories",
    "TerritorySummary",
  ],
  CRM_ACTIVITIES: ["CrmActivities", "CrmActivitySummary", "Deals", "DealBoard", "Leads"],
  CRM_FORECASTS: ["Forecast", "ForecastTargets"],
  CRM_TERRITORIES: ["Territories", "TerritorySummary", "TerritoryOptions"],
  TASK_BOARDS: [
    "TaskBoards",
    "TaskBoardSummary",
    "TaskBoardOptions",
    "TaskBoardView",
    "SharedBoards",
  ],
  TASKS: [
    "Tasks",
    "TaskSummary",
    "TaskBoardView",
    "TaskBoards",
    "TaskBoardSummary",
    "TaskAssigneeOptions",
  ],
  TASK_ACTIVITIES: ["TaskActivities", "TaskActivitySummary", "Tasks", "TaskBoardView"],
  GOALS: ["Goals", "GoalSummary", "GoalOptions", "SharedGoals"],
  NOTES: ["Notes", "NoteSummary", "SharedNotes"],
  RESOURCE_SHARES: [
    "ResourceShares",
    "ResourceShareInvitations",
    "ResourceShareSummary",
    "SharedGoals",
    "SharedNotes",
    "SharedBoards",
    "Permissions",
    "Me",
  ],
  DOCUMENTS: ["Documents", "DocumentSummary", "DocumentFolders", "DocumentsOverview"],
  MANAGED_FILES: ["ManagedFiles", "ManagedFileSummary"],
  ASSETS: ["Assets", "AssetSummary", "AssetOverview", "AssetHolders"],
  ASSET_CATEGORIES: ["AssetCategories", "AssetSummary", "AssetOverview"],
  ASSET_ASSIGNMENTS: [
    "AssetAssignments",
    "MyAssetAssignments",
    "AssetAssignmentSummary",
    "Assets",
    "AssetOverview",
  ],
  ASSET_MAINTENANCE: ["AssetMaintenance", "AssetMaintenanceSummary", "Assets", "AssetOverview"],
  POLICIES: ["Policies", "MyPolicies", "PolicySummary", "PolicyOverview"],
  POLICY_ACKNOWLEDGEMENTS: ["PolicyAcknowledgements", "PolicyAcknowledgementSummary", "Policies", "MyPolicies", "PolicySummary", "PolicyOverview"],
  ANNOUNCEMENTS: ["Announcements", "AnnouncementFeed", "AnnouncementSummary", "AnnouncementOverview", "AnnouncementReaders"],
  COMMUNITY_SETTINGS: ["CommunitySettings", "CommunityOverview"],
  COMMUNITY_MEMBERS: [
    "CommunityMembers",
    "CommunityMemberSummary",
    "CommunityMemberOptions",
    "CommunityCandidates",
    "CommunityOverview",
  ],
  COMMUNITY_GROUPS: [
    "CommunityGroups",
    "CommunityGroupSummary",
    "CommunityGroupOptions",
    "CommunityJoinRequests",
    "CommunityJoinRequestSummary",
    "CommunityOverview",
  ],
  COMMUNITY_POSTS: ["CommunityPosts", "CommunityPostSummary", "CommunityOverview"],
  COMMUNITY_JOIN_REQUESTS: [
    "CommunityJoinRequests",
    "CommunityJoinRequestSummary",
    "CommunityGroups",
    "CommunityGroupSummary",
  ],
  COMMUNITY_CHATS: [
    "CommunityConversations",
    "CommunityConversation",
    "CommunityChatSummary",
  ],
  COMMUNITY_MESSAGES: [
    "CommunityMessages",
    "CommunityConversations",
    "CommunityConversation",
    "CommunityChatSummary",
  ],
  CONTRACTS: ["Contracts", "ContractSummary", "DocumentsOverview"],
  SUPPLIERS: ["Suppliers", "SupplierSummary", "SupplierOptions", "PurchasesOverview"],
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
  BRANDS: ["Brands", "BrandSummary", "BrandOptions", "Products", "ProductOverview"],
  PRODUCT_UNITS: ["Units", "UnitSummary", "UnitOptions", "Products", "ProductOverview"],
  PRODUCT_OPTIONS: [
    "ProductOptionSets",
    "ProductOptionChoices",
    "ProductVariants",
    "ProductVariantSummary",
  ],
  PRODUCT_VARIANTS: [
    "ProductVariants",
    "ProductVariantSummary",
    "ProductOptionSets",
    "ProductOverview",
  ],
  PRODUCT_BUNDLES: ["ProductBundles", "ProductBundleSummary", "ProductOverview"],
  PRICE_LISTS: [
    "PriceLists",
    "PriceListSummary",
    "PriceListOptions",
    "PriceListItems",
    "ProductOverview",
  ],
  PROMOTIONS: ["Promotions", "PromotionSummary", "ProductOverview"],
  PRODUCT_BARCODES: [
    "ProductBarcodes",
    "ProductBarcodeSummary",
    "Products",
    "ProductOverview",
  ],
  LABEL_TEMPLATES: ["LabelTemplates", "ProductBarcodeSummary"],
  INVENTORY_BATCHES: [
    "InventoryBatches",
    "InventoryBatchSummary",
    "SerialNumbers",
    "InventoryOverview",
  ],
  SERIAL_NUMBERS: ["SerialNumbers", "SerialNumberSummary", "InventoryOverview"],
  STOCK_COUNTS: ["StockCounts", "StockCountSummary", "InventoryOverview"],
  REORDER_RULES: ["ReorderRules", "ReorderRuleSummary", "InventoryOverview"],
  BIN_LOCATIONS: ["BinLocations", "BinLocationSummary", "InventoryOverview"],
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
    "CalendarSchedule",
    "CalendarOverview",
  ],
  CALENDAR_MEETINGS: [
    "CalendarMeetings",
    "CalendarMeeting",
    "CalendarMeetingSummary",
    "CalendarMeetingOptions",
    "CalendarSchedule",
    "CalendarOverview",
  ],
  CALENDAR_BOOKINGS: [
    "CalendarBookings",
    "CalendarBooking",
    "CalendarBookingSummary",
    "CalendarBookingOptions",
    "CalendarBookingSlots",
    "CalendarSchedule",
    "CalendarOverview",
  ],
  CALENDAR_REGISTRATIONS: [
    "CalendarRegistrations",
    "CalendarRegistration",
    "CalendarRegistrationSummary",
    "CalendarBookingSlots",
    "CalendarSchedule",
    "CalendarOverview",
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
  STOCK: [
    "Stock",
    "StockSummary",
    "StockMovements",
    "PosCatalog",
    "Valuation",
    "ValuationSummary",
    "ValuationBreakdown",
    "InventoryOverview",
    "ReorderRules",
    "ReorderRuleSummary",
  ],
  STOCK_TRANSFERS: ["StockTransfers", "StockTransferSummary", "Stock", "StockSummary"],
  STOCK_ADJUSTMENTS: ["StockAdjustments", "StockAdjustmentSummary", "Stock", "StockSummary"],
  PURCHASE_ORDERS: [
    "PurchaseOrders",
    "PurchaseOrderSummary",
    "PurchasesOverview",
    "Suppliers",
    "SupplierSummary",
    "Stock",
    "StockSummary",
  ],
  PURCHASE_RETURNS: [
    "PurchaseReturns",
    "PurchaseReturnSummary",
    "PurchaseOrders",
    "PurchasesOverview",
    "Stock",
  ],
  PURCHASE_REQUISITIONS: [
    "PurchaseRequisitions",
    "PurchaseRequisitionSummary",
    "RequestsForQuote",
    "PurchaseOrders",
    "PurchasesOverview",
  ],
  PURCHASE_RFQS: [
    "RequestsForQuote",
    "RequestForQuoteSummary",
    "PurchaseRequisitions",
    "PurchaseOrders",
    "PurchasesOverview",
  ],
  GOODS_RECEIPTS: [
    "GoodsReceipts",
    "GoodsReceiptSummary",
    "PurchaseOrders",
    "PurchaseOrderSummary",
    "PurchasesOverview",
    "Stock",
    "StockSummary",
  ],
  BILLS: [
    "Bills",
    "BillSummary",
    "PayableBills",
    "GoodsReceipts",
    "PurchasesOverview",
    "Suppliers",
    "SupplierSummary",
  ],
  PAYMENTS_MADE: [
    "PaymentsMade",
    "PaymentMadeSummary",
    "Bills",
    "BillSummary",
    "PayableBills",
    "PurchaseOrders",
    "PurchasesOverview",
    "Suppliers",
    "SupplierSummary",
  ],
  DEBIT_NOTES: [
    "DebitNotes",
    "DebitNoteSummary",
    "Bills",
    "BillSummary",
    "PayableBills",
    "PurchaseReturns",
    "PurchaseReturnSummary",
    "PurchasesOverview",
    "Suppliers",
    "SupplierSummary",
  ],
  LANDED_COSTS: [
    "LandedCosts",
    "LandedCostSummary",
    "GoodsReceipts",
    "PurchasesOverview",
    "Stock",
    "StockSummary",
  ],
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
  SHIFT_ASSIGNMENTS: [
    "ShiftAssignments",
    "ShiftAssignmentSummary",
    "MyShiftPlan",
    "RosterBoard",
  ],
  SHIFT_ROSTERS: ["Rosters", "RosterBoard", "RosterSummary", "MyRoster", "MyShiftPlan"],
  ATTENDANCE: [
    "Attendance",
    "AttendanceSummary",
    "AttendanceCalendar",
    "AttendanceToday",
    "MyAttendance",
    "MyAttendanceCalendar",
    "MyAttendanceToday",
  ],
  ATTENDANCE_CORRECTIONS: [
    "AttendanceCorrections",
    "AttendanceCorrectionSummary",
    "MyAttendanceCorrections",
    "MyAttendanceCorrectionSummary",
    "MyRequestsOverview",
  ],
  LEAVE_REQUESTS: [
    "LeaveRequests",
    "LeaveRequestSummary",
    "MyLeaveRequests",
    "MyLeaveRequestSummary",
    "MyRequestsOverview",
  ],
  EMPLOYEE_REQUESTS: [
    "EmployeeRequests",
    "EmployeeRequestSummary",
    "MyEmployeeRequests",
    "MyEmployeeRequestSummary",
    "MyRequestsOverview",
  ],
  WORK_HISTORIES: ["WorkHistories", "WorkHistorySummary", "MyWorkHistory"],
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
