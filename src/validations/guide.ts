import { GUIDE_AUDIENCES, GUIDE_CATEGORIES } from "@/types/domain/guide";
import { z } from "zod";

export const GuideSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
  slug: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase words separated by hyphens"),
    ])
    .optional(),
  summary: z.string().trim().max(300, "Summary must be 300 characters or fewer"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(GUIDE_CATEGORIES),
  audience: z.enum(GUIDE_AUDIENCES),
  tags: z.string().max(800).optional(),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

export type GuideFormValues = z.infer<typeof GuideSchema>;

export const parseTags = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
