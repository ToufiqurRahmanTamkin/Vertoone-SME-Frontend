import {
  GATEWAY_ENVIRONMENTS,
  PAYMENT_GATEWAYS,
} from "@/types/domain/systemConfig";
import { z } from "zod";
import { optionalPhone } from "./phone";

const credential = (max: number) => z.string().trim().max(max);

const environment = z.enum(GATEWAY_ENVIRONMENTS);

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

  defaultGateway: z.enum(PAYMENT_GATEWAYS),

  paymentQrEnabled: z.boolean(),
  paymentQrUrl: z.string().trim().max(600),
  paymentQrPublicId: z.string().trim().max(300),
  paymentInstructions: z.string().trim().max(500, "Message must be 500 characters or fewer"),

  stripeEnabled: z.boolean(),
  stripeEnvironment: environment,
  stripePublishableKey: credential(300),
  stripeAccountId: credential(120),
  stripeSecretKey: credential(300),
  stripeWebhookSecret: credential(300),

  nmiEnabled: z.boolean(),
  nmiEnvironment: environment,
  nmiUsername: credential(120),
  nmiTokenizationKey: credential(300),
  nmiEndpoint: credential(300),
  nmiPassword: credential(200),
  nmiSecurityKey: credential(300),

  valorEnabled: z.boolean(),
  valorEnvironment: environment,
  valorMerchantId: credential(120),
  valorAppId: credential(120),
  valorEpi: credential(120),
  valorAppKey: credential(300),

  paypalEnabled: z.boolean(),
  paypalEnvironment: environment,
  paypalClientId: credential(300),
  paypalWebhookId: credential(120),
  paypalClientSecret: credential(300),
});

export type SystemConfigFormValues = z.infer<typeof SystemConfigSchema>;
