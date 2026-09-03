import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_VISIBILITIES,
} from "@/types/domain/document";
import { z } from "zod";

export const DocumentSchema = z.object({
  title: z.string().trim().min(1, "A document needs a title").max(200),
  description: z.string().trim().max(2000),
  folder: z.string().trim().max(120),
  category: z.enum(DOCUMENT_CATEGORIES),
  visibility: z.enum(DOCUMENT_VISIBILITIES),
  ownerId: z.string(),
  sharedWithIds: z.array(z.string()).max(50, "At most 50 people"),
  tagIds: z.array(z.string()).max(20, "At most 20 tags"),
  expiresAt: z.string().trim(),
  isArchived: z.boolean(),
});

export type DocumentFormValues = z.infer<typeof DocumentSchema>;
