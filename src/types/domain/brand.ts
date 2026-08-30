export const DEFAULT_BRAND_COLOR = "#f97316";

export interface BrandRef {
  _id: string;
  name: string;
  color: string;
  logoUrl: string | null;
}

export interface Brand extends BrandRef {
  description: string;
  website: string;
  logoPublicId: string | null;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface BrandOptionQuery {
  search?: string;
}

export interface BrandSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
}

export interface BrandPayload {
  name: string;
  color?: string;
  description?: string;
  website?: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  isActive?: boolean;
}
