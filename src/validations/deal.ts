import {
  DEAL_ACTIVITY_MANUAL_TYPES,
  DEAL_ACTIVITY_OUTCOMES,
  DEAL_PRIORITIES,
  SUPPORTED_CURRENCIES,
} from "@/types/domain/deal";
import { z } from "zod";

export const DealSchema = z.object({
  title: z.string().trim().min(1, "A deal needs a title").max(160),
  description: z.string().trim().max(2000),
  pipelineId: z.string().min(1, "Pick a pipeline"),
  stageId: z.string(),
  contactId: z.string(),
  leadId: z.string(),
  value: z.union([z.literal(""), z.number().min(0, "0 or more").max(1_000_000_000_000)]),
  currency: z.enum(SUPPORTED_CURRENCIES),
  probability: z.union([
    z.literal(""),
    z.number().int().min(0, "0 or more").max(100, "100 or less"),
  ]),
  priority: z.enum(DEAL_PRIORITIES),
  ownerId: z.string(),
  leadSourceId: z.string(),
  tagIds: z.array(z.string()),
  expectedCloseDate: z.string().trim(),
  nextActivityAt: z.string().trim(),
});

export type DealFormValues = z.infer<typeof DealSchema>;

export const DealActivitySchema = z
  .object({
    type: z.enum(DEAL_ACTIVITY_MANUAL_TYPES),
    subject: z.string().trim().min(1, "An activity needs a subject").max(160),
    body: z.string().trim().max(4000),
    location: z.string().trim().max(200),
    occurredAt: z.string().trim().min(1, "Pick the date and time it happened"),
    durationMinutes: z.union([
      z.literal(""),
      z.number().int().min(0, "0 or more").max(10080, "At most 7 days"),
    ]),
    dueAt: z.string().trim(),
    isCompleted: z.boolean(),
    outcome: z.enum(DEAL_ACTIVITY_OUTCOMES),
    performedById: z.string(),
    isPinned: z.boolean(),
  })
  .refine((values) => values.isCompleted || values.dueAt !== "", {
    message: "An open activity needs a due date and time",
    path: ["dueAt"],
  });

export type DealActivityFormValues = z.infer<typeof DealActivitySchema>;
