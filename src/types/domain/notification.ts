export type NotificationType =
  | "SUBSCRIPTION_SOLD"
  | "COMPANY_REGISTERED"
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED"
  | "PAYMENT_APPROVED"
  | "PAYMENT_REJECTED"
  | "PAYMENT_REFUNDED"
  | "SUBSCRIPTION_EXPIRING"
  | "FINANCE_ENTRY"
  | "SECURITY_LOGIN"
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
