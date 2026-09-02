import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";
import type { TagRef } from "./tag";
import type { TaskBoardRef } from "./task";

export const NOTE_VISIBILITIES = ["COMPANY", "SHARED", "PRIVATE"] as const;

export type NoteVisibility = (typeof NOTE_VISIBILITIES)[number];

export const NOTE_VISIBILITY_LABELS: Record<NoteVisibility, string> = {
  COMPANY: "Everyone in the company",
  SHARED: "Only the people I pick",
  PRIVATE: "Only me",
};

export const NOTE_VISIBILITY_SHORT_LABELS: Record<NoteVisibility, string> = {
  COMPANY: "Company",
  SHARED: "Shared",
  PRIVATE: "Private",
};

export const NOTE_VISIBILITY_COLORS: Record<NoteVisibility, StatusColor> = {
  COMPANY: "blue",
  SHARED: "violet",
  PRIVATE: "zinc",
};

export const DEFAULT_NOTE_COLOR = "#f59e0b";

export const NOTE_COLOR_SWATCHES = [
  "#f59e0b",
  "#16a34a",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
  "#dc2626",
  "#64748b",
] as const;

export const MAX_NOTE_SHARES = 50;

export const MAX_NOTE_TAGS = 20;

export const MAX_NOTE_CONTENT = 20000;

export interface NoteRef {
  _id: string;
  title: string;
  color: string;
}

export interface Note extends NoteRef {
  content: string;
  excerpt: string;
  wordCount: number;
  visibility: NoteVisibility;
  owner: EmployeeRef | null;
  ownerId: string | null;
  sharedWith: EmployeeRef[];
  sharedWithIds: string[];
  tags: TagRef[];
  tagIds: string[];
  board: TaskBoardRef | null;
  boardId: string | null;
  isPinned: boolean;
  pinnedAt: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  reminderAt: string | null;
  isReminderDue: boolean;
  isReminderSoon: boolean;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  visibility?: NoteVisibility;
  ownerId?: string;
  boardId?: string;
  tagIds?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  hasReminder?: boolean;
}

export interface NoteSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  archivedCount: number;
  pinnedCount: number;
  privateCount: number;
  sharedCount: number;
  reminderDueCount: number;
}

export interface NotePayload {
  title: string;
  content?: string;
  color?: string;
  visibility?: NoteVisibility;
  ownerId?: string | null;
  sharedWithIds?: string[];
  tagIds?: string[];
  boardId?: string | null;
  isPinned?: boolean;
  isArchived?: boolean;
  reminderAt?: string | null;
}
