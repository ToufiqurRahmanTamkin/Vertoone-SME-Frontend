import { z } from "zod";

export const ProductCategorySchema = z.object({
  name: z.string().trim().min(1, "A category needs a name").max(80),
  code: z.string().trim().max(20),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
  description: z.string().trim().max(500),
  isActive: z.boolean(),
});

export type ProductCategoryFormValues = z.infer<typeof ProductCategorySchema>;

export const ProductSubCategorySchema = ProductCategorySchema.extend({
  categoryId: z.string().trim().min(1, "Pick the category this sits under"),
});

export type ProductSubCategoryFormValues = z.infer<typeof ProductSubCategorySchema>;
