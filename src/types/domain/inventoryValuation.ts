export const VALUATION_METHODS = ["AVERAGE_COST", "LAST_PURCHASE_PRICE"] as const;

export type ValuationMethod = (typeof VALUATION_METHODS)[number];

export const VALUATION_METHOD_LABELS: Record<ValuationMethod, string> = {
  AVERAGE_COST: "Average cost",
  LAST_PURCHASE_PRICE: "Last purchase price",
};

export const VALUATION_GROUPINGS = ["PRODUCT", "CATEGORY", "WAREHOUSE", "BRAND"] as const;

export type ValuationGrouping = (typeof VALUATION_GROUPINGS)[number];

export const VALUATION_GROUPING_LABELS: Record<ValuationGrouping, string> = {
  PRODUCT: "Product",
  CATEGORY: "Category",
  WAREHOUSE: "Warehouse",
  BRAND: "Brand",
};

export interface ValuationRow {
  _id: string;
  name: string;
  sku: string;
  categoryName: string;
  brandName: string;
  quantity: number;
  unitCost: number;
  costValue: number;
  sellingPrice: number;
  retailValue: number;
  potentialProfit: number;
  marginPercent: number;
  warehouseCount: number;
  lastMovementAt: string | null;
  isDeadStock: boolean;
}

export interface ValuationGroupRow {
  _id: string;
  label: string;
  productCount: number;
  quantity: number;
  costValue: number;
  retailValue: number;
  sharePercent: number;
}

export interface ValuationSummary {
  method: ValuationMethod;
  currency: string;
  skuCount: number;
  quantity: number;
  costValue: number;
  retailValue: number;
  potentialProfit: number;
  marginPercent: number;
  warehouseCount: number;
  deadStockCount: number;
  deadStockValue: number;
  negativeStockCount: number;
}

export interface ValuationListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  categoryId?: string;
  brandId?: string;
  warehouseId?: string;
  method?: ValuationMethod;
  deadStockOnly?: boolean;
}

export interface ValuationGroupQuery {
  groupBy?: ValuationGrouping;
  warehouseId?: string;
  method?: ValuationMethod;
}
