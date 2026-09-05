export const SOCKET_EVENTS = {
  NOTIFICATION_CREATED: "notification:created",
  RESOURCE_CHANGED: "resource:changed",
  SESSION_REVOKED: "session:revoked",
} as const;

export const SOCKET_RESOURCES = [
  "DASHBOARD",
  "COMPANIES",
  "SOLD_SUBSCRIPTIONS",
  "SUBSCRIPTION_REQUESTS",
  "SUBSCRIPTION_PLANS",
  "NOTIFICATIONS",
  "EMAILS",
  "EMAIL_SETTINGS",
  "FINANCE",
  "PERMISSIONS",
  "TEAM_MEMBERS",
  "CONCERNS",
  "USERS",
  "TAGS",
  "LEAD_SOURCES",
  "CONTACT_TYPES",
  "CONTACTS",
  "LEADS",
  "PIPELINES",
  "DEALS",
  "CRM_ACTIVITIES",
  "CRM_FORECASTS",
  "CRM_TERRITORIES",
  "TASK_BOARDS",
  "TASKS",
  "TASK_ACTIVITIES",
  "GOALS",
  "NOTES",
  "RESOURCE_SHARES",
  "DOCUMENTS",
  "MANAGED_FILES",
  "CONTRACTS",
  "EMPLOYEES",
  "TEAMS",
  "DEPARTMENTS",
  "DESIGNATIONS",
  "MEETING_ROOMS",
  "CALENDAR_EVENTS",
  "CALENDAR_MEETINGS",
  "CALENDAR_BOOKINGS",
  "CALENDAR_REGISTRATIONS",
  "SUPPLIERS",
  "PRODUCTS",
  "PRODUCT_CATEGORIES",
  "PRODUCT_SUB_CATEGORIES",
  "BRANDS",
  "WAREHOUSES",
  "STOCK",
  "STOCK_TRANSFERS",
  "STOCK_ADJUSTMENTS",
  "PURCHASE_ORDERS",
  "PURCHASE_RETURNS",
  "QUOTATIONS",
  "SALES_ORDERS",
  "SALES_INVOICES",
  "SALES_RETURNS",
  "SHOP",
  "POS",
  "ROLES",
  "EMPLOYEE_ROLES",
  "WEB_SITE",
  "WEB_PAGES",
  "FORMS",
  "FORM_SUBMISSIONS",
  "BUSINESS_TOOLS_SETTINGS",
  "HRMS_SETTINGS",
  "LEAVE_TYPES",
  "SHIFTS",
  "SHIFT_ASSIGNMENTS",
  "SHIFT_ROSTERS",
  "ATTENDANCE",
  "ATTENDANCE_CORRECTIONS",
  "LEAVE_REQUESTS",
  "EMPLOYEE_REQUESTS",
  "WORK_HISTORIES",
  "HOLIDAYS",
  "ASSETS",
  "ASSET_CATEGORIES",
  "ASSET_ASSIGNMENTS",
  "ASSET_MAINTENANCE",
  "POLICIES",
  "POLICY_ACKNOWLEDGEMENTS",
  "ANNOUNCEMENTS",
  "JOB_OPENINGS",
  "COMMUNITY_SETTINGS",
  "COMMUNITY_MEMBERS",
  "COMMUNITY_GROUPS",
  "COMMUNITY_POSTS",
  "COMMUNITY_JOIN_REQUESTS",
  "COMMUNITY_CHATS",
  "COMMUNITY_MESSAGES",
  "EMAIL_TEMPLATES",
  "EMAIL_DELIVERIES",
] as const;
export type SocketResource = (typeof SOCKET_RESOURCES)[number];

export interface NotificationCreatedPayload {
  _id: string;
  type: string;
  level: string;
  title: string;
  message: string;
  link: string;
  createdAt: string;
}

export interface ResourceChangedPayload {
  resources: SocketResource[];
  reason: string;
}

export interface SessionRevokedPayload {
  reason: string;
}

export interface ServerToClientEvents {
  "notification:created": (payload: NotificationCreatedPayload) => void;
  "resource:changed": (payload: ResourceChangedPayload) => void;
  "session:revoked": (payload: SessionRevokedPayload) => void;
}

export interface ClientToServerEvents {
  "presence:subscribe": () => void;
}

export type RealtimeStatus = "DISABLED" | "CONNECTING" | "CONNECTED" | "DISCONNECTED";
