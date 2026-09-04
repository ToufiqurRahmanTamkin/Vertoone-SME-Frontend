import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";
import type { AudienceRef, AudienceType } from "./policy";

export const ANNOUNCEMENT_TYPES = [
  "GENERAL",
  "POLICY",
  "EVENT",
  "HOLIDAY",
  "CELEBRATION",
  "SYSTEM",
  "URGENT",
] as const;
export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number];

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  GENERAL: "General",
  POLICY: "Policy",
  EVENT: "Event",
  HOLIDAY: "Holiday",
  CELEBRATION: "Celebration",
  SYSTEM: "System",
  URGENT: "Urgent",
};

export const ANNOUNCEMENT_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];

export const ANNOUNCEMENT_PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const ANNOUNCEMENT_PRIORITY_COLORS: Record<AnnouncementPriority, StatusColor> = {
  LOW: "zinc",
  NORMAL: "blue",
  HIGH: "amber",
  URGENT: "red",
};

export const ANNOUNCEMENT_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const;
export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUSES)[number];

export const ANNOUNCEMENT_STATUS_LABELS: Record<AnnouncementStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const ANNOUNCEMENT_STATUS_COLORS: Record<AnnouncementStatus, StatusColor> = {
  DRAFT: "amber",
  SCHEDULED: "blue",
  PUBLISHED: "green",
  ARCHIVED: "zinc",
};

export interface AnnouncementAttachment {
  url: string;
  publicId: string;
  fileName: string;
  extension: string;
  fileSize: number;
}

export interface Announcement {
  _id: string;
  title: string;
  summary: string;
  body: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  coverImageUrl: string;
  attachments: AnnouncementAttachment[];
  isPinned: boolean;
  audience: AudienceType;
  audienceLabel: string;
  departmentIds: string[];
  designationIds: string[];
  employeeIds: string[];
  userIds: string[];
  departments: AudienceRef[];
  designations: AudienceRef[];
  publishAt: string | null;
  expiresAt: string | null;
  publishedAt: string | null;
  isLive: boolean;
  isExpired: boolean;
  author: EmployeeRef | null;
  authorEmployeeId: string | null;
  viewCount: number;
  readCount: number;
  audienceCount: number;
  readRate: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: AnnouncementStatus;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  pinnedOnly?: boolean;
  unreadOnly?: boolean;
}

export interface AnnouncementSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  publishedCount: number;
  draftCount: number;
  scheduledCount: number;
  archivedCount: number;
  pinnedCount: number;
  expiringSoonCount: number;
  unreadForMe: number;
  averageReadRate: number;
}

export interface AnnouncementPayload {
  title: string;
  summary?: string;
  body: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  status?: AnnouncementStatus;
  coverImageUrl?: string;
  attachments?: AnnouncementAttachment[];
  isPinned?: boolean;
  audience?: AudienceType;
  departmentIds?: string[];
  designationIds?: string[];
  employeeIds?: string[];
  userIds?: string[];
  publishAt?: string | null;
  expiresAt?: string | null;
  authorEmployeeId?: string | null;
}

export interface AnnouncementReader {
  _id: string;
  name: string;
  detail: string;
  readAt: string;
}

export interface AnnouncementOverview {
  summary: AnnouncementSummary;
  byType: { type: AnnouncementType; count: number }[];
  pinned: Announcement[];
  latest: Announcement[];
  unreadForMe: Announcement[];
}
