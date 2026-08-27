import { z } from "zod";

export const ResetUserPasswordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Both passwords must match",
  });

export type ResetUserPasswordFormValues = z.infer<typeof ResetUserPasswordSchema>;
