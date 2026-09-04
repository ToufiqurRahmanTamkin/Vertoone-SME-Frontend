import type { StatusColor } from "@/components/shared/status-badge";
import type { Goal } from "./goal";
import type { Note } from "./note";
import type { TaskBoard } from "./task";

export const SHARE_RESOURCE_TYPES = ["GOAL", "NOTE", "TASK_BOARD"] as const;

export type ShareResourceType = (typeof SHARE_RESOURCE_TYPES)[number];

export const SHARE_RESOURCE_LABELS: Record<ShareResourceType, string> = {
  GOAL: "Goal",
  NOTE: "Note",
  TASK_BOARD: "Board",
};

export const SHARE_STATUSES = ["PENDING", "ACCEPTED", "DECLINED", "REVOKED"] as const;

export type ShareStatus = (typeof SHARE_STATUSES)[number];

export const SHARE_STATUS_LABELS: Record<ShareStatus, string> = {
  PENDING: "Waiting to be accepted",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  REVOKED: "Withdrawn",
};

export const SHARE_STATUS_COLORS: Record<ShareStatus, StatusColor> = {
  PENDING: "amber",
  ACCEPTED: "green",
  DECLINED: "red",
  REVOKED: "zinc",
};

export const SHARE_CAPABILITIES = [
  "canView",
  "canEdit",
  "canComment",
  "canViewAllCards",
  "canCreateCards",
  "canEditCards",
  "canDeleteCards",
  "canMoveCards",
  "canManageLists",
] as const;

export type ShareCapability = (typeof SHARE_CAPABILITIES)[number];

export type SharePermissions = Record<ShareCapability, boolean>;

export interface ShareCapabilityOption {
  key: ShareCapability;
  label: string;
  description: string;
}

/** What the person sharing can hand out, per kind of record. */
export const SHARE_CAPABILITY_OPTIONS: Record<ShareResourceType, ShareCapabilityOption[]> = {
  GOAL: [
    { key: "canEdit", label: "Edit the goal", description: "Change targets, key results and dates" },
    { key: "canComment", label: "Record check-ins", description: "Log progress against the goal" },
  ],
  NOTE: [
    { key: "canEdit", label: "Edit the note", description: "Change the title and the body" },
  ],
  TASK_BOARD: [
    {
      key: "canViewAllCards",
      label: "See every card",
      description: "Otherwise only cards assigned to them show up",
    },
    { key: "canCreateCards", label: "Add cards", description: "Create new cards on the board" },
    { key: "canEditCards", label: "Edit cards", description: "Change cards they can see" },
    { key: "canMoveCards", label: "Move cards", description: "Drag cards between lists" },
    { key: "canDeleteCards", label: "Delete cards", description: "Remove cards from the board" },
    { key: "canComment", label: "Comment", description: "Post comments on cards" },
    {
      key: "canManageLists",
      label: "Manage the board",
      description: "Rename it and change its lists and labels",
    },
  ],
};

export const emptySharePermissions = (): SharePermissions =>
  SHARE_CAPABILITIES.reduce((permissions, capability) => {
    permissions[capability] = false;
    return permissions;
  }, {} as SharePermissions);

export interface ResourceShare {
  _id: string;
  resourceType: ShareResourceType;
  resourceId: string;
  resourceTitle: string;
  resourceColor: string;
  sharedById: string | null;
  sharedByName: string;
  sharedByEmail: string;
  recipientUserId: string | null;
  recipientEmployeeId: string | null;
  recipientEmail: string;
  recipientName: string;
  status: ShareStatus;
  permissions: SharePermissions;
  message: string;
  invitedAt: string;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SharedGoal {
  share: ResourceShare;
  goal: Goal;
}

export interface SharedNote {
  share: ResourceShare;
  note: Note;
}

export interface SharedBoard {
  share: ResourceShare;
  board: TaskBoard;
}

export interface ShareResourcePayload {
  resourceType: ShareResourceType;
  resourceId: string;
  email: string;
  message?: string;
  permissions?: Partial<SharePermissions>;
}

export interface ShareListQuery {
  page?: number;
  limit?: number;
  search?: string;
  resourceType?: ShareResourceType;
  resourceId?: string;
  status?: ShareStatus;
}

export interface SharedWithMeQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ShareSummary {
  pendingCount: number;
  acceptedCount: number;
  sharedByMeCount: number;
  goalCount: number;
  noteCount: number;
  boardCount: number;
}

export interface ShareTargetOption {
  userId: string;
  employeeId: string | null;
  name: string;
  email: string;
  role: string;
}
