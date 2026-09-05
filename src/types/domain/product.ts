import type { BrandRef } from "./brand";
import type { ProductCategoryRef } from "./productCategory";
import type { ProductSubCategoryRef } from "./productSubCategory";
import type { TagRef } from "./tag";
import type { UnitOfMeasureRef } from "./unitOfMeasure";

export const PRODUCT_TYPES = ["STOCKED", "SERVICE", "DIGITAL"] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  STOCKED: "Stocked item",
  SERVICE: "Service",
  DIGITAL: "Digital item",
};

export type ProductChannel = "pos" | "shop";

export const PRODUCT_CHANNEL_LABELS: Record<ProductChannel, string> = {
  pos: "Point of Sale",
  shop: "Online shop",
};

export interface ProductChannels {
  pos: boolean;
  shop: boolean;
}

export interface ProductRef {
  _id: string;
  name: string;
  sku: string;
}

export interface Product extends ProductRef {
  barcode: string;
  type: ProductType;
  categoryId: string;
  category: ProductCategoryRef | null;
  subCategoryId: string | null;
  subCategory: ProductSubCategoryRef | null;
  brandId: string | null;
  brand: BrandRef | null;
  unitId: string | null;
  unit: UnitOfMeasureRef | null;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  openingStock: number;
  lowStockAlert: number;
  channels: ProductChannels;
  imageUrl: string | null;
  imagePublicId: string | null;
  tags: TagRef[];
  tagIds: string[];
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPricingOption extends ProductRef {
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  lowStockAlert: number;
  type: ProductType;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  categoryId?: string;
  subCategoryId?: string;
  brandId?: string;
  unitId?: string;
  type?: ProductType;
  channel?: ProductChannel;
  isActive?: boolean;
  tagIds?: string;
}

export interface ProductOptionQuery {
  search?: string;
}

export interface ProductSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  posCount: number;
  stockValue: number;
}

export interface ProductPayload {
  name: string;
  sku?: string;
  barcode?: string;
  type?: ProductType;
  categoryId: string;
  subCategoryId?: string | null;
  brandId?: string | null;
  unitId?: string | null;
  description?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  taxRate?: number;
  openingStock?: number;
  lowStockAlert?: number;
  channels?: Partial<ProductChannels>;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  tagIds?: string[];
  notes?: string;
  isActive?: boolean;
}
