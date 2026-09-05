import { BARCODE_SYMBOLOGIES, LABEL_PRESETS } from "@/types/domain/productBarcode";
import { BUNDLE_PRICING_MODES, BUNDLE_TYPES } from "@/types/domain/productBundle";
import { PRICE_LIST_CHANNELS, PRICE_LIST_TYPES } from "@/types/domain/priceList";
import { PRODUCT_OPTION_DISPLAY_TYPES } from "@/types/domain/productVariant";
import { PROMOTION_SCOPES, PROMOTION_TYPES } from "@/types/domain/promotion";
import { UNIT_FAMILIES } from "@/types/domain/unitOfMeasure";
import { z } from "zod";

const amount = z.union([z.literal(""), z.number().min(0, "Cannot be negative").max(1_000_000_000)]);

const quantity = z.union([z.literal(""), z.number().min(0, "Cannot be negative").max(10_000_000)]);

const percent = z.union([z.literal(""), z.number().min(0, "Cannot be negative").max(100)]);

export const UnitOfMeasureSchema = z
  .object({
    name: z.string().trim().min(1, "A unit needs a name").max(60),
    code: z.string().trim().min(1, "A unit needs a short code").max(12),
    family: z.enum(UNIT_FAMILIES),
    isBase: z.boolean(),
    baseUnitId: z.string().trim(),
    conversionFactor: z.union([
      z.literal(""),
      z.number().min(0.000001, "Must be greater than zero").max(1_000_000),
    ]),
    precision: z.union([z.literal(""), z.number().int().min(0).max(4)]),
    description: z.string().trim().max(300),
    isActive: z.boolean(),
  })
  .refine((values) => values.isBase || values.baseUnitId.length > 0, {
    message: "Pick the base unit this one converts into",
    path: ["baseUnitId"],
  })
  .refine((values) => values.isBase || Number(values.conversionFactor) > 0, {
    message: "Tell us how many base units this equals",
    path: ["conversionFactor"],
  });

export type UnitOfMeasureFormValues = z.infer<typeof UnitOfMeasureSchema>;

export const ProductOptionSchema = z.object({
  name: z.string().trim().min(1, "An option set needs a name").max(60),
  values: z.array(z.string().trim().min(1).max(60)).min(1, "Add at least one value").max(40),
  displayType: z.enum(PRODUCT_OPTION_DISPLAY_TYPES),
  description: z.string().trim().max(300),
  isActive: z.boolean(),
});

export type ProductOptionFormValues = z.infer<typeof ProductOptionSchema>;

