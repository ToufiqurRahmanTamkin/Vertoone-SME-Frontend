import { z } from "zod";
import { hexColorValidation } from "./color";

export const LeadSourceSchema = z.object({
  name: z.string().trim().min(1, "A lead source needs a name").max(60),
  color: hexColorValidation,
  description: z.string().trim().max(200),
  isActive: z.boolean(),
});

export type LeadSourceFormValues = z.infer<typeof LeadSourceSchema>;
