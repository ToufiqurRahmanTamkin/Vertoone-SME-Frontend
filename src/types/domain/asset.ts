import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";

export const ASSET_STATUSES = [
  "AVAILABLE",
  "ASSIGNED",
  "UNDER_MAINTENANCE",
  "RETIRED",
  "LOST",
  "DAMAGED",
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  AVAILABLE: "Available",
  ASSIGNED: "With someone",
  UNDER_MAINTENANCE: "In for repair",
  RETIRED: "Retired",
  LOST: "Lost",
  DAMAGED: "Damaged",
};

export const ASSET_STATUS_COLORS: Record<AssetStatus, StatusColor> = {
  AVAILABLE: "green",
  ASSIGNED: "blue",
  UNDER_MAINTENANCE: "amber",
  RETIRED: "zinc",
  LOST: "red",
  DAMAGED: "red",
};

export const ASSET_CONDITIONS = ["NEW", "GOOD", "FAIR", "POOR", "UNUSABLE"] as const;
export type AssetCondition = (typeof ASSET_CONDITIONS)[number];

export const ASSET_CONDITION_LABELS: Record<AssetCondition, string> = {
  NEW: "New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  UNUSABLE: "Unusable",
};

export const ASSET_HOLDER_TYPES = ["EMPLOYEE", "USER"] as const;
export type AssetHolderType = (typeof ASSET_HOLDER_TYPES)[number];

export const ASSIGNMENT_STATUSES = ["ACTIVE", "RETURNED"] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  ACTIVE: "Out",
  RETURNED: "Returned",
};

export const MAINTENANCE_TYPES = [
  "REPAIR",
  "SERVICE",
  "INSPECTION",
  "UPGRADE",
  "CALIBRATION",
] as const;
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  REPAIR: "Repair",
  SERVICE: "Service",
  INSPECTION: "Inspection",
  UPGRADE: "Upgrade",
  CALIBRATION: "Calibration",
};

export const MAINTENANCE_STATUSES = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In progress",
  COMPLETED: "Done",
  CANCELLED: "Cancelled",
};

export interface AssetFile {
  url: string;
  publicId: string;
  fileName: string;
}

export interface AssetCategoryRef {
  _id: string;
  name: string;
  code: string;
  color: string;
}

export interface AssetCategory extends AssetCategoryRef {
  description: string;
  usefulLifeMonths: number;
  isActive: boolean;
  assetCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetHolder {
  type: AssetHolderType;
  _id: string;
  name: string;
  detail: string;
}

export interface AssetRef {
  _id: string;
  assetCode: string;
  name: string;
  serialNumber: string;
}

export interface Asset extends AssetRef {
  description: string;
  category: AssetCategoryRef | null;
  categoryId: string | null;
  brand: string;
  modelNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  location: string;
  purchaseDate: string | null;
  purchaseCost: number;
  supplierName: string;
  invoiceNumber: string;
  warrantyExpiresAt: string | null;
  isUnderWarranty: boolean;
  isWarrantyExpiringSoon: boolean;
  usefulLifeMonths: number;
  salvageValue: number;
  currentValue: number;
  ageInMonths: number;
  image: AssetFile | null;
  notes: string;
  holder: AssetHolder | null;
  holderType: AssetHolderType | null;
  assignedEmployeeId: string | null;
  assignedUserId: string | null;
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  categoryId?: string;
  assignedEmployeeId?: string;
  assignedUserId?: string;
  unassignedOnly?: boolean;
}

export interface AssetSummary {
  currency: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  totalValue: number;
  currentValue: number;
  availableCount: number;
  assignedCount: number;
  maintenanceCount: number;
  retiredCount: number;
  warrantyExpiringCount: number;
  categoryCount: number;
}

export interface AssetPayload {
  name: string;
  assetCode?: string;
  description?: string;
  categoryId?: string | null;
  brand?: string;
  modelNumber?: string;
  serialNumber?: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  location?: string;
  purchaseDate?: string | null;
  purchaseCost?: number;
  supplierName?: string;
  invoiceNumber?: string;
  warrantyExpiresAt?: string | null;
  usefulLifeMonths?: number;
  salvageValue?: number;
  image?: AssetFile | null;
  notes?: string;
}

export interface AssignAssetPayload {
  holderType: AssetHolderType;
  employeeId?: string;
  userId?: string;
  assignedAt?: string;
  dueAt?: string | null;
  condition?: AssetCondition;
  notes?: string;
}

export interface ReturnAssetPayload {
  returnedAt?: string;
  condition?: AssetCondition;
  status?: AssetStatus;
  notes?: string;
}

export interface AssetAssignment {
  _id: string;
  asset: AssetRef | null;
  assetId: string | null;
  holder: AssetHolder | null;
  holderType: AssetHolderType;
  status: AssignmentStatus;
  assignedAt: string;
  dueAt: string | null;
  returnedAt: string | null;
  isOverdue: boolean;
  daysHeld: number;
  conditionOnAssign: AssetCondition;
  conditionOnReturn: AssetCondition | null;
  notes: string;
  returnNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetAssignmentListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  assetId?: string;
  employeeId?: string;
  userId?: string;
  status?: AssignmentStatus;
  overdueOnly?: boolean;
}

export interface AssetAssignmentSummary {
  total: number;
  activeCount: number;
  returnedCount: number;
  overdueCount: number;
  employeeHeldCount: number;
  userHeldCount: number;
}

export interface AssetMaintenance {
  _id: string;
  asset: AssetRef | null;
  assetId: string | null;
  type: MaintenanceType;
  status: MaintenanceStatus;
  title: string;
  description: string;
  scheduledAt: string;
  completedAt: string | null;
  isOverdue: boolean;
  cost: number;
  vendorName: string;
  performedBy: EmployeeRef | null;
  performedByEmployeeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetMaintenanceListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  assetId?: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
}

export interface AssetMaintenanceSummary {
  total: number;
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
  overdueCount: number;
  totalCost: number;
}

export interface MaintenancePayload {
  assetId: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  title: string;
  description?: string;
  scheduledAt: string;
  completedAt?: string | null;
  cost?: number;
  vendorName?: string;
  performedByEmployeeId?: string | null;
}

export interface AssetCategoryPayload {
  name: string;
  code?: string;
  description?: string;
  color?: string;
  usefulLifeMonths?: number;
  isActive?: boolean;
}

export interface AssetCategoryListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface AssetHolderOption {
  type: AssetHolderType;
  _id: string;
  name: string;
  detail: string;
  assetCount: number;
}

export interface AssetOverview {
  assets: AssetSummary;
  assignments: AssetAssignmentSummary;
  maintenance: AssetMaintenanceSummary;
  byStatus: { status: AssetStatus; count: number }[];
  byCategory: { categoryId: string; name: string; color: string; count: number; value: number }[];
  topHolders: AssetHolderOption[];
  recentAssignments: AssetAssignment[];
  warrantyExpiring: Asset[];
}
