import { FINANCE_CATEGORY_TYPES, FINANCE_STATUSES } from "@/types/domain/finance";
import { INVOICE_STATUSES, INVOICE_TYPES } from "@/types/domain/invoice";
import { PAYMENT_METHODS, requiresTransactionId } from "@/types/domain/soldSubscription";
import { z } from "zod";

export const FinanceCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  type: z.enum(FINANCE_CATEGORY_TYPES),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer"),
  isActive: z.boolean(),
});

export type FinanceCategoryFormValues = z.infer<typeof FinanceCategorySchema>;

export const FINANCE_ENTRY_INVOICE_MODES = ["GENERATE", "LINK", "NONE"] as const;
export type FinanceEntryInvoiceMode = (typeof FINANCE_ENTRY_INVOICE_MODES)[number];

export const FinanceEntrySchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters").max(140),
    categoryId: z.string().min(1, "Pick a category"),
    amount: z.number().min(0, "Amount cannot be negative"),
    currency: z
      .string()
      .trim()
      .length(3, "Use a 3-letter currency code")
      .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
    date: z.string().min(1, "Pick a date"),
    status: z.enum(FINANCE_STATUSES),
    paymentMethod: z.enum(PAYMENT_METHODS),
    party: z.string().trim().max(140),
    partyUserId: z.string(),
    reference: z.string().trim().max(120),
    notes: z.string().trim().max(1000),
    invoiceMode: z.enum(FINANCE_ENTRY_INVOICE_MODES),
    invoiceId: z.string(),
  })
  .refine((data) => data.invoiceMode !== "LINK" || data.invoiceId.length > 0, {
    message: "Pick the invoice this entry belongs to",
    path: ["invoiceId"],
  });

export type FinanceEntryFormValues = z.infer<typeof FinanceEntrySchema>;

export const INVOICE_ENTRY_MODES = ["GENERATE", "LINK", "NONE"] as const;
export type InvoiceEntryMode = (typeof INVOICE_ENTRY_MODES)[number];

export const InvoiceSchema = z
  .object({
    type: z.enum(INVOICE_TYPES),
    entryMode: z.enum(INVOICE_ENTRY_MODES),
    entryId: z.string(),
    categoryId: z.string(),
    status: z.enum(INVOICE_STATUSES),
    title: z.string().trim().max(140),
    party: z.string().trim().max(140),
    amount: z.number().min(0, "Amount cannot be negative"),
    currency: z
      .string()
      .trim()
      .length(3, "Use a 3-letter currency code")
      .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
    paymentMethod: z.enum(PAYMENT_METHODS),
    issueDate: z.string().min(1, "Pick an issue date"),
    dueDate: z.string(),
    reference: z.string().trim().max(120),
    notes: z.string().trim().max(1000),
  })
  .refine((data) => data.entryMode !== "LINK" || data.entryId.length > 0, {
    message: "Pick the entry this invoice bills",
    path: ["entryId"],
  })
  .refine((data) => data.entryMode === "LINK" || data.categoryId.length > 0, {
    message: "Pick the category this invoice is filed under",
    path: ["categoryId"],
  })
  .refine((data) => data.entryMode === "LINK" || data.title.trim().length >= 2, {
    message: "Title must be at least 2 characters",
    path: ["title"],
  })
  .refine((data) => !data.dueDate || !data.issueDate || data.dueDate >= data.issueDate, {
    message: "The due date cannot fall before the issue date",
    path: ["dueDate"],
  });

export type InvoiceFormValues = z.infer<typeof InvoiceSchema>;

export const InvoiceStatusSchema = z.object({
  status: z.enum(INVOICE_STATUSES),
  note: z.string().trim().max(500),
});

export type InvoiceStatusFormValues = z.infer<typeof InvoiceStatusSchema>;

export const InvoicePaymentSchema = z
  .object({
    paymentMethod: z.enum(PAYMENT_METHODS),
    transactionId: z.string().trim().max(120),
    paidAt: z.string().min(1, "Pick the date you paid"),
    note: z.string().trim().max(500),
  })
  .refine(
    (data) => !requiresTransactionId(data.paymentMethod) || data.transactionId.trim().length > 0,
    {
      message: "A transaction ID is required for every non-cash payment",
      path: ["transactionId"],
    }
  );

export type InvoicePaymentFormValues = z.infer<typeof InvoicePaymentSchema>;

export const PaymentReviewSchema = z
  .object({
    note: z.string().trim().max(500),
    paymentMethod: z.enum(PAYMENT_METHODS),
    transactionId: z.string().trim().max(120),
  })
  .refine(
    (data) => !requiresTransactionId(data.paymentMethod) || data.transactionId.trim().length > 0,
    {
      message: "A transaction ID is required for every non-cash payment",
      path: ["transactionId"],
    }
  );

export const PaymentReviewReasonSchema = z
  .object({
    note: z.string().trim().min(3, "A reason is required").max(500),
    paymentMethod: z.enum(PAYMENT_METHODS),
    transactionId: z.string().trim().max(120),
  });

export type PaymentReviewFormValues = z.infer<typeof PaymentReviewSchema>;
