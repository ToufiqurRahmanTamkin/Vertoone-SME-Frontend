import type { ProductCategoryRef } from "./productCategory";

export const DEFAULT_PRODUCT_SUB_CATEGORY_COLOR = "#14b8a6";

export interface ProductSubCategoryRef {
  _id: string;
  name: string;
  color: string;
}

export interface ProductSubCategory extends ProductSubCategoryRef {
  categoryId: string;
  category: ProductCategoryRef | null;
  code: string;
  description: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSubCategoryListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface ProductSubCategoryOptionQuery {
  search?: string;
  categoryId?: string;
}

export interface ProductSubCategorySummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  categoryCount: number;
}

export interface ProductSubCategoryPayload {
  categoryId: string;
  name: string;
  code?: string;
  color?: string;
  description?: string;
  isActive?: boolean;
}
