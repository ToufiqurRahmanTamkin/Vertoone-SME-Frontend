import { z } from "zod";

export const MaintainerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(30),
  password: z
    .string()
    .max(128, "Password must be 128 characters or fewer")
    .refine((value) => value === "" || value.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type MaintainerFormValues = z.infer<typeof MaintainerSchema>;
