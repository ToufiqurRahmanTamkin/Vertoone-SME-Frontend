import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const WebPageSchema = z.object({
  title: z.string().trim().min(1, "A page needs a title").max(120),
  slug: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .toLowerCase()
      .max(60)
      .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only"),
  ]),
  template: z.enum(["BLANK", "LANDING", "ABOUT", "SERVICES", "CONTACT"]),
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

export type WebSiteFormValues = z.infer<typeof WebSiteSchema>;
