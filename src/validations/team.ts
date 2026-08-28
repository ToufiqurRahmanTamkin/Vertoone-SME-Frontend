import { z } from "zod";
import { hexColorValidation } from "./color";

export const TeamSchema = z
  .object({
    name: z.string().trim().min(1, "A team needs a name").max(80),
    code: z.string().trim().max(20),
    description: z.string().trim().max(300),
    color: hexColorValidation,
    department: z.string().trim().max(80),
    teamLeadId: z.string().trim().min(1, "Pick the employee who leads this team"),
    supervisorId: z.string().trim().min(1, "Pick the employee who supervises this team"),
    memberIds: z.array(z.string()),
    tagIds: z.array(z.string()),
    isActive: z.boolean(),
  })
  .refine((values) => values.teamLeadId !== values.supervisorId, {
    path: ["supervisorId"],
    message: "The supervisor must be a different employee from the team lead",
  });

export type TeamFormValues = z.infer<typeof TeamSchema>;
