import type { StatusColor } from "@/components/shared/status-badge";
import type { ContactRef } from "./contact";
import type { DealRef } from "./deal";
import type { EmployeeRef } from "./employee";
import type { LeadRef } from "./lead";
import type { PipelineRef } from "./pipeline";

export const CRM_ACTIVITY_RELATED_TYPES = ["DEAL", "LEAD", "CONTACT"] as const;

export type CrmActivityRelatedType = (typeof CRM_ACTIVITY_RELATED_TYPES)[number];

export const CRM_ACTIVITY_RELATED_LABELS: Record<CrmActivityRelatedType, string> = {
  DEAL: "Deal",
  LEAD: "Lead",
  CONTACT: "Contact",
};

export const CRM_ACTIVITY_RELATED_COLORS: Record<CrmActivityRelatedType, StatusColor> = {
  DEAL: "blue",
  LEAD: "amber",
  CONTACT: "violet",
};

export const CRM_ACTIVITY_MANUAL_TYPES = [
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

export type CrmActivityManualType = (typeof CRM_ACTIVITY_MANUAL_TYPES)[number];

export const CRM_ACTIVITY_SYSTEM_TYPES = [
  "DEAL_CREATED",
  "STAGE_CHANGED",
  "DEAL_WON",
  "DEAL_LOST",
  "DEAL_REOPENED",
  "DEAL_UPDATED",
  "DEAL_REMOVED",
  "OWNER_CHANGED",
  "VALUE_CHANGED",
  "LEAD_CREATED",
  "LEAD_STATUS_CHANGED",
  "LEAD_CONVERTED",
] as const;

export const CRM_ACTIVITY_TYPES = [
  ...CRM_ACTIVITY_MANUAL_TYPES,
  ...CRM_ACTIVITY_SYSTEM_TYPES,
] as const;

export type CrmActivityType = (typeof CRM_ACTIVITY_TYPES)[number];

export const CRM_ACTIVITY_TYPE_LABELS: Record<CrmActivityType, string> = {
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
  LEAD_CREATED: "Lead captured",
  LEAD_STATUS_CHANGED: "Lead status changed",
  LEAD_CONVERTED: "Lead converted",
};

export const CRM_ACTIVITY_CATEGORIES = [
  "TASK",
  "CALL",
  "MEETING",
  "NOTE",
  "MESSAGE",
] as const;

export type CrmActivityCategory = (typeof CRM_ACTIVITY_CATEGORIES)[number];

export const CRM_ACTIVITY_CATEGORY_LABELS: Record<CrmActivityCategory, string> = {
  TASK: "Tasks",
  CALL: "Calls",
  MEETING: "Meetings",
  NOTE: "Notes",
  MESSAGE: "Messages",
};

export const CRM_ACTIVITY_TYPES_BY_CATEGORY: Record<
  CrmActivityCategory,
  readonly CrmActivityManualType[]
> = {
  TASK: ["TASK", "FOLLOW_UP"],
  CALL: ["CALL"],
  MEETING: ["MEETING", "DEMO", "VISIT"],
  NOTE: ["NOTE"],
  MESSAGE: ["EMAIL", "WHATSAPP", "SMS", "PROPOSAL_SENT"],
};

export const CRM_ACTIVITY_OUTCOMES = [
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

export type CrmActivityOutcome = (typeof CRM_ACTIVITY_OUTCOMES)[number];

export const CRM_ACTIVITY_OUTCOME_LABELS: Record<CrmActivityOutcome, string> = {
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

export const CRM_ACTIVITY_SOURCES = ["MANUAL", "SYSTEM"] as const;

export type CrmActivitySource = (typeof CRM_ACTIVITY_SOURCES)[number];

export interface CrmStageSnapshot {
  stageId: string | null;
  name: string;
  color: string;
}

export interface CrmActivity {
  _id: string;
  relatedType: CrmActivityRelatedType;
  relatedLabel: string;
  deal: DealRef | null;
  dealId: string | null;
  lead: LeadRef | null;
  leadId: string | null;
  contact: ContactRef | null;
  contactId: string | null;
  pipeline: PipelineRef | null;
  pipelineId: string | null;
  type: CrmActivityType;
  category: CrmActivityCategory | null;
  source: CrmActivitySource;
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
  isDueToday: boolean;
  outcome: CrmActivityOutcome;
  fromStage: CrmStageSnapshot | null;
  toStage: CrmStageSnapshot | null;
  performedBy: EmployeeRef | null;
  performedById: string | null;
  actorName: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmActivityListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  relatedType?: CrmActivityRelatedType;
  dealId?: string;
  leadId?: string;
  contactId?: string;
  pipelineId?: string;
  category?: CrmActivityCategory;
  type?: CrmActivityType;
  source?: CrmActivitySource;
  performedById?: string;
  isCompleted?: boolean;
  isPinned?: boolean;
  isOverdue?: boolean;
  dueFrom?: string;
  dueTo?: string;
  occurredFrom?: string;
  occurredTo?: string;
}

export interface CrmActivitySummary {
  total: number;
  openCount: number;
  overdueCount: number;
  completedCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
  loggedThisWeekCount: number;
  unassignedCount: number;
}

export interface CrmActivityCategoryRow {
  category: CrmActivityCategory;
  total: number;
  openCount: number;
  overdueCount: number;
}

export interface CrmActivityOwnerRow {
  performedById: string | null;
  name: string;
  total: number;
  openCount: number;
  overdueCount: number;
}

export interface CrmActivityOverview {
  summary: CrmActivitySummary;
  byCategory: CrmActivityCategoryRow[];
  byOwner: CrmActivityOwnerRow[];
  upcoming: CrmActivity[];
  overdue: CrmActivity[];
  recent: CrmActivity[];
}

export interface CrmActivityPayload {
  dealId?: string | null;
  leadId?: string | null;
  contactId?: string | null;
  type: CrmActivityManualType;
  subject: string;
  body?: string;
  location?: string;
  occurredAt?: string;
  durationMinutes?: number;
  dueAt?: string | null;
  isCompleted?: boolean;
  outcome?: CrmActivityOutcome;
  performedById?: string | null;
  isPinned?: boolean;
}

export type CrmActivityUpdatePayload = Partial<
  Omit<CrmActivityPayload, "dealId" | "leadId" | "contactId">
>;
