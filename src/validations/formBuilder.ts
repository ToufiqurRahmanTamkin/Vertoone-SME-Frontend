import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalSlug = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .toLowerCase()
    .max(48)
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only"),
]);

export const FormCreateSchema = z.object({
  name: z.string().trim().min(1, "Your form needs a name").max(120),
  slug: optionalSlug,
  description: z.string().trim().max(300),
  templateKey: z.string().trim().min(1, "Pick a starting point"),
});

export type FormCreateValues = z.infer<typeof FormCreateSchema>;

export const FormSettingsSchema = z.object({
  name: z.string().trim().min(1, "Your form needs a name").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "A form address needs at least 3 characters")
    .max(48)
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only"),
  description: z.string().trim().max(300),
  language: z.string().trim().toLowerCase().min(2, "Use a language code such as en").max(5),
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
  font: z.enum(["SYSTEM", "SERIF", "ROUNDED"]),
  radius: z.enum(["NONE", "SMALL", "MEDIUM", "LARGE"]),
  layout: z.enum(["CARD", "PLAIN"]),
  width: z.enum(["NARROW", "DEFAULT", "WIDE"]),
  submitLabel: z.string().trim().min(1, "The button needs a label").max(40),
  afterSubmit: z.enum(["MESSAGE", "REDIRECT"]),
  successMessage: z.string().trim().max(500),
  redirectUrl: z.string().trim().max(500),
  notifyEmail: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  notifyOnSubmission: z.boolean(),
  storeSubmissions: z.boolean(),
  spamProtection: z.boolean(),
  isAcceptingResponses: z.boolean(),
  closedMessage: z.string().trim().max(500),
  metaTitle: z.string().trim().max(70),
  metaDescription: z.string().trim().max(180),
  indexable: z.boolean(),
});

export type FormSettingsValues = z.infer<typeof FormSettingsSchema>;

const KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

export const isValidFieldKey = (value: string): boolean =>
  value.length > 0 && value.length <= 40 && KEY_PATTERN.test(value);

export const toFieldKey = (value: string): string => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

  return /^[a-z]/.test(slug) ? slug : `field_${slug}`.slice(0, 40);
};
