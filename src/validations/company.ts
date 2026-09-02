import { EMPLOYEE_RANGES } from "@/types/domain/company";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

const requiredPhone = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .max(32)
  .refine((value) => isValidPhoneNumber(value), {
    message: "Enter a valid phone number for the selected country",
  });

export const CreateCompanySchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required").max(150),
  companyEmail: z.string().trim().email("Enter a valid company email"),
  companyPhone: requiredPhone,
  companyAddress: z.string().trim().min(5, "Company address is required").max(500),
  employeeRange: z.enum(EMPLOYEE_RANGES),
  adminName: z.string().trim().min(2, "Admin name is required").max(120),
  adminEmail: z.string().trim().email("Enter a valid admin email"),
  adminPhone: requiredPhone,
  adminPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer"),
  note: z.string().trim().max(500),
});

export type CreateCompanyFormValues = z.infer<typeof CreateCompanySchema>;
