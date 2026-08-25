import { FINANCE_CATEGORY_TYPES } from "@/types/domain/finance";
import { PAYMENT_METHODS } from "@/types/domain/soldSubscription";
import { z } from "zod";

export const FinanceCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  type: z.enum(FINANCE_CATEGORY_TYPES),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer"),
  isActive: z.boolean(),
});

export type FinanceCategoryFormValues = z.infer<typeof FinanceCategorySchema>;

export const FinanceEntrySchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(140),
  categoryId: z.string().min(1, "Pick a category"),
  amount: z.number().min(0, "Amount cannot be negative"),
  currency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code")
    .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
  date: z.string().min(1, "Pick a date"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  party: z.string().trim().max(140),
  reference: z.string().trim().max(120),
  notes: z.string().trim().max(1000),
});

export type FinanceEntryFormValues = z.infer<typeof FinanceEntrySchema>;

export const PaymentReviewSchema = z.object({
  note: z.string().trim().max(500),
  paymentMethod: z.enum(PAYMENT_METHODS),
  transactionId: z.string().trim().max(120),
});

export const PaymentReviewReasonSchema = PaymentReviewSchema.extend({
  note: z.string().trim().min(3, "A reason is required").max(500),
});

export type PaymentReviewFormValues = z.infer<typeof PaymentReviewSchema>;
