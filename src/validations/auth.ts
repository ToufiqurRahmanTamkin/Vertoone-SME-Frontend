import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string("Enter your email").email("Invalid email address"),
  password: z.string("Enter your password").min(1, "Password is required"),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string("Enter your current password").min(1, "Current password is required"),
    newPassword: z
      .string("Enter a new password")
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string("Confirm your new password").min(8, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
