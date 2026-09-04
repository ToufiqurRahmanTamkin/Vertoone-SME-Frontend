import type { StatusColor } from "@/components/shared/status-badge";

export interface MyRequestChannel {
  key: string;
  label: string;
  path: string;
  total: number;
  open: number;
  approved: number;
  rejected: number;
}

export interface MyRequestActivity {
  _id: string;
  channel: string;
  channelLabel: string;
  path: string;
  title: string;
  detail: string;
  status: string;
  statusLabel: string;
  isOpen: boolean;
  createdAt: string;
  decidedAt: string | null;
}

export interface MyRequestsOverview {
  employeeName: string;
  total: number;
  open: number;
  approved: number;
  rejected: number;
  cancelled: number;
  decidedThisMonth: number;
  leaveDaysTaken: number;
  leaveDaysRemaining: number;
  claimedAmount: number;
  pendingAmount: number;
  currency: string;
  channels: MyRequestChannel[];
  recent: MyRequestActivity[];
}

export const REQUEST_STATUS_COLORS: Record<string, StatusColor> = {
  PENDING: "amber",
  IN_PROGRESS: "blue",
  APPROVED: "green",
  REJECTED: "red",
  CANCELLED: "zinc",
};
