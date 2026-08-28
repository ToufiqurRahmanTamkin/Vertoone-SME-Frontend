import { z } from "zod";

export const DesignationSchema = z.object({
  name: z.string().trim().min(1, "A designation needs a name").max(80),
  code: z.string().trim().max(20),
  description: z.string().trim().max(300),
  level: z.union([z.literal(""), z.number().int().min(0).max(99)]),
  isActive: z.boolean(),
});

export type DesignationFormValues = z.infer<typeof DesignationSchema>;
