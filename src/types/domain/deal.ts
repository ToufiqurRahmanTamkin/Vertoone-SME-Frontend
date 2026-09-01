import type { StatusColor } from "@/components/shared/status-badge";
import type { ContactRef } from "./contact";
import type { EmployeeRef } from "./employee";
import type { LeadRef } from "./lead";
import type { LeadSourceRef } from "./leadSource";
import type { PipelineRef, PipelineStage } from "./pipeline";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "./plan";
import type { TagRef } from "./tag";

export { SUPPORTED_CURRENCIES, type SupportedCurrency };

export const DEAL_STATUSES = ["OPEN", "WON", "LOST"] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  OPEN: "Open",
  WON: "Won",
  LOST: "Lost",
};

export const DEAL_STATUS_COLORS: Record<DealStatus, StatusColor> = {
  OPEN: "blue",
  WON: "green",
  LOST: "red",
};

export const DEAL_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type DealPriority = (typeof DEAL_PRIORITIES)[number];

export const DEAL_PRIORITY_LABELS: Record<DealPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const DEAL_PRIORITY_COLORS: Record<DealPriority, StatusColor> = {
  LOW: "zinc",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

export const DEAL_ACTIVITY_MANUAL_TYPES = [
  "NOTE",
  "CALL",
  "EMAIL",
  "MEETING",
  "TASK",
  "WHATSAPP",
  "SMS",
  "VISIT",
  "DEMO",
  "PROPOSAL_SENT",
  "FOLLOW_UP",
] as const;

export type DealActivityManualType = (typeof DEAL_ACTIVITY_MANUAL_TYPES)[number];

export const DEAL_ACTIVITY_SYSTEM_TYPES = [
  "DEAL_CREATED",
  "STAGE_CHANGED",
  "DEAL_WON",
  "DEAL_LOST",
  "DEAL_REOPENED",
  "DEAL_UPDATED",
  "DEAL_REMOVED",
  "OWNER_CHANGED",
  "VALUE_CHANGED",
] as const;

export const DEAL_ACTIVITY_TYPES = [
  ...DEAL_ACTIVITY_MANUAL_TYPES,
  ...DEAL_ACTIVITY_SYSTEM_TYPES,
] as const;

export type DealActivityType = (typeof DEAL_ACTIVITY_TYPES)[number];

export const DEAL_ACTIVITY_TYPE_LABELS: Record<DealActivityType, string> = {
  NOTE: "Note",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  TASK: "Task",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
  VISIT: "Visit",
  DEMO: "Demo",
  PROPOSAL_SENT: "Proposal sent",
  FOLLOW_UP: "Follow up",
  DEAL_CREATED: "Deal opened",
  STAGE_CHANGED: "Moved stage",
  DEAL_WON: "Marked won",
  DEAL_LOST: "Marked lost",
  DEAL_REOPENED: "Reopened",
  DEAL_UPDATED: "Updated",
  DEAL_REMOVED: "Removed",
  OWNER_CHANGED: "Owner changed",
  VALUE_CHANGED: "Value changed",
};

export const DEAL_ACTIVITY_OUTCOMES = [
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

export type DealActivityOutcome = (typeof DEAL_ACTIVITY_OUTCOMES)[number];

export const DEAL_ACTIVITY_OUTCOME_LABELS: Record<DealActivityOutcome, string> = {
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

export const DEAL_ACTIVITY_SOURCES = ["MANUAL", "SYSTEM"] as const;

export type DealActivitySource = (typeof DEAL_ACTIVITY_SOURCES)[number];

export interface DealRef {
  _id: string;
  code: string;
  title: string;
}

export interface Deal extends DealRef {
  description: string;
  pipeline: PipelineRef | null;
  pipelineId: string;
  stage: PipelineStage | null;
  stageId: string;
  contact: ContactRef | null;
  contactId: string | null;
  lead: LeadRef | null;
  leadId: string | null;
  value: number;
  currency: SupportedCurrency;
  probability: number;
  isProbabilityOverridden: boolean;
  weightedValue: number;
  priority: DealPriority;
  status: DealStatus;
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
  daysToClose: number | null;
  isRotting: boolean;
  isStale: boolean;
  lastActivityAt: string | null;
  nextActivityAt: string | null;
  isOverdue: boolean;
  closedAt: string | null;
  lostReason: string;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DealBoardColumn {
  stage: PipelineStage;
  deals: Deal[];
  dealCount: number;
  totalValue: number;
  weightedValue: number;
}

export interface DealBoardPipeline extends PipelineRef {
  currency: SupportedCurrency;
  stageCount: number;
}

export interface DealBoard {
  pipeline: DealBoardPipeline;
  columns: DealBoardColumn[];
}

export interface DealBoardQuery {
  pipelineId: string;
  search?: string;
  ownerId?: string;
  contactId?: string;
  priority?: DealPriority;
  status?: DealStatus;
  tagIds?: string;
  limitPerStage?: number;
}

export interface DealListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  pipelineId?: string;
  stageId?: string;
  contactId?: string;
  leadId?: string;
  ownerId?: string;
  leadSourceId?: string;
  status?: DealStatus;
  priority?: DealPriority;
  tagIds?: string;
  closingBefore?: string;
}

export interface DealOptionQuery {
  search?: string;
  pipelineId?: string;
  status?: DealStatus;
}

export interface DealSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  total: number;
  openCount: number;
  wonCount: number;
  lostCount: number;
  openValue: number;
  wonValue: number;
  lostValue: number;
  weightedValue: number;
  overdueCount: number;
  rottingCount: number;
  winRate: number;
  averageDealSize: number;
}

export interface DealPayload {
  title: string;
  description?: string;
  pipelineId: string;
  stageId?: string;
  contactId?: string | null;
  leadId?: string | null;
  value?: number;
  currency?: SupportedCurrency;
  probability?: number | null;
  priority?: DealPriority;
  ownerId?: string | null;
  leadSourceId?: string | null;
  tagIds?: string[];
  expectedCloseDate?: string | null;
  nextActivityAt?: string | null;
}

export type DealUpdatePayload = Partial<Omit<DealPayload, "pipelineId" | "stageId">> & {
  lostReason?: string;
};

export interface DealMovePayload {
  stageId: string;
  position?: number;
  lostReason?: string;
}

export interface DealReorderPayload {
  stageId: string;
  dealIds: string[];
}

export interface DealStageSnapshot {
  stageId: string | null;
  name: string;
  color: string;
}

export interface DealActivity {
  _id: string;
  deal: DealRef | null;
  dealId: string;
  pipelineId: string | null;
  contact: ContactRef | null;
  contactId: string | null;
  type: DealActivityType;
  source: DealActivitySource;
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
  outcome: DealActivityOutcome;
  fromStage: DealStageSnapshot | null;
  toStage: DealStageSnapshot | null;
  performedBy: EmployeeRef | null;
  performedById: string | null;
  actorName: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DealActivityListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  dealId?: string;
  contactId?: string;
  type?: DealActivityType;
  source?: DealActivitySource;
  performedById?: string;
  isCompleted?: boolean;
  isPinned?: boolean;
}

export interface DealActivitySummary {
  total: number;
  openCount: number;
  overdueCount: number;
  completedCount: number;
  dueTodayCount: number;
}

export interface DealActivityPayload {
  dealId: string;
  type: DealActivityManualType;
  subject: string;
  body?: string;
  location?: string;
  occurredAt?: string;
  durationMinutes?: number;
  dueAt?: string | null;
  isCompleted?: boolean;
  outcome?: DealActivityOutcome;
  performedById?: string | null;
  isPinned?: boolean;
}

export type DealActivityUpdatePayload = Partial<Omit<DealActivityPayload, "dealId">>;
