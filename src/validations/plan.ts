import { BILLING_CYCLES, SUPPORTED_CURRENCIES } from "@/types/domain/plan";
import { z } from "zod";

const limitField = z
  .union([z.literal(""), z.number().int().min(0)])
  .optional();

export const PlanSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer"),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z.enum(SUPPORTED_CURRENCIES),
  billingCycle: z.enum(BILLING_CYCLES),
  features: z.string().max(4000).optional(),
  limitUsers: limitField,
  trialDays: z.number().int().min(0).max(365, "Trial can be at most 365 days"),
  isActive: z.boolean(),
  autoRenewEnabled: z.boolean(),
  isPrivate: z.boolean(),
});

export type PlanFormValues = z.infer<typeof PlanSchema>;

export const parseFeatures = (value: string | undefined): string[] =>
  (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 50);

export const toLimit = (value: number | "" | undefined): number | null =>
  value === "" || value === undefined ? null : value;
