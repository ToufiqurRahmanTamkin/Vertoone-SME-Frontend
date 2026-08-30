export const SOCKET_EVENTS = {
  NOTIFICATION_CREATED: "notification:created",
  RESOURCE_CHANGED: "resource:changed",
  SESSION_REVOKED: "session:revoked",
} as const;

export const SOCKET_RESOURCES = [
  "DASHBOARD",
  "COMPANIES",
  "SOLD_SUBSCRIPTIONS",
  "SUBSCRIPTION_PLANS",
  "NOTIFICATIONS",
  "EMAILS",
  "FINANCE",
  "PERMISSIONS",
  "TEAM_MEMBERS",
  "CONCERNS",
  "USERS",
  "TAGS",
  "LEAD_SOURCES",
  "EMPLOYEES",
  "TEAMS",
  "DEPARTMENTS",
  "DESIGNATIONS",
  "MEETING_ROOMS",
  "SUPPLIERS",
  "ROLES",
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
