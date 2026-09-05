import { DEAL_PRIORITIES, SUPPORTED_CURRENCIES } from "@/types/domain/deal";
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
