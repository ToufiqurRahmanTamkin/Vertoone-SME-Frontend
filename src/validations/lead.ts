import { LEAD_PRIORITIES, LEAD_STATUSES } from "@/types/domain/lead";
import { z } from "zod";
import { optionalPhone } from "./phone";

const money = z.union([z.literal(""), z.number().min(0, "Cannot be negative").max(1_000_000_000)]);

export const LeadSchema = z.object({
  title: z.string().trim().min(1, "A lead needs a title").max(120),
  code: z.string().trim().max(20),
  firstName: z.string().trim().max(80),
  lastName: z.string().trim().max(80),
  email: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  phone: optionalPhone,
  jobTitle: z.string().trim().max(80),
  companyName: z.string().trim().max(120),
  website: z.string().trim().max(200),
  leadSourceId: z.string(),
  contactTypeId: z.string(),
  ownerId: z.string(),
  tagIds: z.array(z.string()),
  street: z.string().trim().max(200),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
  postalCode: z.string().trim().max(20),
  country: z.string().trim().max(80),
  status: z.enum(LEAD_STATUSES),
  priority: z.enum(LEAD_PRIORITIES),
  estimatedValue: money,
  expectedCloseDate: z.string().trim(),
  lastContactedAt: z.string().trim(),
  lostReason: z.string().trim().max(300),
  notes: z.string().trim().max(2000),
  isActive: z.boolean(),
});

export type LeadFormValues = z.infer<typeof LeadSchema>;
