import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";

export const DEFAULT_TASK_BOARD_COLOR = "#0ea5e9";

export const DEFAULT_TASK_LIST_COLOR = "#64748b";

export const MAX_TASK_LISTS = 30;

export const MAX_TASK_LABELS = 30;

export const MAX_TASK_ASSIGNEES = 20;

export const MAX_TASK_CHECKLISTS = 20;

export const MAX_TASK_CHECKLIST_ITEMS = 100;

export const TASK_BOARD_VISIBILITIES = ["COMPANY", "PRIVATE"] as const;

export type TaskBoardVisibility = (typeof TASK_BOARD_VISIBILITIES)[number];

export const TASK_BOARD_VISIBILITY_LABELS: Record<TaskBoardVisibility, string> = {
  COMPANY: "Everyone in the company",
  PRIVATE: "Only board members",
};

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, StatusColor> = {
  LOW: "zinc",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

export const TASK_PRIORITY_BARS: Record<TaskPriority, string> = {
  LOW: "bg-zinc-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export const TASK_ASSIGNEE_KINDS = ["EMPLOYEE", "USER", "LEAD", "CONTACT"] as const;

export type TaskAssigneeKind = (typeof TASK_ASSIGNEE_KINDS)[number];

export const TASK_ASSIGNEE_KIND_LABELS: Record<TaskAssigneeKind, string> = {
  EMPLOYEE: "Employee",
  USER: "User",
  LEAD: "Lead",
  CONTACT: "Contact",
};

export const TASK_ASSIGNEE_KIND_COLORS: Record<TaskAssigneeKind, StatusColor> = {
  EMPLOYEE: "blue",
  USER: "violet",
  LEAD: "amber",
  CONTACT: "green",
};

export const TASK_ACTIVITY_TYPES = [
  "COMMENT",
  "TASK_CREATED",
  "TASK_MOVED",
  "TASK_UPDATED",
  "TASK_COMPLETED",
  "TASK_REOPENED",
  "TASK_ARCHIVED",
  "TASK_RESTORED",
  "TASK_REMOVED",
  "ASSIGNEES_CHANGED",
  "DUE_DATE_CHANGED",
  "CHECKLIST_CHANGED",
  "ATTACHMENT_CHANGED",
] as const;

export type TaskActivityType = (typeof TASK_ACTIVITY_TYPES)[number];

export const TASK_ACTIVITY_TYPE_LABELS: Record<TaskActivityType, string> = {
  COMMENT: "Comment",
  TASK_CREATED: "Created",
  TASK_MOVED: "Moved",
  TASK_UPDATED: "Updated",
  TASK_COMPLETED: "Completed",
  TASK_REOPENED: "Reopened",
  TASK_ARCHIVED: "Archived",
  TASK_RESTORED: "Restored",
  TASK_REMOVED: "Removed",
  ASSIGNEES_CHANGED: "Assignees changed",
  DUE_DATE_CHANGED: "Due date changed",
  CHECKLIST_CHANGED: "Checklist updated",
  ATTACHMENT_CHANGED: "Attachments updated",
};

export const TASK_ACTIVITY_SOURCES = ["MANUAL", "SYSTEM"] as const;

export type TaskActivitySource = (typeof TASK_ACTIVITY_SOURCES)[number];

export interface TaskList {
  _id: string;
  name: string;
  color: string;
  order: number;
  wipLimit: number;
  isDoneList: boolean;
  isArchived: boolean;
}

export interface TaskLabel {
  _id: string;
  name: string;
  color: string;
}

export interface TaskBoardRef {
  _id: string;
  name: string;
  color: string;
}

export interface TaskBoard extends TaskBoardRef {
  description: string;
  visibility: TaskBoardVisibility;
  lists: TaskList[];
  labels: TaskLabel[];
  members: EmployeeRef[];
  memberIds: string[];
  owner: EmployeeRef | null;
  ownerId: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListStats {
  listId: string;
  taskCount: number;
  openCount: number;
  completedCount: number;
  overdueCount: number;
}

export interface TaskBoardWithStats extends TaskBoard {
  taskCount: number;
  openCount: number;
  completedCount: number;
  overdueCount: number;
  listStats: TaskListStats[];
}

export interface TaskBoardListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  visibility?: TaskBoardVisibility;
  memberId?: string;
  ownerId?: string;
  isArchived?: boolean;
}

export interface TaskBoardSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  archivedCount: number;
  taskCount: number;
  openCount: number;
  overdueCount: number;
}

export interface TaskListPayload {
  _id?: string;
  name: string;
  color?: string;
  wipLimit?: number;
  isDoneList?: boolean;
  isArchived?: boolean;
}

export interface TaskLabelPayload {
  _id?: string;
  name: string;
  color?: string;
}

export interface TaskBoardPayload {
  name: string;
  description?: string;
  color?: string;
  visibility?: TaskBoardVisibility;
  lists?: TaskListPayload[];
  labels?: TaskLabelPayload[];
  memberIds?: string[];
  ownerId?: string | null;
  isArchived?: boolean;
}

export interface TaskAssignee {
  kind: TaskAssigneeKind;
  refId: string;
  name: string;
  subtitle: string;
  initials: string;
}

export interface TaskAssigneeOption {
  kind: TaskAssigneeKind;
  refId: string;
  name: string;
  subtitle: string;
}

export interface TaskAssigneeOptionQuery {
  search?: string;
  kind?: TaskAssigneeKind;
}

export interface TaskChecklistItem {
  _id: string;
  title: string;
  isChecked: boolean;
  order: number;
  dueAt: string | null;
}

export interface TaskChecklist {
  _id: string;
  title: string;
  order: number;
  items: TaskChecklistItem[];
  itemCount: number;
  checkedCount: number;
  progress: number;
}

export interface TaskAttachment {
  _id: string;
  name: string;
  url: string;
  publicId: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface TaskRef {
  _id: string;
  code: string;
  title: string;
}

export interface Task extends TaskRef {
  board: TaskBoardRef | null;
  boardId: string;
  list: TaskList | null;
  listId: string;
  description: string;
  position: number;
  priority: TaskPriority;
  labels: TaskLabel[];
  labelIds: string[];
  assignees: TaskAssignee[];
  checklists: TaskChecklist[];
  checklistItemCount: number;
  checklistCheckedCount: number;
  attachments: TaskAttachment[];
  attachmentCount: number;
  coverColor: string;
  startDate: string | null;
  dueAt: string | null;
  reminderAt: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  isOverdue: boolean;
  isDueSoon: boolean;
  isArchived: boolean;
  archivedAt: string | null;
  enteredListAt: string;
  daysInList: number;
  lastActivityAt: string | null;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskBoardColumn {
  list: TaskList;
  tasks: Task[];
  taskCount: number;
  completedCount: number;
  isOverWipLimit: boolean;
}

export interface TaskBoardViewBoard extends TaskBoardRef {
  description: string;
  labels: TaskLabel[];
  memberIds: string[];
  isArchived: boolean;
}

export interface TaskBoardView {
  board: TaskBoardViewBoard;
  columns: TaskBoardColumn[];
}

export interface TaskBoardViewQuery {
  boardId: string;
  search?: string;
  assigneeKind?: TaskAssigneeKind;
  assigneeId?: string;
  priority?: TaskPriority;
  labelId?: string;
  isCompleted?: boolean;
  includeArchived?: boolean;
  dueBefore?: string;
  limitPerList?: number;
}

export interface TaskListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  boardId?: string;
  listId?: string;
  assigneeKind?: TaskAssigneeKind;
  assigneeId?: string;
  priority?: TaskPriority;
  labelId?: string;
  isCompleted?: boolean;
  isArchived?: boolean;
  dueBefore?: string;
  dueAfter?: string;
}

export interface TaskSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  total: number;
  openCount: number;
  completedCount: number;
  overdueCount: number;
  dueTodayCount: number;
  unassignedCount: number;
  archivedCount: number;
  completionRate: number;
}

export interface MyTaskSummary {
  total: number;
  openCount: number;
  completedCount: number;
  overdueCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
  completionRate: number;
}

export interface TaskAssigneePayload {
  kind: TaskAssigneeKind;
  refId: string;
}

export interface TaskChecklistItemPayload {
  _id?: string;
  title: string;
  isChecked?: boolean;
  dueAt?: string | null;
}

export interface TaskChecklistPayload {
  _id?: string;
  title: string;
  items?: TaskChecklistItemPayload[];
}

export interface TaskAttachmentPayload {
  _id?: string;
  name: string;
  url: string;
  publicId?: string;
  mimeType?: string;
  size?: number;
}

export interface TaskPayload {
  boardId: string;
  listId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  labelIds?: string[];
  assignees?: TaskAssigneePayload[];
  checklists?: TaskChecklistPayload[];
  attachments?: TaskAttachmentPayload[];
  coverColor?: string;
  startDate?: string | null;
  dueAt?: string | null;
  reminderAt?: string | null;
  isCompleted?: boolean;
}

export type TaskUpdatePayload = Partial<Omit<TaskPayload, "boardId" | "listId">> & {
  isArchived?: boolean;
};

export interface TaskMovePayload {
  listId: string;
  position?: number;
}

export interface TaskReorderPayload {
  listId: string;
  taskIds: string[];
}

export interface TaskActivity {
  _id: string;
  task: TaskRef | null;
  taskId: string;
  boardId: string;
  type: TaskActivityType;
  source: TaskActivitySource;
  subject: string;
  body: string;
  actorName: string;
  authorId: string | null;
  isPinned: boolean;
  isEdited: boolean;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskActivityListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  taskId?: string;
  boardId?: string;
  type?: TaskActivityType;
  source?: TaskActivitySource;
  isPinned?: boolean;
}

export interface TaskActivitySummary {
  total: number;
  commentCount: number;
  systemCount: number;
  pinnedCount: number;
}

export interface TaskActivityPayload {
  taskId: string;
  body: string;
  isPinned?: boolean;
}

export interface TaskActivityUpdatePayload {
  body?: string;
  isPinned?: boolean;
}
