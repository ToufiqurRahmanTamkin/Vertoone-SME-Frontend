import type { WarehouseRef } from "./warehouse";

export interface ShopSettings {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  bannerUrl: string | null;
  bannerPublicId: string | null;
  accentColor: string;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  warehouseId: string | null;
  warehouse: WarehouseRef | null;
  isPublished: boolean;
  acceptsOrders: boolean;
  deliveryCharge: number;
  minimumOrderValue: number;
  orderInstructions: string;
  publicUrl: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettingsPayload {
  slug?: string;
  name?: string;
  tagline?: string;
  description?: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  bannerUrl?: string | null;
  bannerPublicId?: string | null;
  accentColor?: string;
  currency?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  warehouseId?: string | null;
  isPublished?: boolean;
  acceptsOrders?: boolean;
  deliveryCharge?: number;
  minimumOrderValue?: number;
  orderInstructions?: string;
}

export interface ShopSummary {
  isPublished: boolean;
  acceptsOrders: boolean;
  listedProducts: number;
  outOfStockProducts: number;
  publicUrl: string;
  pendingOrders: number;
  ordersLast30Days: number;
  revenueLast30Days: number;
  currency?: string;
}
