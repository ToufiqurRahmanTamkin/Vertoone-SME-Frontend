import type { Expense, FinanceCategoryRef, Income } from "./finance";
import type { PaymentMethod } from "./soldSubscription";

export const INVOICE_TYPES = ["INCOME", "EXPENSE"] as const;
export type InvoiceType = (typeof INVOICE_TYPES)[number];

export const INVOICE_STATUSES = ["DRAFT", "UNPAID", "PAID", "CANCELLED", "CLOSED"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const OPEN_INVOICE_STATUSES: InvoiceStatus[] = ["DRAFT", "UNPAID"];

export const VOID_INVOICE_STATUSES: InvoiceStatus[] = ["CANCELLED", "CLOSED"];

export const INVOICE_PAYMENT_REVIEW_ACTIONS = ["APPROVED", "REJECTED"] as const;
export type InvoicePaymentReviewAction = (typeof INVOICE_PAYMENT_REVIEW_ACTIONS)[number];

export const INVOICE_ORIGINS = ["AUTO", "MANUAL"] as const;
export type InvoiceOrigin = (typeof INVOICE_ORIGINS)[number];

export type InvoiceEntryRef<T> = string | (T & { categoryId: FinanceCategoryRef }) | null;

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  origin: InvoiceOrigin;
  incomeId: InvoiceEntryRef<Income>;
  expenseId: InvoiceEntryRef<Expense>;
  categoryId: FinanceCategoryRef | null;
  title: string;
  party: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  issueDate: string;
  dueDate: string | null;
  paidAt: string | null;
  reference: string;
  notes: string;
  issuedBy: string | null;
  subscriptionId: string | null;
  transactionId: string;
  paymentNote: string;
  paymentPaidOn: string | null;
  paymentSubmittedAt: string | null;
  paymentSubmittedBy: string | null;
  paymentReviewAction: InvoicePaymentReviewAction | null;
  paymentReviewedBy: string | null;
  paymentReviewedAt: string | null;
  paymentReviewNote: string;
  cancelledAt: string | null;
  statusNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedInvoice {
  _id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  origin: InvoiceOrigin;
  amount: number;
  issueDate: string;
  dueDate: string | null;
  paidAt: string | null;
}

export interface InvoiceListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  origin?: InvoiceOrigin;
  categoryId?: string;
  linked?: boolean;
  overdue?: boolean;
  awaitingApproval?: boolean;
  subscriptionOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface InvoicePayload {
  type: InvoiceType;
  entryId?: string | null;
  generateEntry?: boolean;
  categoryId?: string;
  status?: InvoiceStatus;
  title?: string;
  party?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  issueDate?: string;
  dueDate?: string | null;
  reference?: string;
  notes?: string;
}

export interface InvoiceSummary {
  totalCount: number;
  incomeAmount: number;
  expenseAmount: number;
  outstandingAmount: number;
  overdueCount: number;
  draftCount: number;
  paidCount: number;
  cancelledCount: number;
  awaitingApprovalCount: number;
}

export interface InvoiceStatusPayload {
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paidAt?: string | null;
  note?: string;
}

export interface InvoicePaymentSubmissionPayload {
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
  note?: string;
}

export interface InvoicePaymentReviewPayload {
  note?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
}

export interface LinkableEntry {
  _id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  party: string;
  reference: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  categoryId: string;
  categoryName: string;
}

export interface LinkableEntryQuery {
  type: InvoiceType;
  search?: string;
  limit?: number;
  invoiceId?: string;
}

export interface LinkableInvoice {
  _id: string;
  invoiceNumber: string;
  title: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  party: string;
  reference: string;
}

export interface LinkableInvoiceQuery {
  type: InvoiceType;
  search?: string;
  limit?: number;
  entryId?: string;
}

export const invoiceEntry = (invoice: Invoice): InvoiceEntryRef<Income | Expense> =>
  invoice.type === "INCOME" ? invoice.incomeId : invoice.expenseId;

export const invoiceEntryId = (invoice: Invoice): string | null => {
  const entry = invoiceEntry(invoice);
  if (!entry) return null;
  return typeof entry === "string" ? entry : entry._id;
};

export const isInvoiceLinked = (invoice: Invoice): boolean => invoiceEntryId(invoice) !== null;

export const isInvoiceOverdue = (invoice: Invoice): boolean =>
  invoice.status === "UNPAID" && Boolean(invoice.dueDate) && new Date(invoice.dueDate!) < new Date();

export const isSubscriptionInvoice = (invoice: Invoice): boolean =>
  invoice.subscriptionId !== null;

export const isAwaitingPaymentApproval = (invoice: Invoice): boolean =>
  isSubscriptionInvoice(invoice) &&
  invoice.paymentSubmittedAt !== null &&
  invoice.paymentReviewAction === null &&
  invoice.status !== "PAID";

export const canSubmitInvoicePayment = (invoice: Invoice): boolean =>
  isSubscriptionInvoice(invoice) &&
  invoice.type === "EXPENSE" &&
  invoice.status !== "PAID" &&
  !VOID_INVOICE_STATUSES.includes(invoice.status);

export const canReviewInvoicePayment = (invoice: Invoice): boolean =>
  isSubscriptionInvoice(invoice) &&
  invoice.type === "INCOME" &&
  invoice.status !== "PAID" &&
  !VOID_INVOICE_STATUSES.includes(invoice.status);
