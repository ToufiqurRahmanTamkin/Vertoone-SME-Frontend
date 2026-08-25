import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SUBSCRIPTION_STATUSES,
  requiresTransactionId,
} from "@/types/domain/soldSubscription";
import { z } from "zod";
import { optionalPhone } from "./phone";

export const SoldSubscriptionSchema = z
  .object({
    planId: z.string().min(1, "Select a plan"),
    customerName: z.string().trim().min(2, "Customer name must be at least 2 characters").max(120),
    customerEmail: z.string().trim().email("Enter a valid email address"),
    customerPhone: optionalPhone,
    companyName: z.string().trim().max(120),
    amount: z.number().min(0, "Amount cannot be negative"),
    currency: z
      .string()
      .trim()
      .length(3, "Use a 3-letter currency code")
      .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
    status: z.enum(SUBSCRIPTION_STATUSES),
    paymentStatus: z.enum(PAYMENT_STATUSES),
    paymentMethod: z.enum(PAYMENT_METHODS),
    transactionId: z.string().trim().max(120),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    autoRenew: z.boolean(),
    notes: z.string().trim().max(1000),
  })
  // The backend rejects this too; checking here keeps the message on the field.
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after the start date",
    path: ["endDate"],
  })
  .refine(
    (data) => !requiresTransactionId(data.paymentMethod) || data.transactionId.trim().length > 0,
    {
      message: "A transaction ID is required for every non-cash payment",
      path: ["transactionId"],
    }
  );

export type SoldSubscriptionFormValues = z.infer<typeof SoldSubscriptionSchema>;
