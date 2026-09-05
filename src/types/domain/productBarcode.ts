import type { ProductRef } from "./product";
import type { ProductVariantRef } from "./productVariant";

export const BARCODE_SYMBOLOGIES = [
  "EAN13",
  "EAN8",
  "UPC_A",
  "CODE128",
  "CODE39",
  "ITF14",
  "QR",
] as const;

export type BarcodeSymbology = (typeof BARCODE_SYMBOLOGIES)[number];

export const BARCODE_SYMBOLOGY_LABELS: Record<BarcodeSymbology, string> = {
  EAN13: "EAN-13",
  EAN8: "EAN-8",
  UPC_A: "UPC-A",
  CODE128: "Code 128",
  CODE39: "Code 39",
  ITF14: "ITF-14",
  QR: "QR code",
};

export const BARCODE_LENGTHS: Partial<Record<BarcodeSymbology, number>> = {
  EAN13: 13,
  EAN8: 8,
  UPC_A: 12,
  ITF14: 14,
};

export const LABEL_PRESETS = ["SMALL", "MEDIUM", "LARGE", "CUSTOM"] as const;

export type LabelPreset = (typeof LABEL_PRESETS)[number];

export const LABEL_PRESET_LABELS: Record<LabelPreset, string> = {
  SMALL: "Small · 38 × 25 mm",
  MEDIUM: "Medium · 50 × 30 mm",
  LARGE: "Large · 100 × 50 mm",
  CUSTOM: "Custom size",
};

export interface ProductBarcode {
  _id: string;
  productId: string;
  product: ProductRef | null;
  variantId: string | null;
  variant: ProductVariantRef | null;
  code: string;
  symbology: BarcodeSymbology;
  packSize: number;
  isPrimary: boolean;
  note: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabelFields {
  showName: boolean;
  showSku: boolean;
  showPrice: boolean;
  showBarcode: boolean;
  showCompany: boolean;
}

export interface LabelTemplate {
  _id: string;
  name: string;
  preset: LabelPreset;
  widthMm: number;
  heightMm: number;
  columns: number;
  gapMm: number;
  symbology: BarcodeSymbology;
  fields: LabelFields;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  labelsPerSheet: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBarcodeListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  productId?: string;
  symbology?: BarcodeSymbology;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface LabelTemplateListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  preset?: LabelPreset;
  isActive?: boolean;
}

export interface ProductBarcodeSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  primaryCount: number;
  templateCount: number;
  coveredProductCount: number;
  uncoveredProductCount: number;
}

export interface ProductBarcodePayload {
  productId: string;
  variantId?: string | null;
  code?: string;
  symbology?: BarcodeSymbology;
  packSize?: number;
  isPrimary?: boolean;
  note?: string;
  isActive?: boolean;
}

export interface LabelTemplatePayload {
  name: string;
  preset?: LabelPreset;
  widthMm?: number;
  heightMm?: number;
  columns?: number;
  gapMm?: number;
  symbology?: BarcodeSymbology;
  fields?: Partial<LabelFields>;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
}
