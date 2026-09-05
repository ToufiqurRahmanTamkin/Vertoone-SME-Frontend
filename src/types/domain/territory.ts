import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";

export const DEFAULT_TERRITORY_COLOR = "#2563eb";

export const TERRITORY_MATCH_MODES = ["GEOGRAPHY", "OWNER", "BOTH", "MANUAL"] as const;

export type TerritoryMatchMode = (typeof TERRITORY_MATCH_MODES)[number];

export const TERRITORY_MATCH_MODE_LABELS: Record<TerritoryMatchMode, string> = {
  GEOGRAPHY: "By location",
  OWNER: "By who owns it",
  BOTH: "Location or owner",
  MANUAL: "Manual only",
};

export const TERRITORY_MATCH_MODE_HINTS: Record<TerritoryMatchMode, string> = {
  GEOGRAPHY: "Records whose address falls inside the countries, states, cities or postcodes below.",
  OWNER: "Everything the manager and members of this territory own.",
  BOTH: "Either the address matches, or the record belongs to someone on this territory.",
  MANUAL: "No automatic matching. Use it to hold a team that you assign by hand.",
};

export const TERRITORY_MATCH_MODE_COLORS: Record<TerritoryMatchMode, StatusColor> = {
  GEOGRAPHY: "blue",
  OWNER: "violet",
  BOTH: "green",
  MANUAL: "zinc",
};

export interface TerritoryRules {
  countries: string[];
  states: string[];
  cities: string[];
  postalCodes: string[];
}

export interface TerritoryCoverage {
  contactCount: number;
  leadCount: number;
  dealCount: number;
  openDealCount: number;
  openValue: number;
  wonValue: number;
}

export interface TerritoryRef {
  _id: string;
  name: string;
  color: string;
}

export interface Territory extends TerritoryRef {
  code: string;
  description: string;
  manager: EmployeeRef | null;
  managerId: string | null;
  members: EmployeeRef[];
  memberIds: string[];
  matchMode: TerritoryMatchMode;
  rules: TerritoryRules;
  priority: number;
  isActive: boolean;
  coverage: TerritoryCoverage;
  createdAt: string;
  updatedAt: string;
}

export interface TerritoryListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  matchMode?: TerritoryMatchMode;
  managerId?: string;
  memberId?: string;
}

export interface TerritoryOptionQuery {
  search?: string;
}

export interface TerritorySummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  coveredContactCount: number;
  uncoveredContactCount: number;
  coveredDealCount: number;
  uncoveredDealCount: number;
  coveredOpenValue: number;
}

export interface TerritoryPayload {
  name: string;
  code?: string;
  description?: string;
  color?: string;
  managerId?: string | null;
  memberIds?: string[];
  matchMode?: TerritoryMatchMode;
  rules?: Partial<TerritoryRules>;
  priority?: number;
  isActive?: boolean;
}
