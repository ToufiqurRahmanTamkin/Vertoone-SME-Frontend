import type { Expense, FinanceCategoryRef, Income } from "./finance";

export const INVOICE_TYPES = ["INCOME", "EXPENSE"] as const;
export type InvoiceType = (typeof INVOICE_TYPES)[number];

export const INVOICE_STATUSES = ["DRAFT", "ISSUED", "PAID", "CANCELLED"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

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
  title: string;
  party: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string | null;
  reference: string;
  notes: string;
  issuedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedInvoice {
  _id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
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
  linked?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface InvoicePayload {
  type: InvoiceType;
  entryId?: string | null;
  status?: InvoiceStatus;
  title?: string;
  party?: string;
  amount?: number;
  currency?: string;
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
}

export interface LinkableEntry {
  _id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  party: string;
  reference: string;
  categoryName: string;
}

export interface LinkableEntryQuery {
  type: InvoiceType;
  search?: string;
  limit?: number;
  invoiceId?: string;
}

export const invoiceEntry = (invoice: Invoice): InvoiceEntryRef<Income | Expense> =>
  invoice.type === "INCOME" ? invoice.incomeId : invoice.expenseId;

export const invoiceEntryId = (invoice: Invoice): string | null => {
  const entry = invoiceEntry(invoice);
  if (!entry) return null;
  return typeof entry === "string" ? entry : entry._id;
};

export const isInvoiceLinked = (invoice: Invoice): boolean => invoiceEntryId(invoice) !== null;
