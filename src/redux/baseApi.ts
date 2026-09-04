import config from "@/config/envConfig";
import type { Pagination } from "@/types";
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { logOut, setCredentials, type User } from "./authSlice";
import { isPlatformRole, type UserRole } from "@/types/domain/auth";

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: config.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: Pagination;
}

export interface ApiErrorResponse {
  status: number;
  data: {
    success: boolean;
    message: string;
  };
}

const unwrapEnvelope = (result: Awaited<ReturnType<typeof baseQuery>>) => {
  if (!result.data) return;
  const envelope = result.data as ApiResponse;
  if (!envelope.success) return;
  result.data = envelope.meta ? { data: envelope.data, meta: envelope.meta } : envelope.data;
};

const PUBLIC_ENDPOINT_PATHS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/verify-otp",
  "/auth/reset-password",
  "/companies/register",
  "/companies/check-availability",
  "/subscription-plans/public",
  "/system-config/public",
  "/public/shop",
  "/public/calendar",
];

const requestPath = (args: string | FetchArgs): string => {
  const url = typeof args === "string" ? args : args.url;
  return url.split("?")[0];
};

const isPublicRequest = (args: string | FetchArgs): boolean => {
  const path = requestPath(args);
  return PUBLIC_ENDPOINT_PATHS.some((publicPath) => path.startsWith(publicPath));
};

const PLATFORM_FINANCE_PREFIX = "/finance/";
const COMPANY_FINANCE_PREFIX = "/company-finance/";

const scopeFinanceUrl = (
  args: string | FetchArgs,
  role: UserRole | undefined
): string | FetchArgs => {
  if (!role || isPlatformRole(role)) return args;

  const url = typeof args === "string" ? args : args.url;
  if (!url.startsWith(PLATFORM_FINANCE_PREFIX)) return args;

  const scoped = `${COMPANY_FINANCE_PREFIX}${url.slice(PLATFORM_FINANCE_PREFIX.length)}`;
  return typeof args === "string" ? scoped : { ...args, url: scoped };
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  const basename = (import.meta.env.VITE_BASENAME || "").replace(/\/+$/, "");
  const loginPath = `${basename}/login`;
  if (window.location.pathname === loginPath) return;
  window.location.href = loginPath;
};

