import {
  MAX_PIPELINE_STAGES,
  PIPELINE_STAGE_TYPES,
  SUPPORTED_CURRENCIES,
} from "@/types/domain/pipeline";
import { z } from "zod";
import { hexColorValidation } from "./color";

export const PipelineStageSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(1, "A stage needs a name").max(60),
  color: hexColorValidation,
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
  isActive: z.boolean(),
  stages: z
    .array(PipelineStageSchema)
    .min(1, "A pipeline needs at least one stage")
    .max(MAX_PIPELINE_STAGES, `At most ${MAX_PIPELINE_STAGES} stages`),
});

export type PipelineFormValues = z.infer<typeof PipelineSchema>;

export type PipelineStageFormValues = z.infer<typeof PipelineStageSchema>;
