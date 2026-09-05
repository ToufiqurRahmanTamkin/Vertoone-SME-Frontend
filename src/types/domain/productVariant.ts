import type { ProductRef } from "./product";

export const PRODUCT_OPTION_DISPLAY_TYPES = ["SELECT", "COLOR", "BUTTON"] as const;

export type ProductOptionDisplayType = (typeof PRODUCT_OPTION_DISPLAY_TYPES)[number];

export const PRODUCT_OPTION_DISPLAY_LABELS: Record<ProductOptionDisplayType, string> = {
  SELECT: "Dropdown",
  COLOR: "Colour swatch",
  BUTTON: "Buttons",
};

export interface ProductOptionRef {
  _id: string;
  name: string;
  values: string[];
  displayType: ProductOptionDisplayType;
}

export interface ProductOption extends ProductOptionRef {
  description: string;
  variantCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VariantSelection {
  optionId: string | null;
  optionName: string;
  value: string;
}

export interface ProductVariantRef {
  _id: string;
  name: string;
  sku: string;
}

export interface ProductVariant extends ProductVariantRef {
  productId: string;
  product: ProductRef | null;
  barcode: string;
  selections: VariantSelection[];
  purchasePrice: number;
  sellingPrice: number;
  lowStockAlert: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOptionListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface ProductVariantListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  productId?: string;
  optionId?: string;
  isActive?: boolean;
}

export interface ProductVariantSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  optionCount: number;
  optionValueCount: number;
  productCount: number;
}

export interface ProductOptionPayload {
  name: string;
  values: string[];
  displayType?: ProductOptionDisplayType;
  description?: string;
  isActive?: boolean;
}

export interface VariantSelectionPayload {
  optionId?: string | null;
  optionName?: string;
  value: string;
}

export interface ProductVariantPayload {
  productId: string;
  sku?: string;
  barcode?: string;
  selections: VariantSelectionPayload[];
  purchasePrice?: number;
  sellingPrice?: number;
  lowStockAlert?: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
}
