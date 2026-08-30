import type { EmployeeRef } from "./employee";

export const WAREHOUSE_TYPES = ["WAREHOUSE", "OUTLET", "VEHICLE", "VIRTUAL"] as const;

export type WarehouseType = (typeof WAREHOUSE_TYPES)[number];

export const WAREHOUSE_TYPE_LABELS: Record<WarehouseType, string> = {
  WAREHOUSE: "Warehouse",
  OUTLET: "Outlet",
  VEHICLE: "Vehicle",
  VIRTUAL: "Virtual",
};

export interface WarehouseAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface WarehouseRef {
  _id: string;
  name: string;
  code: string;
}

export interface Warehouse extends WarehouseRef {
  type: WarehouseType;
  managerId: string | null;
  manager: EmployeeRef | null;
  contactPerson: string;
  phone: string;
  email: string;
  address: WarehouseAddress;
  isDefault: boolean;
  allowNegativeStock: boolean;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: WarehouseType;
  isActive?: boolean;
}

export interface WarehouseOptionQuery {
  search?: string;
}

export interface WarehouseSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  stockValue: number;
}

export interface WarehousePayload {
  name: string;
  code?: string;
  type?: WarehouseType;
  managerId?: string | null;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: Partial<WarehouseAddress>;
  isDefault?: boolean;
  allowNegativeStock?: boolean;
  notes?: string;
  isActive?: boolean;
}
