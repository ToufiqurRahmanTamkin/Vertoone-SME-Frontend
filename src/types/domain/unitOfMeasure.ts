export const UNIT_FAMILIES = [
  "COUNT",
  "WEIGHT",
  "VOLUME",
  "LENGTH",
  "AREA",
  "TIME",
  "PACK",
] as const;

export type UnitFamily = (typeof UNIT_FAMILIES)[number];

export const UNIT_FAMILY_LABELS: Record<UnitFamily, string> = {
  COUNT: "Count",
  WEIGHT: "Weight",
  VOLUME: "Volume",
  LENGTH: "Length",
  AREA: "Area",
  TIME: "Time",
  PACK: "Pack",
};

export interface UnitOfMeasureRef {
  _id: string;
  name: string;
  code: string;
  family: UnitFamily;
  precision: number;
}

export interface UnitOfMeasure extends UnitOfMeasureRef {
  isBase: boolean;
  baseUnitId: string | null;
  baseUnit: UnitOfMeasureRef | null;
  conversionFactor: number;
  description: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnitOfMeasureListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  family?: UnitFamily;
  isBase?: boolean;
  isActive?: boolean;
}

export interface UnitOfMeasureOptionQuery {
  search?: string;
  family?: UnitFamily;
}

export interface UnitOfMeasureSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  baseCount: number;
  familyCount: number;
  linkedProductCount: number;
}

export interface UnitOfMeasurePayload {
  name: string;
  code: string;
  family?: UnitFamily;
  isBase?: boolean;
  baseUnitId?: string | null;
  conversionFactor?: number;
  precision?: number;
  description?: string;
  isActive?: boolean;
}
