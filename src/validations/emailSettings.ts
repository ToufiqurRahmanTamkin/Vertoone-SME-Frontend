import { EMAIL_ENCRYPTIONS, EMAIL_PROVIDERS } from "@/types/domain/emailSettings";
import { z } from "zod";

const optionalEmail = z.union([
  z.literal(""),
  z.string().trim().email("That does not look like an email address"),
]);

export const EmailSettingsSchema = z
  .object({
    isEnabled: z.boolean(),
    provider: z.enum(EMAIL_PROVIDERS),
    host: z.string().trim().max(255),
    port: z
      .union([z.string(), z.number()])
      .transform((value) => Number(value))
      .refine((value) => Number.isInteger(value) && value >= 1 && value <= 65535, {
        message: "Enter a port between 1 and 65535",
      }),
    encryption: z.enum(EMAIL_ENCRYPTIONS),
    username: z.string().trim().max(320),
    password: z.string().max(500),
    fromName: z.string().trim().max(120),
    fromEmail: optionalEmail,
    replyToEmail: optionalEmail,
    footerText: z.string().trim().max(500),
  })
  .refine((values) => !values.isEnabled || values.host.length > 0, {
    message: "A mail server is needed before sending can be switched on",
    path: ["host"],
  })
  .refine((values) => !values.isEnabled || values.username.length > 0, {
    message: "A username is needed before sending can be switched on",
    path: ["username"],
  })
  .refine((values) => !values.isEnabled || values.fromEmail.length > 0, {
    message: "A from address is needed before sending can be switched on",
    path: ["fromEmail"],
  });

export type EmailSettingsFormValues = z.input<typeof EmailSettingsSchema>;

export type EmailSettingsFormOutput = z.output<typeof EmailSettingsSchema>;
