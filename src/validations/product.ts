import { PRODUCT_TYPES } from "@/types/domain/product";
import { z } from "zod";

const amount = z.union([
  z.literal(""),
  z.number().min(0, "Cannot be negative").max(1_000_000_000),
]);

const quantity = z.union([
  z.literal(""),
  z.number().min(0, "Cannot be negative").max(10_000_000),
]);

export const ProductSchema = z
  .object({
    name: z.string().trim().min(1, "A product needs a name").max(160),
    sku: z.string().trim().max(40),
    barcode: z.string().trim().max(60),
    type: z.enum(PRODUCT_TYPES),
    categoryId: z.string().trim().min(1, "Pick a category"),
    subCategoryId: z.string().trim(),
    brandId: z.string().trim(),
    unitId: z.string().trim(),
    description: z.string().trim().max(2000),
    purchasePrice: amount,
    sellingPrice: amount,
    taxRate: z.union([z.literal(""), z.number().min(0, "Cannot be negative").max(100)]),
    openingStock: quantity,
    lowStockAlert: quantity,
    posEnabled: z.boolean(),
    shopEnabled: z.boolean(),
    imageUrl: z.string().trim().nullable(),
    imagePublicId: z.string().trim().nullable(),
    tagIds: z.array(z.string()),
    notes: z.string().trim().max(1000),
    isActive: z.boolean(),
  })
  .refine((values) => values.posEnabled || values.shopEnabled, {
    message: "Pick at least one sales channel",
    path: ["posEnabled"],
  });

export type ProductFormValues = z.infer<typeof ProductSchema>;
