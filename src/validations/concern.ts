import { z } from "zod";
import { optionalPhone, requiredPhone } from "./phone";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value === "" || /^https?:\/\/\S+\.\S+$/.test(value), {
    message: "Enter a full URL starting with http:// or https://",
  });

const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .refine((value) => value === "" || z.string().email().safeParse(value).success, {
    message: "Enter a valid email address",
  });

export const ConcernSchema = z.object({
  name: z.string().trim().min(2, "A concern needs a name").max(120),
  code: z.string().trim().max(20),
  industry: z.string().trim().max(80),
  email: optionalEmail,
  phone: optionalPhone,
  website: optionalUrl,
  address: z.string().trim().max(200),
  notes: z.string().trim().max(500),
  isActive: z.boolean(),
  headName: z.string().trim().min(2, "The concern head needs a name").max(80),
  headEmail: z.string().trim().toLowerCase().email("A valid sign-in email is required"),
  headPhone: requiredPhone,
  headPassword: z.union([z.literal(""), z.string().min(8, "Use at least 8 characters").max(128)]),
  headStatus: z.enum(["ACTIVE", "INACTIVE"]),
});

export type ConcernFormValues = z.infer<typeof ConcernSchema>;
