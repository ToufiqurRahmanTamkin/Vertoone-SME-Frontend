import type { StatusColor } from "@/components/shared/status-badge";
import type { ContactRef } from "./contact";
import type { ContactTypeRef } from "./contactType";
import type { EmployeeRef } from "./employee";
import type { LeadSourceRef } from "./leadSource";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "./plan";
import type { TagRef } from "./tag";

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

export const PIPELINE_ENTRY_STATUSES = ["OPEN", "WON", "LOST"] as const;

export type PipelineEntryStatus = (typeof PIPELINE_ENTRY_STATUSES)[number];

export const PIPELINE_ENTRY_STATUS_LABELS: Record<PipelineEntryStatus, string> = {
  OPEN: "Open",
  WON: "Won",
  LOST: "Lost",
};

export const PIPELINE_ENTRY_STATUS_COLORS: Record<PipelineEntryStatus, StatusColor> = {
  OPEN: "blue",
  WON: "green",
  LOST: "red",
};

export const PIPELINE_ENTRY_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type PipelineEntryPriority = (typeof PIPELINE_ENTRY_PRIORITIES)[number];

export const PIPELINE_ENTRY_PRIORITY_LABELS: Record<PipelineEntryPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const PIPELINE_ENTRY_PRIORITY_COLORS: Record<PipelineEntryPriority, StatusColor> = {
  LOW: "zinc",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

export const PIPELINE_ACTIVITY_MANUAL_TYPES = [
  "NOTE",
  "CALL",
  "EMAIL",
  "MEETING",
  "TASK",
  "WHATSAPP",
  "SMS",
  "VISIT",
  "FOLLOW_UP",
] as const;

export type PipelineActivityManualType = (typeof PIPELINE_ACTIVITY_MANUAL_TYPES)[number];

export const PIPELINE_ACTIVITY_SYSTEM_TYPES = [
  "ENTRY_CREATED",
  "STAGE_CHANGED",
  "ENTRY_WON",
  "ENTRY_LOST",
  "ENTRY_REOPENED",
  "ENTRY_UPDATED",
  "ENTRY_REMOVED",
  "OWNER_CHANGED",
  "VALUE_CHANGED",
] as const;

export const PIPELINE_ACTIVITY_TYPES = [
  ...PIPELINE_ACTIVITY_MANUAL_TYPES,
  ...PIPELINE_ACTIVITY_SYSTEM_TYPES,
] as const;

export type PipelineActivityType = (typeof PIPELINE_ACTIVITY_TYPES)[number];

export const PIPELINE_ACTIVITY_TYPE_LABELS: Record<PipelineActivityType, string> = {
  NOTE: "Note",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  TASK: "Task",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
  VISIT: "Visit",
  FOLLOW_UP: "Follow up",
  ENTRY_CREATED: "Added to pipeline",
  STAGE_CHANGED: "Moved stage",
  ENTRY_WON: "Marked won",
  ENTRY_LOST: "Marked lost",
  ENTRY_REOPENED: "Reopened",
  ENTRY_UPDATED: "Updated",
  ENTRY_REMOVED: "Removed",
  OWNER_CHANGED: "Owner changed",
  VALUE_CHANGED: "Value changed",
};

export const PIPELINE_ACTIVITY_OUTCOMES = [
  "NONE",
  "CONNECTED",
  "NO_ANSWER",
  "BUSY",
  "LEFT_VOICEMAIL",
  "INTERESTED",
  "NOT_INTERESTED",
  "RESCHEDULED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type PipelineActivityOutcome = (typeof PIPELINE_ACTIVITY_OUTCOMES)[number];

export const PIPELINE_ACTIVITY_OUTCOME_LABELS: Record<PipelineActivityOutcome, string> = {
  NONE: "No outcome",
  CONNECTED: "Connected",
  NO_ANSWER: "No answer",
  BUSY: "Busy",
  LEFT_VOICEMAIL: "Left voicemail",
  INTERESTED: "Interested",
  NOT_INTERESTED: "Not interested",
  RESCHEDULED: "Rescheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const PIPELINE_ACTIVITY_SOURCES = ["MANUAL", "SYSTEM"] as const;

export type PipelineActivitySource = (typeof PIPELINE_ACTIVITY_SOURCES)[number];

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
  entryCount: number;
  totalValue: number;
  weightedValue: number;
}

export interface PipelineWithStats extends Pipeline {
  entryCount: number;
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
  entryCount: number;
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

export interface PipelineEntry {
  _id: string;
  pipeline: PipelineRef | null;
  pipelineId: string;
  stage: PipelineStage | null;
  stageId: string;
  contact: ContactRef | null;
  contactId: string;
  title: string;
  notes: string;
  value: number;
  currency: SupportedCurrency;
  weightedValue: number;
  priority: PipelineEntryPriority;
  status: PipelineEntryStatus;
  owner: EmployeeRef | null;
  ownerId: string | null;
  leadSource: LeadSourceRef | null;
  leadSourceId: string | null;
  tags: TagRef[];
  tagIds: string[];
  position: number;
  expectedCloseDate: string | null;
  enteredStageAt: string;
  daysInStage: number;
  isRotting: boolean;
  lastActivityAt: string | null;
  nextActivityAt: string | null;
  isOverdue: boolean;
  closedAt: string | null;
  lostReason: string;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineBoardColumn {
  stage: PipelineStage;
  entries: PipelineEntry[];
  entryCount: number;
  totalValue: number;
  weightedValue: number;
}

export interface PipelineBoard {
  pipeline: PipelineWithStats;
  columns: PipelineBoardColumn[];
}

export interface PipelineBoardQuery {
  pipelineId: string;
  search?: string;
  ownerId?: string;
  priority?: PipelineEntryPriority;
  status?: PipelineEntryStatus;
  tagIds?: string;
  limitPerStage?: number;
}

export interface PipelineEntryListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  pipelineId?: string;
  stageId?: string;
  contactId?: string;
  ownerId?: string;
  status?: PipelineEntryStatus;
  priority?: PipelineEntryPriority;
  tagIds?: string;
}

export interface PipelineEntrySummary {
  total: number;
  openCount: number;
  wonCount: number;
  lostCount: number;
  openValue: number;
  wonValue: number;
  weightedValue: number;
  overdueCount: number;
  rottingCount: number;
}

export interface PipelineEntryPayload {
  pipelineId: string;
  stageId?: string;
  contactId: string;
  title?: string;
  notes?: string;
  value?: number;
  currency?: SupportedCurrency;
  priority?: PipelineEntryPriority;
  ownerId?: string | null;
  leadSourceId?: string | null;
  tagIds?: string[];
  expectedCloseDate?: string | null;
  nextActivityAt?: string | null;
}

export interface PipelineEntryUpdatePayload {
  title?: string;
  notes?: string;
  value?: number;
  currency?: SupportedCurrency;
  priority?: PipelineEntryPriority;
  ownerId?: string | null;
  leadSourceId?: string | null;
  tagIds?: string[];
  expectedCloseDate?: string | null;
  nextActivityAt?: string | null;
  lostReason?: string;
}

export interface PipelineEntryMovePayload {
  stageId: string;
  position?: number;
  lostReason?: string;
}

export interface PipelineEntryReorderPayload {
  stageId: string;
  entryIds: string[];
}

export interface PipelineStageSnapshot {
  stageId: string | null;
  name: string;
  color: string;
}

export interface PipelineActivity {
  _id: string;
  pipeline: PipelineRef | null;
  pipelineId: string;
  entryId: string | null;
  contact: ContactRef | null;
  contactId: string | null;
  type: PipelineActivityType;
  source: PipelineActivitySource;
  subject: string;
  body: string;
  location: string;
  occurredAt: string;
  durationMinutes: number;
  endsAt: string | null;
  dueAt: string | null;
  completedAt: string | null;
  isCompleted: boolean;
  isOverdue: boolean;
  outcome: PipelineActivityOutcome;
  fromStage: PipelineStageSnapshot | null;
  toStage: PipelineStageSnapshot | null;
  performedBy: EmployeeRef | null;
  performedById: string | null;
  actorName: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineActivityListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  pipelineId?: string;
  entryId?: string;
  contactId?: string;
  type?: PipelineActivityType;
  source?: PipelineActivitySource;
  performedById?: string;
  isCompleted?: boolean;
  from?: string;
  to?: string;
}

export interface PipelineActivitySummary {
  total: number;
  manualCount: number;
  systemCount: number;
  scheduledCount: number;
  overdueCount: number;
  completedCount: number;
  todayCount: number;
  byType: { type: PipelineActivityType; count: number }[];
}

export interface PipelineActivityPayload {
  pipelineId: string;
  entryId?: string | null;
  contactId?: string | null;
  type: PipelineActivityManualType;
  subject: string;
  body?: string;
  location?: string;
  occurredAt?: string;
  durationMinutes?: number;
  dueAt?: string | null;
  isCompleted?: boolean;
  outcome?: PipelineActivityOutcome;
  performedById?: string | null;
  isPinned?: boolean;
}

export type PipelineActivityUpdatePayload = Partial<Omit<PipelineActivityPayload, "pipelineId">>;
