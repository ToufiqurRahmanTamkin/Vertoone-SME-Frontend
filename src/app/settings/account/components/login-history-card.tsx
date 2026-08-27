import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LOGIN_DEVICE_TYPE_LABELS,
  LOGIN_FAILURE_REASON_LABELS,
  LOGIN_STATUS_COLORS,
  LOGIN_STATUS_LABELS,
} from "@/constant";
import { formatNumber } from "@/lib/amount";
import { formatDateTime, safeDistanceToNow } from "@/lib/date";
import { deviceIcon } from "@/lib/device-icons";
import {
  useGetLoginHistoryQuery,
  useGetLoginHistorySummaryQuery,
} from "@/redux/apis/loginHistoryApis";
import type { LoginStatus } from "@/types/domain/loginHistory";
import { History } from "lucide-react";
import * as React from "react";
import { loginHistoryColumns } from "../login-history.columns";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { label: string; value: LoginStatus | "ALL" }[] = [
  { label: "All activity", value: "ALL" },
  { label: "Successful", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
];

interface SummaryTileProps {
  label: string;
  value: string;
  isLoading: boolean;
}

function SummaryTile({ label, value, isLoading }: SummaryTileProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-1.5 h-5 w-16" />
      ) : (
        <p className="mt-0.5 truncate text-sm font-semibold tabular-nums">{value}</p>
      )}
    </div>
  );
}

export function LoginHistoryCard() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(PAGE_SIZE);
  const [status, setStatus] = React.useState<LoginStatus | "ALL">("ALL");

  const { data, isLoading } = useGetLoginHistoryQuery({
    page,
    limit,
    status: status === "ALL" ? undefined : status,
  });
  const { data: summary, isLoading: isSummaryLoading } = useGetLoginHistorySummaryQuery();

  const columns = React.useMemo(() => loginHistoryColumns(), []);
  const entries = data?.data ?? [];
  const meta = data?.meta;

  const onStatusChange = (value: string) => {
    setStatus(value as LoginStatus | "ALL");
    setPage(1);
  };

  return (
    <SectionCard
      icon={History}
      title="Login history"
      description="Every sign-in attempt on this account, with the device, browser and network it came from."
      action={
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-8 w-[9.5rem] cursor-pointer text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile
          label="Total attempts"
          value={formatNumber(summary?.total)}
          isLoading={isSummaryLoading}
        />
        <SummaryTile
          label="Successful"
          value={formatNumber(summary?.successful)}
          isLoading={isSummaryLoading}
        />
        <SummaryTile
          label="Failed"
          value={formatNumber(summary?.failed)}
          isLoading={isSummaryLoading}
        />
        <SummaryTile
          label="Known devices"
          value={formatNumber(summary?.distinctDevices)}
          isLoading={isSummaryLoading}
        />
      </div>

      <DataTable
        columns={columns}
        data={entries}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={setPage}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
        getRowId={(row) => row._id}
        mobileCard={(entry) => {
          const Icon = deviceIcon(entry.deviceType);
          return (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {entry.deviceName || LOGIN_DEVICE_TYPE_LABELS[entry.deviceType]}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {entry.browser} · {entry.os}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  color={LOGIN_STATUS_COLORS[entry.status]}
                  label={LOGIN_STATUS_LABELS[entry.status]}
                />
              </div>

              <dl className="mt-3 space-y-1.5 border-t pt-3 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Date & time</dt>
                  <dd className="truncate font-medium">{formatDateTime(entry.loginAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">When</dt>
                  <dd className="truncate">{safeDistanceToNow(entry.loginAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">IP address</dt>
                  <dd className="truncate font-mono">{entry.ipAddress || "—"}</dd>
                </div>
                {entry.failureReason && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Reason</dt>
                    <dd className="truncate">
                      {LOGIN_FAILURE_REASON_LABELS[entry.failureReason]}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          );
        }}
      />
    </SectionCard>
  );
}
