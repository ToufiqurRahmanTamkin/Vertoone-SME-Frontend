import type { GoalStatus } from "./goal";
import type { TaskAssigneeKind, TaskPriority } from "./task";

export interface BoardKpis {
  total: number;
  active: number;
  archived: number;
}

export interface TaskKpis {
  total: number;
  open: number;
  completed: number;
  overdue: number;
  dueToday: number;
  unassigned: number;
  completionRate: number;
  completedThisMonth: number;
  completedChangePercent: number;
  limit: number | null;
  remaining: number | null;
}

export interface GoalKpis {
  total: number;
  open: number;
  achieved: number;
  atRisk: number;
  offTrack: number;
  overdue: number;
  dueSoon: number;
  averageProgress: number;
  limit: number | null;
  remaining: number | null;
}

export interface NoteKpis {
  total: number;
  pinned: number;
  reminderDue: number;
  archived: number;
  limit: number | null;
  remaining: number | null;
}

export interface TasksGoalsKpis {
  boards: BoardKpis;
  tasks: TaskKpis;
  goals: GoalKpis;
  notes: NoteKpis;
}

export interface WorkloadRow {
  key: string;
  kind: TaskAssigneeKind;
  refId: string;
  name: string;
  subtitle: string;
  initials: string;
  total: number;
  open: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  completionRate: number;
}

export interface BoardWorkloadRow {
  _id: string;
  name: string;
  color: string;
  total: number;
  open: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export interface PriorityPoint {
  priority: TaskPriority;
  count: number;
}

export interface GoalStatusPoint {
  status: GoalStatus;
  count: number;
}

export interface TasksGoalsTrendPoint {
  month: string;
  created: number;
  completed: number;
}

export interface UpcomingTaskRow {
  _id: string;
  code: string;
  title: string;
  priority: TaskPriority;
  dueAt: string | null;
  isOverdue: boolean;
  boardId: string;
  boardName: string;
  boardColor: string;
  assigneeNames: string[];
}

export interface GoalProgressRow {
  _id: string;
  code: string;
  title: string;
  color: string;
  status: GoalStatus;
  progress: number;
  dueDate: string | null;
  isOverdue: boolean;
  ownerName: string;
  keyResultCount: number;
  completedKeyResultCount: number;
}

export interface RecentNoteRow {
  _id: string;
  title: string;
  color: string;
  excerpt: string;
  isPinned: boolean;
  reminderAt: string | null;
  updatedAt: string;
}

export interface TasksGoalsOverview {
  kpis: TasksGoalsKpis;
  workload: WorkloadRow[];
  boards: BoardWorkloadRow[];
  priorities: PriorityPoint[];
  goalStatuses: GoalStatusPoint[];
  trend: TasksGoalsTrendPoint[];
  upcomingTasks: UpcomingTaskRow[];
  goalProgress: GoalProgressRow[];
  recentNotes: RecentNoteRow[];
  generatedAt: string;
}
