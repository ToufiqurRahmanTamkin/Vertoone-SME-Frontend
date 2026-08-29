import { z } from "zod";
import { hexColorValidation } from "./color";

export const colorLabelSchema = (entityLabel: string) =>
  z.object({
    name: z.string().trim().min(1, `A ${entityLabel} needs a name`).max(60),
    color: hexColorValidation,
    description: z.string().trim().max(200),
    isActive: z.boolean(),
  });

export type ColorLabelFormValues = z.infer<ReturnType<typeof colorLabelSchema>>;
