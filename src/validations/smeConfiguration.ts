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

export const GeneralConfigSchema = z.object({
  businessName: text(120).min(1, "Business name is required"),
  legalName: text(160),
  businessType: text(40),
  defaultCurrency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code")
    .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
  currencySymbol: text(6),
  symbolPosition: z.enum(["before", "after"]),
  decimalPlaces: z.number().int().min(0).max(4, "Use at most 4 decimal places"),
  thousandSeparator: z.enum(["comma", "dot", "space"]),
  defaultTimezone: text(64).min(1, "Timezone is required"),
  dateFormat: text(24).min(1, "Date format is required"),
  timeFormat: z.enum(["12h", "24h"]),
  fiscalYearStart: text(16).min(1, "Fiscal year start is required"),
  weekStart: text(12).min(1, "Week start is required"),
  defaultUnit: text(24),
  skuPrefix: text(12),
  barcodeSymbology: text(24),
  lowStockThreshold: z.number().int().min(0).max(100000),
  autoGenerateSku: z.boolean(),
  allowNegativeStock: z.boolean(),
  trackBatchAndExpiry: z.boolean(),
  multiWarehouse: z.boolean(),
});

export type GeneralConfigFormValues = z.infer<typeof GeneralConfigSchema>;

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

export const FinanceConfigSchema = z.object({
  provider: z.enum(["none", "quickbooks", "xero", "zohobooks", "sage", "wave"]),
  environment: z.enum(["sandbox", "production"]),
  clientId: text(300),
  clientSecret: text(300),
  realmId: text(120),
  tenantId: text(120),
  redirectUri: optionalUrl,
  accountingMethod: z.enum(["accrual", "cash"]),
  fiscalYearStart: text(16).min(1, "Fiscal year start is required"),
  booksCloseDate: text(24),
  baseCurrency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code")
    .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
  syncDirection: z.enum(["push", "pull", "two-way"]),
  syncFrequency: z.enum(["manual", "hourly", "daily", "weekly"]),
  syncStartDate: text(24),
  syncInvoices: z.boolean(),
  syncPayments: z.boolean(),
  syncExpenses: z.boolean(),
  syncProducts: z.boolean(),
  syncCustomers: z.boolean(),
  salesAccount: text(80),
  purchaseAccount: text(80),
  inventoryAccount: text(80),
  taxAccount: text(80),
  discountAccount: text(80),
  depositAccount: text(80),
});

export type FinanceConfigFormValues = z.infer<typeof FinanceConfigSchema>;

export const TaxConfigSchema = z.object({
  taxEnabled: z.boolean(),
  taxLabel: text(24).min(1, "Tax label is required"),
  registrationNumber: text(60),
  registrationCountry: text(60),
  binNumber: text(60),
  pricesIncludeTax: z.boolean(),
  taxOnShipping: z.boolean(),
  compoundTax: z.boolean(),
  showTaxSummary: z.boolean(),
  defaultSalesRate: percentage,
  defaultPurchaseRate: percentage,
  withholdingRate: percentage,
  reducedRate: percentage,
  taxCalculation: z.enum(["per-line", "per-invoice"]),
  roundingMode: z.enum(["nearest", "up", "down"]),
  filingFrequency: z.enum(["monthly", "quarterly", "yearly"]),
  filingNote: text(500),
});

export type TaxConfigFormValues = z.infer<typeof TaxConfigSchema>;

const documentSeries = (label: string) =>
  z.object({
    prefix: z.string().trim().max(10, `${label} prefix must be 10 characters or fewer`),
    nextNumber: z.number().int().min(1, "Start at 1 or higher").max(9999999),
    padding: z.number().int().min(0).max(10, "Use at most 10 digits"),
  });

export const InvoiceConfigSchema = z.object({
  invoiceSeries: documentSeries("Invoice"),
  quotationSeries: documentSeries("Quotation"),
  purchaseOrderSeries: documentSeries("Purchase order"),
  salesOrderSeries: documentSeries("Sales order"),
  resetNumbering: z.enum(["never", "yearly", "monthly"]),
  paymentTermDays: z.number().int().min(0).max(365, "Use 365 days or fewer"),
  dueDateBasis: z.enum(["issue-date", "delivery-date"]),
  lateFeePercent: percentage,
  template: z.enum(["classic", "modern", "compact", "minimal"]),
  paperSize: z.enum(["a4", "letter", "thermal-80"]),
  accentColor: text(9),
  showLogo: z.boolean(),
  showSignature: z.boolean(),
  showPaidStamp: z.boolean(),
  showBankDetails: z.boolean(),
  roundOffTotal: z.boolean(),
  defaultNote: text(600),
  termsAndConditions: text(1200),
  footerText: text(300),
});

export type InvoiceConfigFormValues = z.infer<typeof InvoiceConfigSchema>;

export const NotificationConfigSchema = z.object({
  emailChannel: z.boolean(),
  smsChannel: z.boolean(),
  whatsappChannel: z.boolean(),
  pushChannel: z.boolean(),
  smsProvider: z.enum(["none", "twilio", "vonage", "messagebird", "local-gateway"]),
  smsSenderId: text(24),
  smsAccountSid: text(200),
  smsAuthToken: text(300),
  smsEndpoint: optionalUrl,
  whatsappPhoneNumberId: text(120),
  whatsappBusinessId: text(120),
  whatsappAccessToken: text(400),
  whatsappTemplateNamespace: text(160),
  notifyInvoiceCreated: z.boolean(),
  notifyPaymentReceived: z.boolean(),
  notifyPaymentOverdue: z.boolean(),
  notifyLowStock: z.boolean(),
  notifyNewOrder: z.boolean(),
  notifyPurchaseApproval: z.boolean(),
  dailySummary: z.boolean(),
  summaryTime: text(8),
  adminRecipients: text(400),
  quietHoursFrom: text(8),
  quietHoursTo: text(8),
});

export type NotificationConfigFormValues = z.infer<typeof NotificationConfigSchema>;

export const IntegrationsConfigSchema = z.object({
  apiEnabled: z.boolean(),
  apiKey: text(120),
  apiRateLimit: z.number().int().min(0).max(100000),
  allowedOrigins: text(600),
  allowedIps: text(600),
  webhookUrl: optionalUrl,
  webhookSecret: text(300),
  webhookRetries: z.number().int().min(0).max(10, "Use 10 retries or fewer"),
  webhookOnOrder: z.boolean(),
  webhookOnPayment: z.boolean(),
  webhookOnStock: z.boolean(),
  storageProvider: z.enum(["cloudinary", "s3", "local"]),
  storageKey: text(300),
  storageSecret: text(300),
  storageBucket: text(160),
  storageRegion: text(60),
  googleAnalyticsId: text(60),
  metaPixelId: text(60),
  googleMapsKey: text(300),
});

export type IntegrationsConfigFormValues = z.infer<typeof IntegrationsConfigSchema>;
