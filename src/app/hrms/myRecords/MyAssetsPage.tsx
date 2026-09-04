import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useGetMyAssetAssignmentsQuery } from "@/redux/apis/assetApis";
import {
  ASSET_CONDITION_LABELS,
  ASSIGNMENT_STATUS_LABELS,
} from "@/types/domain/asset";
import { Boxes } from "lucide-react";

const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function MyAssetsPage() {
  const { data, isLoading } = useGetMyAssetAssignmentsQuery({ limit: 100 });

  const rows = data?.data ?? [];
  const active = rows.filter((row) => row.status === "ACTIVE");
  const overdue = active.filter((row) => row.isOverdue);

  return (
    <>
      <PageHeader
        title="My assets"
        description="Company kit that is currently in your hands, and everything you have handed back."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>With me now</StatLabel>
          <StatValue>{active.length}</StatValue>
          <StatDescription>Items you are responsible for</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Due back</StatLabel>
          <StatValue>{overdue.length}</StatValue>
          <StatDescription>
            {overdue.length > 0 ? "Please return these" : "Nothing is overdue"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Handed back</StatLabel>
          <StatValue>{rows.length - active.length}</StatValue>
          <StatDescription>Closed handovers</StatDescription>
        </Stat>
      </StatGrid>

      {isLoading ? (
        <LoadingSpinner />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-16 text-center">
          <Boxes className="size-7 text-muted-foreground" />
          <p className="font-medium">Nothing is out with you</p>
          <p className="max-w-md text-sm text-muted-foreground">
            When somebody hands you a laptop, a phone or anything else the company owns, it shows
            up here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((assignment) => (
            <div key={assignment._id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {assignment.asset?.name ?? "Removed asset"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{assignment.asset?.assetCode ?? "—"}</span>
                    {assignment.asset?.serialNumber && ` · ${assignment.asset.serialNumber}`}
                  </p>
                </div>
                <StatusBadge
                  color={
                    assignment.status === "RETURNED"
                      ? "zinc"
                      : assignment.isOverdue
                        ? "red"
                        : "green"
                  }
                  label={
                    assignment.isOverdue && assignment.status === "ACTIVE"
                      ? "Overdue"
                      : ASSIGNMENT_STATUS_LABELS[assignment.status]
                  }
                />
              </div>

              <dl className="mt-3 space-y-1.5 border-t pt-3 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Handed over</dt>
                  <dd>{formatDay(assignment.assignedAt)}</dd>
                </div>
                {assignment.dueAt && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Due back</dt>
                    <dd className={assignment.isOverdue ? "font-medium text-red-600" : undefined}>
                      {formatDay(assignment.dueAt)}
                    </dd>
                  </div>
                )}
                {assignment.returnedAt && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Returned</dt>
                    <dd>{formatDay(assignment.returnedAt)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Days held</dt>
                  <dd>{assignment.daysHeld}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-[10px]">
                  Given as {ASSET_CONDITION_LABELS[assignment.conditionOnAssign]}
                </Badge>
                {assignment.conditionOnReturn && (
                  <Badge variant="outline" className="text-[10px]">
                    Back as {ASSET_CONDITION_LABELS[assignment.conditionOnReturn]}
                  </Badge>
                )}
              </div>

              {assignment.notes && (
                <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                  {assignment.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
