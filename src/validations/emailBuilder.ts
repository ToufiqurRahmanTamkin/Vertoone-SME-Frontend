import { z } from "zod";

export const EmailTemplateFormSchema = z.object({
  name: z.string().trim().min(1, "Your email needs a name").max(120),
  subject: z.string().trim().max(200),
  preheader: z.string().trim().max(200),
  category: z.enum(["GENERAL", "MARKETING", "TRANSACTIONAL", "ANNOUNCEMENT", "INTERNAL"]),
  templateKey: z.string().trim().min(1, "Pick a starting point"),
});

export type EmailTemplateFormValues = z.infer<typeof EmailTemplateFormSchema>;

export const EmailTestSendSchema = z.object({
  email: z.string().trim().email("A valid email address is required"),
});

export type EmailTestSendFormValues = z.infer<typeof EmailTestSendSchema>;

export const EmailSendSchema = z.object({
  subject: z.string().trim().min(1, "A subject line is required").max(200),
  senderName: z.string().trim().max(80),
  replyTo: z.union([z.literal(""), z.string().trim().email("A valid email address is required")]),
});

export type EmailSendFormValues = z.infer<typeof EmailSendSchema>;
