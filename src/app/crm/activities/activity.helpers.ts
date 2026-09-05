import type { StatusColor } from "@/components/shared/status-badge";
import {
  CRM_ACTIVITY_TYPES_BY_CATEGORY,
  type CrmActivity,
  type CrmActivityCategory,
  type CrmActivityManualType,
  type CrmActivityType,
} from "@/types/domain/crmActivity";
import {
  AlarmClock,
  ArrowRightLeft,
  BellRing,
  CheckSquare,
  Coins,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  MonitorPlay,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  StickyNote,
  Trash2,
  Trophy,
  UserCog,
  UserPlus,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export const ACTIVITY_ICONS: Record<CrmActivityType, LucideIcon> = {
  NOTE: StickyNote,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: CheckSquare,
  WHATSAPP: MessageCircle,
  SMS: MessageSquare,
  VISIT: MapPin,
  DEMO: MonitorPlay,
  PROPOSAL_SENT: FileText,
  FOLLOW_UP: BellRing,
  DEAL_CREATED: Plus,
  STAGE_CHANGED: ArrowRightLeft,
  DEAL_WON: Trophy,
  DEAL_LOST: XCircle,
  DEAL_REOPENED: RotateCcw,
  DEAL_UPDATED: Pencil,
  DEAL_REMOVED: Trash2,
  OWNER_CHANGED: UserCog,
  VALUE_CHANGED: Coins,
  LEAD_CREATED: UserPlus,
  LEAD_STATUS_CHANGED: ArrowRightLeft,
  LEAD_CONVERTED: Trophy,
};

export const CATEGORY_ICONS: Record<CrmActivityCategory, LucideIcon> = {
  TASK: CheckSquare,
  CALL: Phone,
  MEETING: Users,
  NOTE: StickyNote,
  MESSAGE: Mail,
};

export const DUE_ICON = AlarmClock;

export const defaultTypeOf = (category: CrmActivityCategory): CrmActivityManualType =>
  CRM_ACTIVITY_TYPES_BY_CATEGORY[category][0];

export const activityStateOf = (
  activity: CrmActivity
): { label: string; color: StatusColor } => {
  if (activity.isCompleted) return { label: "Done", color: "green" };
  if (activity.isOverdue) return { label: "Overdue", color: "red" };
  if (activity.isDueToday) return { label: "Due today", color: "amber" };
  return { label: "Open", color: "blue" };
};

export const relatedNameOf = (activity: CrmActivity): string => {
  if (activity.relatedType === "DEAL") return activity.deal?.title ?? "Removed deal";
  if (activity.relatedType === "LEAD") return activity.lead?.title ?? "Removed lead";
  return activity.contact?.name ?? "Removed contact";
};

export const relatedCodeOf = (activity: CrmActivity): string => {
  if (activity.relatedType === "DEAL") return activity.deal?.code ?? "";
  if (activity.relatedType === "LEAD") return activity.lead?.code ?? "";
  return activity.contact?.email ?? "";
};
