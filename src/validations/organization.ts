import { z } from "zod";
import { optionalPhone } from "./phone";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value === "" || /^https?:\/\/\S+\.\S+$/.test(value), {
    message: "Enter a full URL starting with http:// or https://",
  });

export const CompanyProfileSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(120),
  legalName: z.string().trim().max(120),
  industry: z.string().trim().max(80),
  employeeRange: z.string().trim().min(1, "Pick a company size"),
  foundedYear: z
    .number()
    .int()
    .min(1800, "That year looks too early")
    .max(new Date().getFullYear(), "That year is in the future"),
  registrationNo: z.string().trim().max(60),
  taxId: z.string().trim().max(60),
  email: z.string().trim().email("Enter a valid email address"),
  phone: optionalPhone,
  supportPhone: optionalPhone,
  website: optionalUrl,
  address: z.string().trim().max(200),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
  postalCode: z.string().trim().max(20),
  country: z.string().trim().max(80),
  tagline: z.string().trim().max(120),
  about: z.string().trim().max(1000, "Keep this under 1000 characters"),
  logoUrl: z.string().trim().max(600),
  logoPublicId: z.string().trim().max(300),
  bannerUrl: z.string().trim().max(600),
  bannerPublicId: z.string().trim().max(300),
});

export type CompanyProfileFormValues = z.infer<typeof CompanyProfileSchema>;
