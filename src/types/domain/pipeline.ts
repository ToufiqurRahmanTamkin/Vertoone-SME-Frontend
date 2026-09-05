import type { StatusColor } from "@/components/shared/status-badge";
import type { ContactTypeRef } from "./contactType";
import type { EmployeeRef } from "./employee";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "./plan";

export { SUPPORTED_CURRENCIES, type SupportedCurrency };

export const DEFAULT_PIPELINE_COLOR = "#4f46e5";

export const DEFAULT_STAGE_COLOR = "#64748b";

export const MAX_PIPELINE_STAGES = 24;

export const PIPELINE_STAGE_TYPES = ["OPEN", "WON", "LOST"] as const;

export type PipelineStageType = (typeof PIPELINE_STAGE_TYPES)[number];

export const PIPELINE_STAGE_TYPE_LABELS: Record<PipelineStageType, string> = {
  OPEN: "Open",
  WON: "Won",
  LOST: "Lost",
};

export const PIPELINE_STAGE_TYPE_COLORS: Record<PipelineStageType, StatusColor> = {
  OPEN: "blue",
  WON: "green",
  LOST: "red",
};

export interface PipelineStage {
  _id: string;
  name: string;
  color: string;
  description: string;
  order: number;
  probability: number;
  type: PipelineStageType;
  rottingDays: number;
}

export interface PipelineRef {
  _id: string;
  name: string;
  color: string;
}

export interface Pipeline extends PipelineRef {
  description: string;
  contactType: ContactTypeRef | null;
  contactTypeId: string | null;
  owner: EmployeeRef | null;
  ownerId: string | null;
  currency: SupportedCurrency;
  stages: PipelineStage[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStageStats {
  stageId: string;
  dealCount: number;
  totalValue: number;
  weightedValue: number;
}

export interface PipelineWithStats extends Pipeline {
  dealCount: number;
  openValue: number;
  wonValue: number;
  stageStats: PipelineStageStats[];
}

export interface PipelineListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  contactTypeId?: string;
  ownerId?: string;
}

export interface PipelineOptionQuery {
  search?: string;
}

export interface PipelineSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  dealCount: number;
  openValue: number;
  wonValue: number;
}

export interface PipelineStagePayload {
  _id?: string;
  name: string;
  color?: string;
  description?: string;
  probability?: number;
  type?: PipelineStageType;
  rottingDays?: number;
}

export interface PipelinePayload {
  name: string;
  color?: string;
  description?: string;
  contactTypeId?: string | null;
  ownerId?: string | null;
  currency?: SupportedCurrency;
  stages?: PipelineStagePayload[];
  isDefault?: boolean;
  isActive?: boolean;
}

