import { BILLING_CYCLES } from "@/types/domain/plan";
import { z } from "zod";

// A limit input is an empty string when the user means "unlimited", which the
// backend represents as null.
const limitField = z
  .union([z.literal(""), z.number().int().min(0)])
  .optional();

export const PlanSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer"),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code")
    .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
  billingCycle: z.enum(BILLING_CYCLES),
  // One feature per line in the textarea; split on submit.
  features: z.string().max(4000).optional(),
  limitUsers: limitField,
  limitBranches: limitField,
  limitStorageGb: limitField,
  trialDays: z.number().int().min(0).max(365, "Trial can be at most 365 days"),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  isPopular: z.boolean(),
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
