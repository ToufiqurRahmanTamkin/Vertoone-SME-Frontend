export const DEFAULT_PRODUCT_CATEGORY_COLOR = "#0ea5e9";

export interface ProductCategoryRef {
  _id: string;
  name: string;
  color: string;
}

export interface ProductCategory extends ProductCategoryRef {
  code: string;
  description: string;
  subCategoryCount: number;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategoryListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface ProductCategoryOptionQuery {
  search?: string;
}

export interface ProductCategorySummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  subCategoryCount: number;
}

export interface ProductCategoryPayload {
  name: string;
  code?: string;
  color?: string;
  description?: string;
  isActive?: boolean;
}

export interface BulkProductCategoryRow {
  row: number;
  name: string;
  code: string | null;
  error: string | null;
}

export interface BulkProductCategoryResult {
  created: number;
  failed: number;
  rows: BulkProductCategoryRow[];
}
