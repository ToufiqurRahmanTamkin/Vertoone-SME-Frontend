import { z } from "zod";
import {
  ASSET_CONDITIONS,
  ASSET_HOLDER_TYPES,
  ASSET_STATUSES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
} from "@/types/domain/asset";
import { numberField } from "./hrmsSettings";

export const AssetSchema = z.object({
  name: z.string().trim().min(1, "An asset needs a name").max(120),
  assetCode: z.string().trim().max(40),
  description: z.string().trim().max(1000),
  categoryId: z.string().trim(),
  brand: z.string().trim().max(80),
  modelNumber: z.string().trim().max(80),
  serialNumber: z.string().trim().max(80),
  status: z.enum(ASSET_STATUSES),
  condition: z.enum(ASSET_CONDITIONS),
  location: z.string().trim().max(120),
  purchaseDate: z.string().trim(),
  purchaseCost: numberField(0, 1_000_000_000),
  supplierName: z.string().trim().max(120),
  invoiceNumber: z.string().trim().max(80),
  warrantyExpiresAt: z.string().trim(),
  usefulLifeMonths: numberField(0, 1200),
  salvageValue: numberField(0, 1_000_000_000),
  notes: z.string().trim().max(2000),
});

export type AssetFormValues = z.infer<typeof AssetSchema>;

export const AssetCategorySchema = z.object({
  name: z.string().trim().min(1, "A category needs a name").max(80),
  code: z.string().trim().max(20),
  description: z.string().trim().max(500),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
  usefulLifeMonths: numberField(0, 1200),
  isActive: z.boolean(),
});

export type AssetCategoryFormValues = z.infer<typeof AssetCategorySchema>;

export const AssignAssetSchema = z
  .object({
    holderType: z.enum(ASSET_HOLDER_TYPES),
    holderId: z.string().trim().min(1, "Pick who takes it"),
    assignedAt: z.string().trim().min(1, "Pick the handover date"),
    dueAt: z.string().trim(),
    condition: z.enum(ASSET_CONDITIONS),
    notes: z.string().trim().max(1000),
  })
  .refine((values) => !values.dueAt || values.dueAt >= values.assignedAt, {
    path: ["dueAt"],
    message: "The return date cannot be before the handover",
  });

export type AssignAssetFormValues = z.infer<typeof AssignAssetSchema>;

export const ReturnAssetSchema = z.object({
  returnedAt: z.string().trim().min(1, "Pick the return date"),
  condition: z.enum(ASSET_CONDITIONS),
  status: z.enum(ASSET_STATUSES),
  notes: z.string().trim().max(1000),
});

export type ReturnAssetFormValues = z.infer<typeof ReturnAssetSchema>;

export const MaintenanceSchema = z.object({
  assetId: z.string().trim().min(1, "Pick the asset"),
  type: z.enum(MAINTENANCE_TYPES),
  status: z.enum(MAINTENANCE_STATUSES),
  title: z.string().trim().min(1, "Give the job a title").max(120),
  description: z.string().trim().max(2000),
  scheduledAt: z.string().trim().min(1, "Pick when it is scheduled"),
  completedAt: z.string().trim(),
  cost: numberField(0, 1_000_000_000),
  vendorName: z.string().trim().max(120),
  performedByEmployeeId: z.string().trim(),
});

export type MaintenanceFormValues = z.infer<typeof MaintenanceSchema>;
