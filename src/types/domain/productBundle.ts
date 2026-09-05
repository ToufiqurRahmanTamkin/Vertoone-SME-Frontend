import type { ProductRef } from "./product";

export const BUNDLE_TYPES = ["BUNDLE", "KIT"] as const;

export type BundleType = (typeof BUNDLE_TYPES)[number];

export const BUNDLE_TYPE_LABELS: Record<BundleType, string> = {
  BUNDLE: "Bundle",
  KIT: "Kit",
};

export const BUNDLE_PRICING_MODES = ["FIXED", "SUM_OF_COMPONENTS"] as const;

export type BundlePricingMode = (typeof BUNDLE_PRICING_MODES)[number];

export const BUNDLE_PRICING_LABELS: Record<BundlePricingMode, string> = {
  FIXED: "Fixed bundle price",
  SUM_OF_COMPONENTS: "Sum of the parts",
};

export interface BundleChannels {
  pos: boolean;
  shop: boolean;
}

export interface BundleComponent {
  _id: string;
  productId: string;
  product: ProductRef | null;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  onHand: number;
  buildable: number;
}

export interface ProductBundle {
  _id: string;
  name: string;
  code: string;
  type: BundleType;
  description: string;
  components: BundleComponent[];
  componentCount: number;
  pricingMode: BundlePricingMode;
  sellingPrice: number;
  componentsTotal: number;
  savings: number;
  savingsPercent: number;
  taxRate: number;
  channels: BundleChannels;
  imageUrl: string | null;
  imagePublicId: string | null;
  notes: string;
  buildableQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBundleListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: BundleType;
  productId?: string;
  channel?: "pos" | "shop";
  isActive?: boolean;
}

export interface ProductBundleSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  kitCount: number;
  componentCount: number;
  averageSavings: number;
  buildableCount: number;
}

export interface BundleComponentPayload {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface ProductBundlePayload {
  name: string;
  code?: string;
  type?: BundleType;
  description?: string;
  components: BundleComponentPayload[];
  pricingMode?: BundlePricingMode;
  sellingPrice?: number;
  taxRate?: number;
  channels?: Partial<BundleChannels>;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  notes?: string;
  isActive?: boolean;
}
