import { z } from "zod";

const text = (max = 200) => z.string().trim().max(max);

const optionalEmail = z
  .string()
  .trim()
  .max(160)
  .refine((value) => value === "" || z.string().email().safeParse(value).success, {
    message: "Enter a valid email address",
  });

const optionalUrl = z
  .string()
  .trim()
  .max(400)
  .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), {
    message: "Enter a valid URL starting with http:// or https://",
  });

const percentage = z.number().min(0, "Cannot be negative").max(100, "Cannot be above 100");

export const EmailConfigSchema = z.object({
  enabled: z.boolean(),
  provider: z.enum(["smtp", "sendgrid", "mailgun", "ses", "postmark", "resend"]),
  fromName: text(80).min(1, "Sender name is required"),
  fromEmail: optionalEmail,
  replyToEmail: optionalEmail,
  bccEmail: optionalEmail,
  smtpHost: text(160),
  smtpPort: z.number().int().min(0).max(65535, "Port must be 65535 or lower"),
  smtpEncryption: z.enum(["none", "tls", "ssl"]),
  smtpUsername: text(160),
  smtpPassword: text(200),
  apiKey: text(300),
  apiDomain: text(160),
  apiRegion: text(40),
  dailySendLimit: z.number().int().min(0).max(1000000),
  footerText: text(500),
  trackOpens: z.boolean(),
  retryFailed: z.boolean(),
  testRecipient: optionalEmail,
});

export type EmailConfigFormValues = z.infer<typeof EmailConfigSchema>;

export const PaymentConfigSchema = z.object({
  defaultGateway: z.enum(["stripe", "nmi", "valor", "offline"]),
  paymentCurrency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code")
    .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
  captureMode: z.enum(["automatic", "manual"]),
  testMode: z.boolean(),
  allowSavedCards: z.boolean(),
  allowPartialPayment: z.boolean(),
  surchargePercent: percentage,
  statementDescriptor: text(22),
  stripeEnabled: z.boolean(),
  stripePublishableKey: text(300),
  stripeSecretKey: text(300),
  stripeWebhookSecret: text(300),
  stripeAccountId: text(120),
  nmiEnabled: z.boolean(),
  nmiSecurityKey: text(300),
  nmiUsername: text(120),
  nmiPassword: text(200),
  nmiTokenizationKey: text(300),
  nmiEndpoint: optionalUrl,
  valorEnabled: z.boolean(),
  valorMerchantId: text(120),
  valorAppId: text(120),
  valorAppKey: text(300),
  valorEpi: text(120),
  valorEnvironment: z.enum(["sandbox", "production"]),
  cashEnabled: z.boolean(),
  bankTransferEnabled: z.boolean(),
  chequeEnabled: z.boolean(),
  mobileWalletEnabled: z.boolean(),
  bankInstructions: text(600),
});

export type PaymentConfigFormValues = z.infer<typeof PaymentConfigSchema>;
