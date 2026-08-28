import { z } from "zod";
import { TAG_SCOPES } from "@/types/domain/tag";
import { hexColorValidation } from "./color";

export const TagSchema = z.object({
  name: z.string().trim().min(1, "A tag needs a name").max(60),
  color: hexColorValidation,
  description: z.string().trim().max(200),
  scopes: z.array(z.enum(TAG_SCOPES)),
  isActive: z.boolean(),
});

export type TagFormValues = z.infer<typeof TagSchema>;
