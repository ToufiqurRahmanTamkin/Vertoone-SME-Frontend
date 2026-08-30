import { z } from "zod";

export const BrandSchema = z.object({
  name: z.string().trim().min(1, "A brand needs a name").max(80),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
  description: z.string().trim().max(500),
  website: z.string().trim().max(200),
  logoUrl: z.string().trim().nullable(),
  logoPublicId: z.string().trim().nullable(),
  isActive: z.boolean(),
});

export type BrandFormValues = z.infer<typeof BrandSchema>;
