import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalSlug = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .toLowerCase()
    .max(60)
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only"),
]);

export const WebSiteFormSchema = z.object({
  name: z.string().trim().min(1, "Your website needs a name").max(120),
  slug: optionalSlug,
  tagline: z.string().trim().max(160),
  templateKey: z.string().trim().min(1, "Pick a starting point"),
});

export type WebSiteFormValues = z.infer<typeof WebSiteFormSchema>;

export const WebPageSchema = z.object({
  title: z.string().trim().min(1, "A page needs a title").max(120),
  slug: optionalSlug,
  templateKey: z.string().trim().min(1, "Pick a starting point"),
  showInNav: z.boolean(),
});

export type WebPageFormValues = z.infer<typeof WebPageSchema>;

export const WebSiteSchema = z.object({
  name: z.string().trim().min(1, "Your site needs a name").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "A site address needs at least 3 characters")
    .max(48)
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only"),
  tagline: z.string().trim().max(160),
  language: z.string().trim().toLowerCase().min(2, "Use a language code such as en").max(5),
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
  font: z.enum(["SYSTEM", "SERIF", "ROUNDED"]),
  radius: z.enum(["NONE", "SMALL", "MEDIUM", "LARGE"]),
  headerShowLogo: z.boolean(),
  headerShowNav: z.boolean(),
  headerSticky: z.boolean(),
  headerCtaLabel: z.string().trim().max(40),
  headerCtaHref: z.string().trim().max(500),
  footerText: z.string().trim().max(400),
  footerShowPages: z.boolean(),
  footerShowContact: z.boolean(),
  contactEmail: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  contactPhone: z.string().trim().max(30),
  contactAddress: z.string().trim().max(300),
  metaTitle: z.string().trim().max(70),
  metaDescription: z.string().trim().max(180),
  indexable: z.boolean(),
});

export type WebSiteSettingsFormValues = z.infer<typeof WebSiteSchema>;

const numericString = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .refine((value) => {
      const parsed = Number(value);
      return value !== "" && Number.isInteger(parsed) && parsed >= min && parsed <= max;
    }, message);

export const BusinessToolsSettingsSchema = z.object({
  webDefaultPrimaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
  webDefaultFont: z.enum(["SYSTEM", "SERIF", "ROUNDED"]),
  webDefaultRadius: z.enum(["NONE", "SMALL", "MEDIUM", "LARGE"]),
  webDefaultLanguage: z.string().trim().toLowerCase().min(2, "Use a code such as en").max(5),
  webDefaultIndexable: z.boolean(),
  webDefaultFooterText: z.string().trim().max(400),

  formNotifyEmail: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  formNotifyOnSubmission: z.boolean(),
  formStoreSubmissions: z.boolean(),
  formRetentionDays: numericString(0, 3650, "Use a whole number of days, 0 to 3650"),
  formSpamProtection: z.boolean(),
  formSuccessMessage: z.string().trim().max(300),

  emailSenderName: z.string().trim().max(80),
  emailReplyToEmail: z.union([
    z.literal(""),
    z.string().trim().email("A valid email is required"),
  ]),
  emailBrandColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
  emailContentWidth: numericString(480, 900, "Use a width between 480 and 900 pixels"),
  emailFooterText: z.string().trim().max(400),
});

export type BusinessToolsSettingsFormValues = z.infer<typeof BusinessToolsSettingsSchema>;
