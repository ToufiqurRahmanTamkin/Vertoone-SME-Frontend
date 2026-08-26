export const EMAIL_TEMPLATE_KEYS = [
  "SUBSCRIPTION_RENEWED",
  "RENEWAL_BILL_GENERATED",
  "PAYMENT_APPROVED",
  "PAYMENT_REJECTED",
  "PAYMENT_REFUNDED",
  "SUBSCRIPTION_EXPIRING",
  "SUBSCRIPTION_EXPIRED",
] as const;
export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export const EMAIL_STATUSES = ["SENT", "FAILED", "SKIPPED"] as const;
export type EmailStatus = (typeof EMAIL_STATUSES)[number];

export interface EmailLogListItem {
  _id: string;
  template: EmailTemplateKey;
  to: string;
  recipientName: string;
  subject: string;
  status: EmailStatus;
  errorMessage: string;
  relatedReference: string;
  relatedId: string | null;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog extends EmailLogListItem {
  html: string;
  text: string;
}

export interface EmailListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  template?: EmailTemplateKey;
  status?: EmailStatus;
  from?: string;
  to?: string;
}

export interface EmailSummary {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  lastSentAt: string | null;
  isMailConfigured: boolean;
}
