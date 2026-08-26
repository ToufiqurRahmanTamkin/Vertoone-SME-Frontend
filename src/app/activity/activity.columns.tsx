import { StatusBadge } from "@/components/shared/status-badge";
import {
  ACTIVITY_ACTION_LABELS,
  ACTIVITY_CATEGORY_COLORS,
  ACTIVITY_CATEGORY_LABELS,
  ACTIVITY_SEVERITY_COLORS,
  ACTIVITY_SEVERITY_LABELS,
} from "@/constant";
import { formatDateTime, safeDistanceToNow } from "@/lib/date";
import type { Activity } from "@/types/domain/activity";
import type { ColumnDef } from "@tanstack/react-table";
import { Cpu } from "lucide-react";

export const activityColumns = (): ColumnDef<Activity>[] => [
  {
    accessorKey: "createdAt",
    header: "When",
    cell: ({ row }) => (
      <div className="min-w-0 text-xs">
        <div className="font-medium">{formatDateTime(row.original.createdAt)}</div>
        <div className="text-muted-foreground">{safeDistanceToNow(row.original.createdAt)}</div>
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium">
          {ACTIVITY_ACTION_LABELS[row.original.action] ?? row.original.action}
        </p>
        <StatusBadge
          color={ACTIVITY_CATEGORY_COLORS[row.original.category] ?? "muted"}
          label={ACTIVITY_CATEGORY_LABELS[row.original.category] ?? row.original.category}
        />
      </div>
    ),
  },
  {
    accessorKey: "message",
    header: "Detail",
    cell: ({ row }) => (
      <p className="max-w-[26rem] text-sm text-muted-foreground">{row.original.message}</p>
    ),
  },
  {
    accessorKey: "companyName",
    header: "Company",
    cell: ({ row }) =>
      row.original.companyId ? (
        <span className="truncate text-sm">{row.original.companyName || "Unnamed company"}</span>
      ) : (
        <span className="text-xs text-muted-foreground">System-wide</span>
      ),
  },
  {
    accessorKey: "actorName",
    header: "By",
    cell: ({ row }) => {
      const record = row.original;
      if (record.isSystemActor) {
        return (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Cpu className="size-3" />
            System
          </span>
        );
      }
      return (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{record.actorName || "—"}</p>
          <p className="max-w-[14rem] truncate text-xs text-muted-foreground">
            {record.actorEmail}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => (
      <StatusBadge
        color={ACTIVITY_SEVERITY_COLORS[row.original.severity] ?? "muted"}
        label={ACTIVITY_SEVERITY_LABELS[row.original.severity] ?? row.original.severity}
      />
    ),
  },
];
