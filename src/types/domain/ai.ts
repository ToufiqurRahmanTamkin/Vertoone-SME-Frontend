import type { EmployeeRange } from "./company";
import type { FinanceCategoryType } from "./finance";

export interface AiAllowance {
  limit: number | null;
  used: number;
  remaining: number | null;
  periodKey: string;
  isConfigured: boolean;
}

export interface AiGeneratedCategory {
  name: string;
  type: FinanceCategoryType;
  description: string;
}

export interface GenerateCategoriesPayload {
  count: number;
  type?: FinanceCategoryType | "BOTH";
  context?: string;
}

export interface AiPlanCopy {
  description: string;
  features: string[];
}

export interface GeneratePlanCopyPayload {
  name: string;
  price?: number;
  currency?: string;
  billingCycle?: string;
  trialDays?: number;
  userLimit?: number | null;
  moduleLabels?: string[];
}

export interface AiCompanyDraft {
  name: string;
  email: string;
  phone: string;
  address: string;
  employeeRange: EmployeeRange;
  ownerName: string;
  ownerEmail: string;
}
