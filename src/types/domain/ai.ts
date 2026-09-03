import type { EmployeeRange } from "./company";
import type { GoalCategory, GoalMetricType, GoalPriority } from "./goal";
import type { NoteVisibility } from "./note";
import type { TaskBoardVisibility, TaskPriority } from "./task";
import type { FinanceCategoryType } from "./finance";
import type { LeaveAccrual, LeaveGender } from "./leaveType";

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
  street: string;
  city: string;
  zipCode: string;
  country: string;
  employeeRange: EmployeeRange;
  ownerName: string;
  ownerEmail: string;
}

export interface AiBoardList {
  name: string;
  color: string;
  isDoneList: boolean;
}

export interface AiBoardLabel {
  name: string;
  color: string;
}

export interface AiBoardCard {
  title: string;
  description: string;
  listName: string;
  priority: TaskPriority;
}

export interface AiBoardDraft {
  name: string;
  description: string;
  color: string;
  visibility: TaskBoardVisibility;
  lists: AiBoardList[];
  labels: AiBoardLabel[];
  cards: AiBoardCard[];
}

export interface GenerateBoardPayload {
  prompt: string;
  listCount?: number;
  cardCount?: number;
  includeCards?: boolean;
}

export interface AiKeyResultDraft {
  title: string;
  metricType: GoalMetricType;
  unit: string;
  startValue: number;
  targetValue: number;
}

export interface AiGoalDraft {
  title: string;
  description: string;
  color: string;
  category: GoalCategory;
  priority: GoalPriority;
  metricType: GoalMetricType;
  unit: string;
  startValue: number;
  targetValue: number;
  keyResults: AiKeyResultDraft[];
}

export interface GenerateGoalPayload {
  prompt: string;
  category?: GoalCategory;
  keyResultCount?: number;
  horizon?: string;
}

export interface AiNoteDraft {
  title: string;
  content: string;
  color: string;
  visibility: NoteVisibility;
  tagSuggestions: string[];
}

export interface GenerateNotePayload {
  prompt: string;
  tone?: string;
  format?: string;
}

export interface AiDepartmentDraft {
  name: string;
  description: string;
}

export interface GenerateDepartmentsPayload {
  count: number;
  context?: string;
}

export interface AiDesignationDraft {
  name: string;
  description: string;
  level: number;
}

export interface GenerateDesignationsPayload {
  count: number;
  context?: string;
  departmentName?: string;
}

export interface AiLeaveTypeDraft {
  name: string;
  code: string;
  color: string;
  description: string;
  daysPerYear: number;
  isPaid: boolean;
  accrual: LeaveAccrual;
  carryForward: boolean;
  applicableGender: LeaveGender;
  requiresDocument: boolean;
  documentAfterDays: number;
  noticeDays: number;
}

export interface GenerateLeaveTypesPayload {
  count: number;
  context?: string;
  country?: string;
  paidOnly?: boolean;
}
