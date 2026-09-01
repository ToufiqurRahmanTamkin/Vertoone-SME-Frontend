import {
  MAX_PIPELINE_STAGES,
  PIPELINE_ACTIVITY_MANUAL_TYPES,
  PIPELINE_ACTIVITY_OUTCOMES,
  PIPELINE_ENTRY_PRIORITIES,
  PIPELINE_STAGE_TYPES,
  SUPPORTED_CURRENCIES,
} from "@/types/domain/pipeline";
import { z } from "zod";
import { hexColorValidation } from "./color";

export const PipelineStageSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(1, "A stage needs a name").max(60),
  color: hexColorValidation,
  description: z.string().trim().max(200),
  probability: z.union([z.literal(""), z.number().int().min(0, "0 or more").max(100, "100 or less")]),
  type: z.enum(PIPELINE_STAGE_TYPES),
  rottingDays: z.union([z.literal(""), z.number().int().min(0, "0 or more").max(365, "365 or less")]),
});

export const PipelineSchema = z.object({
  name: z.string().trim().min(1, "A pipeline needs a name").max(80),
  color: hexColorValidation,
  description: z.string().trim().max(500),
  contactTypeId: z.string(),
  ownerId: z.string(),
  currency: z.enum(SUPPORTED_CURRENCIES),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  stages: z
    .array(PipelineStageSchema)
    .min(1, "A pipeline needs at least one stage")
    .max(MAX_PIPELINE_STAGES, `At most ${MAX_PIPELINE_STAGES} stages`),
});

export type PipelineFormValues = z.infer<typeof PipelineSchema>;

export type PipelineStageFormValues = z.infer<typeof PipelineStageSchema>;

export const PipelineEntrySchema = z.object({
  contactId: z.string().min(1, "Pick a contact"),
  stageId: z.string(),
  title: z.string().trim().max(160),
  value: z.union([z.literal(""), z.number().min(0, "0 or more").max(1_000_000_000_000)]),
  currency: z.enum(SUPPORTED_CURRENCIES),
  priority: z.enum(PIPELINE_ENTRY_PRIORITIES),
  ownerId: z.string(),
  leadSourceId: z.string(),
  tagIds: z.array(z.string()),
  expectedCloseDate: z.string().trim(),
  nextActivityAt: z.string().trim(),
  notes: z.string().trim().max(2000),
});

export type PipelineEntryFormValues = z.infer<typeof PipelineEntrySchema>;

export const PipelineActivitySchema = z
  .object({
    type: z.enum(PIPELINE_ACTIVITY_MANUAL_TYPES),
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
    outcome: z.enum(PIPELINE_ACTIVITY_OUTCOMES),
    performedById: z.string(),
    isPinned: z.boolean(),
  })
  .refine((values) => values.isCompleted || values.dueAt !== "", {
    message: "An open activity needs a due date and time",
    path: ["dueAt"],
  });

export type PipelineActivityFormValues = z.infer<typeof PipelineActivitySchema>;