interface AuthSnapshot {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

const readAuth = (api: { getState: () => unknown }): AuthSnapshot =>
  (api.getState() as { auth: AuthSnapshot }).auth;

const isSessionRejected = (error: FetchBaseQueryError | undefined): boolean =>
  error?.status === 401;

const REFRESH_COOLDOWN_MS = 5000;

let refreshBlockedUntil = 0;
let sessionEnded = false;

const endSession = (dispatch: (action: ReturnType<typeof logOut>) => unknown): void => {
  if (sessionEnded) return;
  sessionEnded = true;
  refreshBlockedUntil = 0;
  dispatch(logOut());
  redirectToLogin();
};

export const resetSessionGuard = (): void => {
  sessionEnded = false;
  refreshBlockedUntil = 0;
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (rawArgs, api, extraOptions) => {
  const args = scopeFinanceUrl(rawArgs, readAuth(api).user?.role);

  await mutex.waitForUnlock();

  const tokenUsed = readAuth(api).token;

  let result = await baseQuery(args, api, extraOptions);

  unwrapEnvelope(result);

  if (result.error?.status !== 401 || isPublicRequest(args)) {
    return result;
  }

  const release = await mutex.acquire();
  try {
    const auth = readAuth(api);

    if (auth.token && auth.token !== tokenUsed) {
      result = await baseQuery(args, api, extraOptions);
      unwrapEnvelope(result);
      return result;
    }

    if (!auth.refreshToken || !auth.user) {
      endSession(api.dispatch);
      return result;
    }

    if (Date.now() < refreshBlockedUntil) {
      return result;
    }

    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST", body: { refreshToken: auth.refreshToken } },
      api,
      extraOptions
    );

    const envelope = refreshResult.data as
      | ApiResponse<{ accessToken: string; refreshToken: string }>
      | undefined;

    if (envelope?.success && envelope.data?.accessToken) {
      resetSessionGuard();
      api.dispatch(
        setCredentials({
          user: auth.user,
          accessToken: envelope.data.accessToken,
          refreshToken: envelope.data.refreshToken,
        })
      );

      result = await baseQuery(args, api, extraOptions);
      unwrapEnvelope(result);
      return result;
    }

    if (isSessionRejected(refreshResult.error)) {
      endSession(api.dispatch);
      return result;
    }

    refreshBlockedUntil = Date.now() + REFRESH_COOLDOWN_MS;
    return refreshResult.error ? { error: refreshResult.error, meta: result.meta } : result;
  } finally {
    release();
  }
};

export const ALL_TAG_TYPES = [
  "Me",
  "AiAllowance",
  "Dashboard",
  "SystemConfig",
  "SystemOverview",
  "SubscriptionPlans",
  "SoldSubscriptions",
  "SubscriptionRequests",
  "SubscriptionRequestSummary",
  "MySubscriptionRequests",
  "UserGuides",
  "FinanceCategories",
  "Incomes",
  "Expenses",
  "Invoices",
  "LinkableEntries",
  "LinkableInvoices",
  "FinanceDashboard",
  "Notifications",
  "NotificationsUnread",
  "LoginHistory",
  "Reports",
  "Emails",
  "Companies",
  "CompanySummary",
  "MyCompany",
  "Activities",
  "DataWipe",
  "Permissions",
  "ModuleCatalogue",
  "TeamMembers",
  "TeamSummary",
  "Concerns",
  "ConcernSummary",
  "AllUsers",
  "UserOptions",
  "Maintainers",
  "MaintainerSummary",
  "Tags",
  "TagSummary",
  "TagOptions",
  "Employees",
  "EmployeeSummary",
  "EmployeeSalaries",
  "EmployeeOptions",
  "Teams",
  "TeamsSummary",
  "Departments",
  "DepartmentSummary",
  "DepartmentOptions",
  "Designations",
  "DesignationSummary",
  "DesignationOptions",
  "HrmsSettings",
  "HrmsSettingsSummary",
  "EmployeeRoles",
  "EmployeeRoleSummary",
  "EmployeeRoleOptions",
  "EmployeeRoleHolders",
  "LeaveTypes",
  "LeaveTypeSummary",
  "LeaveTypeOptions",
  "Shifts",
  "ShiftSummary",
  "ShiftOptions",
  "JobOpenings",
  "JobOpening",
  "JobOpeningSummary",
  "JobOpeningOptions",
  "EmailSettings",
  "EmailProviders",
  "Holidays",
  "HolidaySummary",
  "LeadSources",
  "LeadSourceSummary",
  "LeadSourceOptions",
  "ContactTypes",
  "ContactTypeSummary",
  "ContactTypeOptions",
  "Contacts",
  "ContactSummary",
  "ContactOptions",
  "Leads",
  "LeadSummary",
  "Pipelines",
  "PipelineSummary",
  "PipelineOptions",
  "PipelineBoard",
  "PipelineEntries",
  "PipelineEntrySummary",
  "PipelineActivities",
  "PipelineActivitySummary",
  "Deals",
  "DealSummary",
  "DealOptions",
  "DealBoard",
  "DealActivities",
  "DealActivitySummary",
  "TasksGoalsOverview",
  "DocumentsOverview",
  "Documents",
  "DocumentSummary",
  "DocumentFolders",
  "Contracts",
  "ContractSummary",
  "PublicContract",
  "TaskBoards",
  "TaskBoardSummary",
  "TaskBoardOptions",
  "TaskBoardView",
  "Tasks",
  "TaskSummary",
  "TaskAssigneeOptions",
  "TaskActivities",
  "TaskActivitySummary",
  "Goals",
  "GoalSummary",
  "GoalOptions",
  "Notes",
  "NoteSummary",
  "ResourceShares",
  "ResourceShareInvitations",
  "ResourceShareSummary",
  "SharedGoals",
  "SharedNotes",
  "SharedBoards",
  "Suppliers",
  "SupplierSummary",
  "SupplierOptions",
  "Products",
  "ProductSummary",
  "ProductOptions",
  "ProductCategories",
  "ProductCategorySummary",
  "ProductCategoryOptions",
  "ProductSubCategories",
  "ProductSubCategorySummary",
  "ProductSubCategoryOptions",
  "Brands",
  "BrandSummary",
  "BrandOptions",
  "MeetingRooms",
  "MeetingRoomSummary",
  "MeetingRoomOptions",
  "MeetingRoomFloors",
  "CalendarOverview",
  "CalendarSchedule",
  "CalendarEvents",
  "CalendarEvent",
  "CalendarEventSummary",
  "CalendarEventOptions",
  "CalendarMeetings",
  "CalendarMeeting",
  "CalendarMeetingSummary",
  "CalendarMeetingOptions",
  "CalendarBookings",
  "CalendarBooking",
  "CalendarBookingSummary",
  "CalendarBookingOptions",
  "CalendarBookingSlots",
  "CalendarRegistrations",
  "CalendarRegistration",
  "CalendarRegistrationSummary",
  "Roles",
  "RoleSummary",
  "RoleOptions",
  "Warehouses",
  "WarehouseSummary",
  "WarehouseOptions",
  "Stock",
  "StockSummary",
  "StockMovements",
  "StockTransfers",
  "StockTransferSummary",
  "StockAdjustments",
  "StockAdjustmentSummary",
  "PurchaseOrders",
  "PurchaseOrderSummary",
  "PurchaseReturns",
  "PurchaseReturnSummary",
  "Quotations",
  "QuotationSummary",
  "SalesOrders",
  "SalesOrderSummary",
  "SalesInvoices",
  "SalesInvoiceSummary",
  "SalesReturns",
  "SalesReturnSummary",
  "Shop",
  "ShopSummary",
  "PosCatalog",
  "PosSummary",
  "PosRecent",
  "WebBlocks",
  "WebTemplates",
  "WebSites",
  "WebSite",
  "WebSiteSummary",
  "WebPages",
  "WebPage",
  "FormFields",
  "FormTemplates",
  "Forms",
  "Form",
  "FormSummary",
  "FormOptions",
  "FormSubmissions",
  "FormSubmission",
  "FormSubmissionSummary",
  "BusinessToolsSettings",
  "BusinessToolsDashboard",
  "EmailBlocks",
  "EmailStarters",
  "EmailTemplates",
  "EmailTemplate",
  "EmailTemplateSummary",
  "EmailTemplateOptions",
  "EmailRecipients",
  "EmailDeliveries",
  "EmailDelivery",
  "CountryHolidays",
  "Assets",
  "AssetSummary",
  "AssetOverview",
  "AssetCategories",
  "AssetAssignments",
  "AssetAssignmentSummary",
  "MyAssetAssignments",
  "AssetHolders",
  "AssetMaintenance",
  "AssetMaintenanceSummary",
  "Policies",
  "MyPolicies",
  "PolicySummary",
  "PolicyOverview",
  "PolicyAcknowledgements",
  "PolicyAcknowledgementSummary",
  "Announcements",
  "AnnouncementFeed",
  "AnnouncementSummary",
  "AnnouncementOverview",
  "AnnouncementReaders",
  "CommunityOverview",
  "CommunitySettings",
  "CommunityMembers",
  "CommunityMemberSummary",
  "CommunityMemberOptions",
  "CommunityCandidates",
  "CommunityGroups",
  "CommunityGroupSummary",
  "CommunityGroupOptions",
  "CommunityPosts",
  "CommunityPostSummary",
  "CommunityJoinRequests",
  "CommunityJoinRequestSummary",
  "CommunityConversations",
  "CommunityConversation",
  "CommunityMessages",
  "CommunityChatSummary",
  "ManagedFiles",
  "ManagedFileSummary",
  "FileShareTargets",
  "GoogleDriveConfig",
] as const;

export type TagType = (typeof ALL_TAG_TYPES)[number];

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ALL_TAG_TYPES,
  endpoints: () => ({}),
});
