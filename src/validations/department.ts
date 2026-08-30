import { z } from "zod";

export const DepartmentSchema = z.object({
  name: z.string().trim().min(1, "A department needs a name").max(80),
  code: z.string().trim().max(20),
  description: z.string().trim().max(300),
  headId: z.string().trim(),
  isActive: z.boolean(),
});

export type DepartmentFormValues = z.infer<typeof DepartmentSchema>;
