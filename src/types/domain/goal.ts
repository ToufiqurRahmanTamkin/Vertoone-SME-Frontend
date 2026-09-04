import type { StatusColor } from "@/components/shared/status-badge";
import type { DepartmentRef } from "./department";
import type { EmployeeRef } from "./employee";
import type { TagRef } from "./tag";
import type { TaskBoardRef } from "./task";

export const GOAL_CATEGORIES = ["COMPANY", "DEPARTMENT", "TEAM", "INDIVIDUAL"] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  COMPANY: "Company",
  DEPARTMENT: "Department",
  TEAM: "Team",
  INDIVIDUAL: "Individual",
};

export const GOAL_STATUSES = [
  "NOT_STARTED",
  "ON_TRACK",
  "AT_RISK",
  "OFF_TRACK",
  "ACHIEVED",
  "MISSED",
  "CANCELLED",
] as const;

export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  NOT_STARTED: "Not started",
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  OFF_TRACK: "Off track",
  ACHIEVED: "Achieved",
  MISSED: "Missed",
  CANCELLED: "Cancelled",
};

export const GOAL_STATUS_COLORS: Record<GoalStatus, StatusColor> = {
  NOT_STARTED: "zinc",
  ON_TRACK: "green",
  AT_RISK: "amber",
  OFF_TRACK: "orange",
  ACHIEVED: "blue",
  MISSED: "red",
  CANCELLED: "muted",
};

export const GOAL_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type GoalPriority = (typeof GOAL_PRIORITIES)[number];

export const GOAL_PRIORITY_LABELS: Record<GoalPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const GOAL_PRIORITY_COLORS: Record<GoalPriority, StatusColor> = {
  LOW: "zinc",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

export const GOAL_METRIC_TYPES = ["PERCENT", "NUMBER", "CURRENCY"] as const;

export type GoalMetricType = (typeof GOAL_METRIC_TYPES)[number];

export const GOAL_METRIC_TYPE_LABELS: Record<GoalMetricType, string> = {
  PERCENT: "Percentage",
  NUMBER: "A count",
  CURRENCY: "An amount of money",
};

export const GOAL_PROGRESS_MODES = ["AUTO", "MANUAL"] as const;

export type GoalProgressMode = (typeof GOAL_PROGRESS_MODES)[number];

export const GOAL_PROGRESS_MODE_LABELS: Record<GoalProgressMode, string> = {
  AUTO: "Roll up from key results",
  MANUAL: "Track one number on the goal",
};

export const DEFAULT_GOAL_COLOR = "#8b5cf6";

export const MAX_GOAL_KEY_RESULTS = 20;

export const MAX_GOAL_MEMBERS = 50;

export const MAX_GOAL_TAGS = 20;

export interface GoalMetric {
  metricType: GoalMetricType;
  unit: string;
  startValue: number;
  targetValue: number;
  currentValue: number;
  progress: number;
}

export interface GoalKeyResult extends GoalMetric {
  _id: string;
  title: string;
  order: number;
  weight: number;
  owner: EmployeeRef | null;
  ownerId: string | null;
  dueDate: string | null;
  isCompleted: boolean;
}

export interface GoalCheckIn {
  _id: string;
  note: string;
  status: GoalStatus;
  progress: number;
  recordedAt: string;
  recordedBy: string | null;
}

export interface GoalRef {
  _id: string;
  code: string;
  title: string;
  color: string;
}

export interface Goal extends GoalRef {
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  priority: GoalPriority;
  progressMode: GoalProgressMode;
  progress: number;
  metric: GoalMetric;
  keyResults: GoalKeyResult[];
  keyResultCount: number;
  keyResultDoneCount: number;
  checkIns: GoalCheckIn[];
  checkInCount: number;
  owner: EmployeeRef | null;
  ownerId: string | null;
  members: EmployeeRef[];
  memberIds: string[];
  department: DepartmentRef | null;
  departmentId: string | null;
  parentGoal: GoalRef | null;
  parentGoalId: string | null;
  board: TaskBoardRef | null;
  boardId: string | null;
  tags: TagRef[];
  tagIds: string[];
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  lastCheckInAt: string | null;
  isOpen: boolean;
  isOverdue: boolean;
  isDueSoon: boolean;
  daysRemaining: number | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  priority?: GoalPriority;
  ownerId?: string;
  memberId?: string;
  departmentId?: string;
  parentGoalId?: string;
  boardId?: string;
  tagIds?: string;
  isArchived?: boolean;
  isOverdue?: boolean;
  dueBefore?: string;
  dueAfter?: string;
}

export interface GoalOptionQuery {
  search?: string;
  excludeId?: string;
}

export interface GoalSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  total: number;
  openCount: number;
  onTrackCount: number;
  atRiskCount: number;
  offTrackCount: number;
  achievedCount: number;
  missedCount: number;
  overdueCount: number;
  dueSoonCount: number;
  archivedCount: number;
  averageProgress: number;
}

export interface MyGoalSummary {
  total: number;
  openCount: number;
  atRiskCount: number;
  achievedCount: number;
  overdueCount: number;
  dueSoonCount: number;
  averageProgress: number;
}

export interface GoalKeyResultPayload {
  _id?: string;
  title: string;
  metricType?: GoalMetricType;
  unit?: string;
  startValue?: number;
  targetValue?: number;
  currentValue?: number;
  weight?: number;
  ownerId?: string | null;
  dueDate?: string | null;
  isCompleted?: boolean;
}

export interface GoalPayload {
  title: string;
  description?: string;
  color?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  priority?: GoalPriority;
  progressMode?: GoalProgressMode;
  metricType?: GoalMetricType;
  unit?: string;
  startValue?: number;
  targetValue?: number;
  currentValue?: number;
  keyResults?: GoalKeyResultPayload[];
  ownerId?: string | null;
  memberIds?: string[];
  departmentId?: string | null;
  parentGoalId?: string | null;
  boardId?: string | null;
  tagIds?: string[];
  startDate?: string | null;
  dueDate?: string | null;
  isArchived?: boolean;
}

export interface GoalCheckInPayload {
  note?: string;
  status?: GoalStatus;
  currentValue?: number;
  keyResults?: { _id: string; currentValue?: number; isCompleted?: boolean }[];
}
