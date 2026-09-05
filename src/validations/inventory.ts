import { BIN_LOCATION_TYPES } from "@/types/domain/binLocation";
import { REORDER_STRATEGIES } from "@/types/domain/reorderRule";
import { SERIAL_STATUSES } from "@/types/domain/serialNumber";
import { STOCK_COUNT_SCOPES } from "@/types/domain/stockCount";
import { z } from "zod";

const amount = z.union([z.literal(""), z.number().min(0, "Cannot be negative").max(1_000_000_000)]);

const quantity = z.union([z.literal(""), z.number().min(0, "Cannot be negative").max(10_000_000)]);

export const InventoryBatchSchema = z
  .object({
    productId: z.string().trim().min(1, "Pick a product"),
    warehouseId: z.string().trim().min(1, "Pick a warehouse"),
    supplierId: z.string().trim(),
    batchNumber: z.string().trim().min(1, "A batch needs a number").max(40),
    lotNumber: z.string().trim().max(40),
    quantity: z.number().min(0, "Cannot be negative").max(10_000_000),
    unitCost: amount,
    manufacturedAt: z.string().trim(),
    expiresAt: z.string().trim(),
    note: z.string().trim().max(500),
    isActive: z.boolean(),
  })
  .refine(
    (values) =>
      !values.manufacturedAt ||
      !values.expiresAt ||
      new Date(values.expiresAt) >= new Date(values.manufacturedAt),
    { message: "The expiry date cannot fall before the manufacture date", path: ["expiresAt"] }
  );

export type InventoryBatchFormValues = z.infer<typeof InventoryBatchSchema>;

export const SerialNumberCreateSchema = z.object({
  productId: z.string().trim().min(1, "Pick a product"),
  warehouseId: z.string().trim(),
  batchId: z.string().trim(),
  serialNumbers: z
    .array(z.string().trim().min(1).max(60))
    .min(1, "Add at least one serial number")
    .max(200),
  status: z.enum(SERIAL_STATUSES),
  purchaseReference: z.string().trim().max(60),
  receivedAt: z.string().trim(),
  warrantyExpiresAt: z.string().trim(),
  note: z.string().trim().max(500),
});

export type SerialNumberCreateFormValues = z.infer<typeof SerialNumberCreateSchema>;

export const SerialNumberEditSchema = z.object({
  serialNumber: z.string().trim().min(1, "A serial number is required").max(60),
  warehouseId: z.string().trim(),
  batchId: z.string().trim(),
  status: z.enum(SERIAL_STATUSES),
  purchaseReference: z.string().trim().max(60),
  salesReference: z.string().trim().max(60),
  receivedAt: z.string().trim(),
  soldAt: z.string().trim(),
  warrantyExpiresAt: z.string().trim(),
  note: z.string().trim().max(500),
});

export type SerialNumberEditFormValues = z.infer<typeof SerialNumberEditSchema>;

export const StockCountSchema = z
  .object({
    warehouseId: z.string().trim().min(1, "Pick a warehouse"),
    scope: z.enum(STOCK_COUNT_SCOPES),
    categoryId: z.string().trim(),
    countDate: z.string().trim().min(1, "Pick the count date"),
    reference: z.string().trim().max(60),
    notes: z.string().trim().max(1000),
  })
  .refine((values) => values.scope !== "CATEGORY" || values.categoryId.length > 0, {
    message: "Pick the category you are counting",
    path: ["categoryId"],
  });

export type StockCountFormValues = z.infer<typeof StockCountSchema>;

export const ReorderRuleSchema = z
  .object({
    productId: z.string().trim().min(1, "Pick a product"),
    warehouseId: z.string().trim(),
    minimumQuantity: z.number().min(0, "Cannot be negative").max(10_000_000),
    reorderQuantity: quantity,
    maximumQuantity: quantity,
    strategy: z.enum(REORDER_STRATEGIES),
    preferredSupplierId: z.string().trim(),
    leadTimeDays: z.union([z.literal(""), z.number().int().min(0).max(365)]),
    note: z.string().trim().max(500),
    isActive: z.boolean(),
  })
  .refine(
    (values) =>
      values.strategy !== "TOP_UP_TO_MAXIMUM" ||
      Number(values.maximumQuantity || 0) > Number(values.minimumQuantity || 0),
    { message: "The maximum has to sit above the minimum", path: ["maximumQuantity"] }
  );

export type ReorderRuleFormValues = z.infer<typeof ReorderRuleSchema>;

export const BinLocationSchema = z.object({
  warehouseId: z.string().trim().min(1, "Pick a warehouse"),
  code: z.string().trim().min(1, "A bin needs a code").max(30),
  name: z.string().trim().max(80),
  type: z.enum(BIN_LOCATION_TYPES),
  aisle: z.string().trim().max(20),
  rack: z.string().trim().max(20),
  shelf: z.string().trim().max(20),
  bin: z.string().trim().max(20),
  capacity: quantity,
  productIds: z.array(z.string()),
  notes: z.string().trim().max(500),
  isActive: z.boolean(),
});

export type BinLocationFormValues = z.infer<typeof BinLocationSchema>;
