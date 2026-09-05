import type { StatusColor } from "@/components/shared/status-badge";
import type { ContactRef } from "./contact";
import type { ContactTypeRef } from "./contactType";
import type { EmployeeRef } from "./employee";
import type { LeadSourceRef } from "./leadSource";
import type { TagRef } from "./tag";

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal sent",
  NEGOTIATION: "Negotiating",
  WON: "Won",
  LOST: "Lost",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, StatusColor> = {
  NEW: "blue",
  CONTACTED: "blue",
  QUALIFIED: "violet",
  PROPOSAL: "amber",
  NEGOTIATION: "orange",
  WON: "green",
  LOST: "red",
};

export const LEAD_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const LEAD_PRIORITY_COLORS: Record<LeadPriority, StatusColor> = {
  LOW: "zinc",
  MEDIUM: "blue",
  HIGH: "amber",
  URGENT: "red",
};

export interface LeadAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface LeadRef {
  _id: string;
  code: string;
  title: string;
}

export interface Lead extends LeadRef {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  companyName: string;
  website: string;
  leadSource: LeadSourceRef | null;
  leadSourceId: string | null;
  contactType: ContactTypeRef | null;
  contactTypeId: string | null;
  contact: ContactRef | null;
  contactId: string | null;
  owner: EmployeeRef | null;
  ownerId: string | null;
  tags: TagRef[];
  tagIds: string[];
  address: LeadAddress;
  status: LeadStatus;
  priority: LeadPriority;
  estimatedValue: number;
  expectedCloseDate: string | null;
  lastContactedAt: string | null;
  lostReason: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  status?: LeadStatus;
  priority?: LeadPriority;
  leadSourceId?: string;
  contactTypeId?: string;
  ownerId?: string;
  tagIds?: string;
}

export interface LeadSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  openCount: number;
  wonCount: number;
  lostCount: number;
  pipelineValue: number;
  wonValue: number;
  byStatus: Record<LeadStatus, number>;
}

export interface LeadPayload {
  title: string;
  code?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  companyName?: string;
  website?: string;
  leadSourceId?: string | null;
  contactTypeId?: string | null;
  contactId?: string | null;
  ownerId?: string | null;
  tagIds?: string[];
  address?: Partial<LeadAddress>;
  status?: LeadStatus;
  priority?: LeadPriority;
  estimatedValue?: number;
  expectedCloseDate?: string | null;
  lastContactedAt?: string | null;
  lostReason?: string;
  notes?: string;
  isActive?: boolean;
}

export interface LeadOptionQuery {
  search?: string;
  status?: LeadStatus;
}

export interface ConvertLeadPayload {
  contactTypeId?: string | null;
  ownerId?: string | null;
  keepLead?: boolean;
  createDeal?: boolean;
  pipelineId?: string | null;
  stageId?: string | null;
  dealTitle?: string;
  dealValue?: number;
  expectedCloseDate?: string | null;
}

export interface ConvertLeadResult {
  lead: Lead;
  contactId: string;
  dealId: string | null;
}
