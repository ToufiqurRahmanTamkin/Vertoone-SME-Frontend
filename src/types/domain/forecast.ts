import type { EmployeeRef } from "./employee";
import type { PipelineRef } from "./pipeline";
import type { SupportedCurrency } from "./plan";

export const FORECAST_PERIOD_TYPES = ["MONTH", "QUARTER"] as const;

export type ForecastPeriodType = (typeof FORECAST_PERIOD_TYPES)[number];

export const FORECAST_PERIOD_TYPE_LABELS: Record<ForecastPeriodType, string> = {
  MONTH: "Monthly",
  QUARTER: "Quarterly",
};

export const FORECAST_COMMIT_PROBABILITY = 75;

export const FORECAST_BEST_CASE_PROBABILITY = 40;

export interface ForecastPeriodRow {
  period: string;
  label: string;
  start: string;
  end: string;
  isCurrent: boolean;
  target: number;
  wonValue: number;
  wonCount: number;
  lostValue: number;
  lostCount: number;
  commitValue: number;
  bestCaseValue: number;
  pipelineValue: number;
  weightedValue: number;
  forecastValue: number;
  openCount: number;
  attainment: number;
  gap: number;
}

export interface ForecastOwnerRow {
  ownerId: string | null;
  name: string;
  target: number;
  wonValue: number;
  weightedValue: number;
  forecastValue: number;
  openCount: number;
  openValue: number;
  attainment: number;
}

export interface ForecastPipelineRow {
  pipelineId: string;
  name: string;
  color: string;
  wonValue: number;
  weightedValue: number;
  openValue: number;
  openCount: number;
}

export interface ForecastTotals {
  target: number;
  wonValue: number;
  wonCount: number;
  commitValue: number;
  bestCaseValue: number;
  pipelineValue: number;
  weightedValue: number;
  forecastValue: number;
  openCount: number;
  attainment: number;
  gap: number;
  averageDealSize: number;
  winRate: number;
}

export interface Forecast {
  periodType: ForecastPeriodType;
  currency: SupportedCurrency;
  periods: ForecastPeriodRow[];
  totals: ForecastTotals;
  byOwner: ForecastOwnerRow[];
  byPipeline: ForecastPipelineRow[];
}

export interface ForecastQuery {
  periodType?: ForecastPeriodType;
  periods?: number;
  anchor?: string;
  pipelineId?: string;
  ownerId?: string;
}

export interface ForecastTarget {
  _id: string;
  periodType: ForecastPeriodType;
  period: string;
  periodLabel: string;
  owner: EmployeeRef | null;
  ownerId: string | null;
  pipeline: PipelineRef | null;
  pipelineId: string | null;
  amount: number;
  currency: SupportedCurrency;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForecastTargetListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  periodType?: ForecastPeriodType;
  period?: string;
  ownerId?: string;
  pipelineId?: string;
}

export interface ForecastTargetPayload {
  periodType: ForecastPeriodType;
  period: string;
  ownerId?: string | null;
  pipelineId?: string | null;
  amount: number;
  currency?: SupportedCurrency;
  notes?: string;
}

export type ForecastTargetUpdatePayload = Partial<ForecastTargetPayload>;
