import { z } from "zod";

export const TeamMemberSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  phone: z.string().trim().max(30).optional(),
  // Blank on an edit means "leave the current password alone".
  password: z.union([z.literal(""), z.string().min(8, "Use at least 8 characters").max(128)]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type TeamMemberFormValues = z.infer<typeof TeamMemberSchema>;
