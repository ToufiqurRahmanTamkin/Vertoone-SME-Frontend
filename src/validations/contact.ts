import { CONTACT_PREFERRED_CHANNELS, CONTACT_STATUSES } from "@/types/domain/contact";
import { z } from "zod";
import { optionalPhone } from "./phone";

export const ContactSchema = z.object({
  firstName: z.string().trim().min(1, "A contact needs a first name").max(80),
  lastName: z.string().trim().max(80),
  email: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  phone: optionalPhone,
  alternatePhone: optionalPhone,
  jobTitle: z.string().trim().max(80),
  companyName: z.string().trim().max(120),
  department: z.string().trim().max(80),
  website: z.string().trim().max(200),
  contactTypeId: z.string(),
  leadSourceId: z.string(),
  ownerId: z.string(),
  tagIds: z.array(z.string()),
  street: z.string().trim().max(200),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
  postalCode: z.string().trim().max(20),
  country: z.string().trim().max(80),
  preferredChannel: z.enum(CONTACT_PREFERRED_CHANNELS),
  status: z.enum(CONTACT_STATUSES),
  birthday: z.string().trim(),
  lastContactedAt: z.string().trim(),
  notes: z.string().trim().max(2000),
  isActive: z.boolean(),
});

export type ContactFormValues = z.infer<typeof ContactSchema>;
