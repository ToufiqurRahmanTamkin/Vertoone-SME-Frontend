import { z } from "zod";
import { optionalPhone } from "./phone";

export const SystemConfigSchema = z.object({
  appName: z.string().trim().min(1, "App name is required").max(80),
  supportEmail: z.string().trim().email("Enter a valid email address"),
  supportPhone: optionalPhone,
  defaultCurrency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code")
    .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
  defaultTimezone: z.string().trim().min(1, "Timezone is required").max(64),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().trim().max(500, "Message must be 500 characters or fewer"),
  allowSignups: z.boolean(),
  trialDays: z.number().int().min(0).max(365, "Trial can be at most 365 days"),
  paymentQrUrl: z.string().trim().max(600),
  paymentQrPublicId: z.string().trim().max(300),
  paymentInstructions: z.string().trim().max(500, "Message must be 500 characters or fewer"),
});

export type SystemConfigFormValues = z.infer<typeof SystemConfigSchema>;
