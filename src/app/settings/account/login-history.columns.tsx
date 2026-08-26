import { StatusBadge } from "@/components/shared/status-badge";
import {
  LOGIN_DEVICE_TYPE_LABELS,
  LOGIN_FAILURE_REASON_LABELS,
  LOGIN_STATUS_COLORS,
  LOGIN_STATUS_LABELS,
} from "@/constant";
import { formatDateTime, safeDistanceToNow } from "@/lib/date";
import { deviceIcon } from "@/lib/device-icons";
import type { LoginHistoryEntry } from "@/types/domain/loginHistory";
import type { ColumnDef } from "@tanstack/react-table";
import { Sparkles } from "lucide-react";

const withVersion = (name: string, version: string): string =>
  version ? `${name} ${version}` : name || "Unknown";

export const loginHistoryColumns = (): ColumnDef<LoginHistoryEntry>[] => [
  {
    accessorKey: "loginAt",
    header: "Date & time",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="whitespace-nowrap text-sm font-medium">
          {formatDateTime(row.original.loginAt)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {safeDistanceToNow(row.original.loginAt)}
        </p>
      </div>
    ),
  },
  {
    id: "device",
    header: "Device",
    cell: ({ row }) => {
      const entry = row.original;
      const Icon = deviceIcon(entry.deviceType);
      return (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium">
              {entry.deviceName || LOGIN_DEVICE_TYPE_LABELS[entry.deviceType]}
              {entry.isNewDevice && (
                <span
                  title="First sign-in from this device"
                  className="inline-flex items-center gap-0.5 rounded bg-violet-500/10 px-1 py-0.5 text-[9px] font-bold uppercase text-violet-600 dark:text-violet-400"
                >
                  <Sparkles className="size-2.5" />
                  New
                </span>
              )}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {LOGIN_DEVICE_TYPE_LABELS[entry.deviceType]}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "browser",
    header: "Browser",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {withVersion(row.original.browser, row.original.browserVersion)}
      </span>
    ),
  },
  {
    accessorKey: "os",
    header: "Operating system",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {withVersion(row.original.os, row.original.osVersion)}
      </span>
    ),
  },
  {
    accessorKey: "ipAddress",
    header: "IP address",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.ipAddress || "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Result",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge
            color={LOGIN_STATUS_COLORS[entry.status]}
            label={LOGIN_STATUS_LABELS[entry.status]}
          />
          {entry.failureReason && (
            <span className="text-[11px] text-muted-foreground">
              {LOGIN_FAILURE_REASON_LABELS[entry.failureReason]}
            </span>
          )}
        </div>
      );
    },
  },
];
