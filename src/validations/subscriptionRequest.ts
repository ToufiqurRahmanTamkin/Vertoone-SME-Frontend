import { z } from "zod";

export const CancellationRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Tell us why in at least 10 characters")
    .max(1000, "Keep it under 1000 characters"),
  confirmation: z.boolean().refine((value) => value, {
    message: "You must confirm before we can send this request",
  }),
});

export type CancellationRequestFormValues = z.infer<typeof CancellationRequestSchema>;

export const UpgradeRequestSchema = z.object({
  planId: z.string().trim().min(1, "Pick the plan you want to move to"),
  reason: z.string().trim().max(1000).optional(),
});

export type UpgradeRequestFormValues = z.infer<typeof UpgradeRequestSchema>;

export const SubscriptionRequestReviewSchema = z.object({
  note: z.string().trim().max(1000),
});

export type SubscriptionRequestReviewFormValues = z.infer<
  typeof SubscriptionRequestReviewSchema
>;

export const SubscriptionRequestRejectSchema = z.object({
  note: z.string().trim().min(3, "A reason is required").max(1000),
});
