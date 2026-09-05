import type { BrandRef } from "./brand";
import type { ProductCategoryRef } from "./productCategory";

export interface ProductCatalogueKpis {
  total: number;
  active: number;
  inactive: number;
  limit: number | null;
  remaining: number | null;
  posCount: number;
  shopCount: number;
  bothChannelCount: number;
  addedThisMonth: number;
  addedLastMonth: number;
  addedChangePercent: number;
}

export interface ProductStructureKpis {
  categories: number;
  subCategories: number;
  brands: number;
  units: number;
}

export interface ProductVariantKpis {
  variants: number;
  options: number;
  productsWithVariants: number;
  limit: number | null;
}

export interface ProductCommerceKpis {
  bundles: number;
  bundleLimit: number | null;
  priceLists: number;
  priceListLimit: number | null;
  priceListItems: number;
  promotions: number;
  activePromotions: number;
  promotionLimit: number | null;
  barcodes: number;
  productsWithoutBarcode: number;
}

export interface ProductPricingKpis {
  averagePurchasePrice: number;
  averageSellingPrice: number;
  averageMarginPercent: number;
  lowestSellingPrice: number;
  highestSellingPrice: number;
  stockValue: number;
  retailValue: number;
}

export interface ProductCompleteness {
  total: number;
  withImage: number;
  withBarcode: number;
  withUnit: number;
  withBrand: number;
  withSubCategory: number;
}

export interface ProductBreakdownPoint {
  _id: string;
  name: string;
  color: string;
  count: number;
}

export interface ProductValueRow {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  stockValue: number;
  sellingPrice: number;
  lowStockAlert: number;
}

export interface ProductRecentRow {
  _id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  category: ProductCategoryRef | null;
  brand: BrandRef | null;
  isActive: boolean;
  createdAt: string;
}

export interface ProductOverview {
  catalogue: ProductCatalogueKpis;
  structure: ProductStructureKpis;
  variants: ProductVariantKpis;
  commerce: ProductCommerceKpis;
  pricing: ProductPricingKpis;
  completeness: ProductCompleteness;
  categories: ProductBreakdownPoint[];
  brands: ProductBreakdownPoint[];
  topValueProducts: ProductValueRow[];
  lowStockProducts: ProductValueRow[];
  recentProducts: ProductRecentRow[];
  currency: string;
}
