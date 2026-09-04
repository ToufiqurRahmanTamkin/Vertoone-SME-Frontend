export type NotificationType =
  | "SUBSCRIPTION_SOLD"
  | "COMPANY_REGISTERED"
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED"
  | "PAYMENT_SUBMITTED"
  | "PAYMENT_APPROVED"
  | "PAYMENT_REJECTED"
  | "PAYMENT_REFUNDED"
  | "SUBSCRIPTION_EXPIRING"
  | "SUBSCRIPTION_TRIAL_BILLED"
  | "SUBSCRIPTION_CANCELLATION_REQUESTED"
  | "SUBSCRIPTION_CANCELLED"
  | "SUBSCRIPTION_SUSPENDED"
  | "SUBSCRIPTION_UPGRADE_REQUESTED"
  | "SUBSCRIPTION_UPGRADED"
  | "COMPANY_DATA_PURGED"
  | "FINANCE_ENTRY"
  | "SECURITY_LOGIN"
  | "COMMUNITY_POST"
  | "COMMUNITY_COMMENT"
  | "COMMUNITY_MESSAGE"
  | "COMMUNITY_JOIN_REQUESTED"
  | "COMMUNITY_JOIN_APPROVED"
  | "COMMUNITY_JOIN_DECLINED"
  | "RESOURCE_SHARED"
  | "RESOURCE_SHARE_ACCEPTED"
  | "RESOURCE_SHARE_DECLINED"
  | "RESOURCE_SHARE_UPDATED"
  | "RESOURCE_SHARE_REVOKED"
  | "SYSTEM";

export type NotificationLevel = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface AppNotification {
  _id: string;
  type: NotificationType;
  level: NotificationLevel;
  title: string;
  message: string;
  link: string;
  meta: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: NotificationType;
  level?: NotificationLevel;
  unreadOnly?: boolean;
}

export interface UnreadCount {
  unread: number;
}
