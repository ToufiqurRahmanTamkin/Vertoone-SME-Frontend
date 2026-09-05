import {
  CRM_ACTIVITY_MANUAL_TYPES,
  CRM_ACTIVITY_OUTCOMES,
  CRM_ACTIVITY_RELATED_TYPES,
} from "@/types/domain/crmActivity";
import { z } from "zod";

export const CrmActivitySchema = z
  .object({
    relatedType: z.enum(CRM_ACTIVITY_RELATED_TYPES),
    dealId: z.string(),
    leadId: z.string(),
    contactId: z.string(),
    type: z.enum(CRM_ACTIVITY_MANUAL_TYPES),
    subject: z.string().trim().min(1, "An activity needs a subject").max(160),
    body: z.string().trim().max(4000),
    location: z.string().trim().max(200),
    occurredAt: z.string().trim().min(1, "Pick the date and time it happened"),
    durationMinutes: z.union([
      z.literal(""),
      z.number().int().min(0, "0 or more").max(10080, "At most 7 days"),
    ]),
    dueAt: z.string().trim(),
    isCompleted: z.boolean(),
    outcome: z.enum(CRM_ACTIVITY_OUTCOMES),
    performedById: z.string(),
    isPinned: z.boolean(),
  })
  .refine(
    (values) =>
      (values.relatedType === "DEAL" && values.dealId !== "") ||
      (values.relatedType === "LEAD" && values.leadId !== "") ||
      (values.relatedType === "CONTACT" && values.contactId !== ""),
    {
      message: "Pick the record this activity belongs to",
      path: ["dealId"],
    }
  )
  .refine((values) => values.isCompleted || values.dueAt !== "", {
    message: "An open activity needs a due date and time",
    path: ["dueAt"],
  });

export type CrmActivityFormValues = z.infer<typeof CrmActivitySchema>;