export const ProductVariantSchema = z.object({
  productId: z.string().trim().min(1, "Pick the product this varies"),
  sku: z.string().trim().max(50),
  barcode: z.string().trim().max(60),
  selections: z
    .array(
      z.object({
        optionId: z.string().trim(),
        optionName: z.string().trim().max(60),
        value: z.string().trim().min(1, "Pick a value").max(60),
      })
    )
    .min(1, "Pick at least one option value")
    .max(5),
  purchasePrice: amount,
  sellingPrice: amount,
  lowStockAlert: quantity,
  imageUrl: z.string().trim().nullable(),
  imagePublicId: z.string().trim().nullable(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

export type ProductVariantFormValues = z.infer<typeof ProductVariantSchema>;

export const ProductBundleSchema = z
  .object({
    name: z.string().trim().min(1, "A bundle needs a name").max(160),
    code: z.string().trim().max(40),
    type: z.enum(BUNDLE_TYPES),
    description: z.string().trim().max(2000),
    pricingMode: z.enum(BUNDLE_PRICING_MODES),
    sellingPrice: amount,
    taxRate: percent,
    posEnabled: z.boolean(),
    shopEnabled: z.boolean(),
    imageUrl: z.string().trim().nullable(),
    imagePublicId: z.string().trim().nullable(),
    notes: z.string().trim().max(1000),
    isActive: z.boolean(),
  })
  .refine((values) => values.posEnabled || values.shopEnabled, {
    message: "Pick at least one sales channel",
    path: ["posEnabled"],
  });

export type ProductBundleFormValues = z.infer<typeof ProductBundleSchema>;

export const PriceListSchema = z
  .object({
    name: z.string().trim().min(1, "A price list needs a name").max(120),
    code: z.string().trim().max(40),
    type: z.enum(PRICE_LIST_TYPES),
    channel: z.enum(PRICE_LIST_CHANNELS),
    description: z.string().trim().max(500),
    validFrom: z.string().trim(),
    validTo: z.string().trim(),
    priority: z.union([z.literal(""), z.number().int().min(0).max(999)]),
    isDefault: z.boolean(),
    isActive: z.boolean(),
  })
  .refine(
    (values) =>
      !values.validFrom || !values.validTo || new Date(values.validTo) >= new Date(values.validFrom),
    { message: "The end date cannot fall before the start date", path: ["validTo"] }
  );

export type PriceListFormValues = z.infer<typeof PriceListSchema>;

export const PriceListItemSchema = z.object({
  priceListId: z.string().trim().min(1, "Pick a price list"),
  productId: z.string().trim().min(1, "Pick a product"),
  minQuantity: quantity,
  price: z.number().min(0, "Cannot be negative").max(1_000_000_000),
  discountPercent: percent,
  note: z.string().trim().max(300),
  isActive: z.boolean(),
});

export type PriceListItemFormValues = z.infer<typeof PriceListItemSchema>;

export const PromotionSchema = z
  .object({
    name: z.string().trim().min(1, "A promotion needs a name").max(140),
    couponCode: z.string().trim().max(30),
    type: z.enum(PROMOTION_TYPES),
    value: amount,
    maxDiscountAmount: amount,
    appliesTo: z.enum(PROMOTION_SCOPES),
    productIds: z.array(z.string()),
    categoryIds: z.array(z.string()),
    brandIds: z.array(z.string()),
    minOrderAmount: amount,
    minQuantity: quantity,
    buyQuantity: z.union([z.literal(""), z.number().min(0).max(1000)]),
    getQuantity: z.union([z.literal(""), z.number().min(0).max(1000)]),
    startsAt: z.string().trim().min(1, "Pick a start date"),
    endsAt: z.string().trim(),
    usageLimit: z.union([z.literal(""), z.number().int().min(0).max(1_000_000)]),
    perCustomerLimit: z.union([z.literal(""), z.number().int().min(0).max(10_000)]),
    posEnabled: z.boolean(),
    shopEnabled: z.boolean(),
    description: z.string().trim().max(1000),
    isActive: z.boolean(),
  })
  .refine(
    (values) => !values.endsAt || new Date(values.endsAt) >= new Date(values.startsAt),
    { message: "The end date cannot fall before the start date", path: ["endsAt"] }
  )
  .refine((values) => values.appliesTo !== "PRODUCTS" || values.productIds.length > 0, {
    message: "Pick at least one product",
    path: ["productIds"],
  })
  .refine((values) => values.appliesTo !== "CATEGORIES" || values.categoryIds.length > 0, {
    message: "Pick at least one category",
    path: ["categoryIds"],
  })
  .refine((values) => values.appliesTo !== "BRANDS" || values.brandIds.length > 0, {
    message: "Pick at least one brand",
    path: ["brandIds"],
  })
  .refine((values) => values.type !== "PERCENTAGE" || Number(values.value) <= 100, {
    message: "A percentage cannot go above 100",
    path: ["value"],
  })
  .refine((values) => values.posEnabled || values.shopEnabled, {
    message: "Pick at least one sales channel",
    path: ["posEnabled"],
  });

export type PromotionFormValues = z.infer<typeof PromotionSchema>;

export const ProductBarcodeSchema = z.object({
  productId: z.string().trim().min(1, "Pick a product"),
  variantId: z.string().trim(),
  code: z.string().trim().max(48),
  symbology: z.enum(BARCODE_SYMBOLOGIES),
  packSize: z.union([z.literal(""), z.number().int().min(1).max(100_000)]),
  isPrimary: z.boolean(),
  note: z.string().trim().max(300),
  isActive: z.boolean(),
});

export type ProductBarcodeFormValues = z.infer<typeof ProductBarcodeSchema>;

export const LabelTemplateSchema = z.object({
  name: z.string().trim().min(1, "A label needs a name").max(80),
  preset: z.enum(LABEL_PRESETS),
  widthMm: z.union([z.literal(""), z.number().min(10).max(400)]),
  heightMm: z.union([z.literal(""), z.number().min(10).max(400)]),
  columns: z.union([z.literal(""), z.number().int().min(1).max(12)]),
  gapMm: z.union([z.literal(""), z.number().min(0).max(50)]),
  symbology: z.enum(BARCODE_SYMBOLOGIES),
  showName: z.boolean(),
  showSku: z.boolean(),
  showPrice: z.boolean(),
  showBarcode: z.boolean(),
  showCompany: z.boolean(),
  description: z.string().trim().max(300),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

export type LabelTemplateFormValues = z.infer<typeof LabelTemplateSchema>;
