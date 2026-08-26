import { EMPLOYEE_RANGES } from "@/types/domain/company";
import { PAYMENT_METHODS, requiresTransactionId } from "@/types/domain/soldSubscription";
import { isValidPhoneNumber } from "react-phone-number-input";
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

const requiredPhone = z
  .string("Enter a phone number")
  .trim()
  .min(1, "Phone number is required")
  .refine((value) => isValidPhoneNumber(value), {
    message: "Enter a valid phone number for the selected country",
  });

export const RegisterCompanyStepSchema = z.object({
  companyName: z
    .string("Enter your company name")
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(150, "Company name is too long"),
  companyEmail: z.string("Enter your company email").trim().email("Invalid email address"),
  companyPhone: requiredPhone,
  companyAddress: z
    .string("Enter your company address")
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address is too long"),
  employeeRange: z.enum(EMPLOYEE_RANGES, "Select an employee range"),
});

export const RegisterAdminStepSchema = z
  .object({
    adminName: z
      .string("Enter the administrator name")
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name is too long"),
    adminEmail: z.string("Enter the administrator email").trim().email("Invalid email address"),
    adminPhone: requiredPhone,
    adminPassword: z
      .string("Choose a password")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string("Confirm your password").min(1, "Confirm your password"),
  })
  .refine((data) => data.adminPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const RegisterPaymentStepSchema = z
  .object({
    planId: z.string("Select a plan").min(1, "Select a plan to continue"),
    paymentMethod: z.enum(PAYMENT_METHODS, "Select a payment method"),
    transactionId: z.string().trim().max(120, "Transaction ID is too long").optional(),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms to continue",
    }),
  })
  .refine(
    (data) => !requiresTransactionId(data.paymentMethod) || Boolean(data.transactionId?.trim()),
    {
      message: "A transaction ID is required for every non-cash payment",
      path: ["transactionId"],
    }
  );

export const ForgotPasswordSchema = z.object({
  email: z.string("Enter your email").trim().email("Invalid email address"),
});

export const VerifyOtpSchema = z.object({
  otp: z
    .string("Enter the code we emailed you")
    .trim()
    .regex(/^\d{6}$/, "The code is 6 digits"),
});

export const ResetPasswordSchema = z
  .object({
    newPassword: z
      .string("Choose a new password")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string("Confirm your new password").min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterCompanyStepValues = z.infer<typeof RegisterCompanyStepSchema>;
export type RegisterAdminStepValues = z.infer<typeof RegisterAdminStepSchema>;
export type RegisterPaymentStepValues = z.infer<typeof RegisterPaymentStepSchema>;
export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;
export type VerifyOtpValues = z.infer<typeof VerifyOtpSchema>;
export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;
