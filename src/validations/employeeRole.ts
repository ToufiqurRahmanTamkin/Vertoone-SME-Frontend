import { z } from "zod";

export const EmployeeRoleSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  description: z.string().trim().max(200).optional(),
  isActive: z.boolean(),
});

export type EmployeeRoleFormValues = z.infer<typeof EmployeeRoleSchema>;
