import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { RowActions } from "@/components/shared/row-actions";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { cn } from "@/lib/utils";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useDeleteForecastTargetMutation,
  useGetForecastQuery,
  useGetForecastTargetsQuery,
} from "@/redux/apis/forecastApis";
import { useGetPipelineOptionsQuery } from "@/redux/apis/pipelineApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  FORECAST_BEST_CASE_PROBABILITY,
  FORECAST_COMMIT_PROBABILITY,
  FORECAST_PERIOD_TYPE_LABELS,
  FORECAST_PERIOD_TYPES,
  type ForecastPeriodType,
  type ForecastTarget,
} from "@/types/domain/forecast";
import { GitBranch, Pencil, Plus, Target, TrendingUp, Trash2, Users } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ForecastTargetModal } from "./components/ForecastTargetModal";

const currentPeriodOf = (periodType: ForecastPeriodType): string => {
  const now = new Date();
  if (periodType === "QUARTER") {
    return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const attainmentTone = (attainment: number, hasTarget: boolean): string => {
  if (!hasTarget) return "text-muted-foreground";
  if (attainment >= 100) return "text-emerald-600 dark:text-emerald-400";
  if (attainment >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

export default function ForecastsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/forecasts");

  const periodType: ForecastPeriodType =
    filters.periodType === "QUARTER" ? "QUARTER" : "MONTH";

  const { data: pipelineOptions = [] } = useGetPipelineOptionsQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const { data, isLoading, isFetching } = useGetForecastQuery({
    periodType,
    periods: periodType === "QUARTER" ? 4 : 6,
    pipelineId: (filters.pipelineId as string | undefined) || undefined,
    ownerId: (filters.ownerId as string | undefined) || undefined,
  });

  const { data: targetResult } = useGetForecastTargetsQuery({ periodType, limit: 50 });

  const [deleteTarget, { isLoading: isDeleting }] = useDeleteForecastTargetMutation();

  const [targetOpen, setTargetOpen] = React.useState(false);
  const [editingTarget, setEditingTarget] = React.useState<ForecastTarget | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<ForecastTarget | null>(null);

  const toolbarFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "periodType",
        label: "Period",
        type: "select",
        hideAllOption: true,
        options: FORECAST_PERIOD_TYPES.map((row) => ({
          label: FORECAST_PERIOD_TYPE_LABELS[row],
          value: row,
        })),
      },
      {
        name: "pipelineId",
        label: "Pipeline",
        type: "select",
        options: pipelineOptions.map((pipeline) => ({
          label: pipeline.name,
          value: pipeline._id,
        })),
      },
      {
        name: "ownerId",
        label: "Owner",
        type: "select",
        options: employeeOptions.map((employee) => ({
          label: employee.name,
          value: employee._id,
        })),
      },
    ],
    [pipelineOptions, employeeOptions]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTarget(pendingDelete._id).unwrap();
      toast.success("Target removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the target");
    }
  };

  const currency = data?.currency ?? "BDT";
  const totals = data?.totals;
  const targets = targetResult?.data ?? [];

  return (
    <>
      <PageHeader
        title="Forecasts"
        description="Expected revenue by period, owner and pipeline, measured against the targets you set."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Forecast</StatLabel>
          <StatValue>{formatAmountValue(totals?.forecastValue)}</StatValue>
          <StatDescription>
            {formatAmountValue(totals?.wonValue)} won ·{" "}
            {formatAmountValue(totals?.weightedValue)} weighted
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Target</StatLabel>
          <StatValue>{formatAmountValue(totals?.target)}</StatValue>
          <StatDescription>
            {(totals?.target ?? 0) > 0
              ? `${formatAmountValue(totals?.gap)} still to find`
              : "No target set for this window"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Attainment</StatLabel>
          <StatValue
            className={attainmentTone(totals?.attainment ?? 0, (totals?.target ?? 0) > 0)}
          >
            {(totals?.target ?? 0) > 0 ? `${totals?.attainment ?? 0}%` : "—"}
          </StatValue>
          <StatDescription>{totals?.winRate ?? 0}% win rate on closed deals</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Open deals</StatLabel>
          <StatValue>{formatNumber(totals?.openCount)}</StatValue>
          <StatDescription>
            Average won deal {formatAmountValue(totals?.averageDealSize)}
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue=""
        onSearchChange={() => {}}
        filters={toolbarFilters}
        currentFilters={{ ...filters, periodType }}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Target}
              label="Set target"
              onClick={() => {
                setEditingTarget(null);
                setTargetOpen(true);
              }}
            />
          )
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4">
          <SectionCard
            icon={TrendingUp}
            title="By period"
            description={`Closed plus weighted pipeline. Commit is anything at ${FORECAST_COMMIT_PROBABILITY}% or better, best case from ${FORECAST_BEST_CASE_PROBABILITY}%.`}
            contentClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Period</th>
                    <th className="px-4 py-2 text-right font-medium">Closed won</th>
                    <th className="px-4 py-2 text-right font-medium">Commit</th>
                    <th className="px-4 py-2 text-right font-medium">Best case</th>
                    <th className="px-4 py-2 text-right font-medium">Pipeline</th>
                    <th className="px-4 py-2 text-right font-medium">Forecast</th>
                    <th className="px-4 py-2 text-right font-medium">Target</th>
                    <th className="px-4 py-2 text-left font-medium">Attainment</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(data?.periods ?? []).map((row) => (
                    <tr key={row.period} className={cn(row.isCurrent && "bg-primary/5")}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{row.label}</span>
                          {row.isCurrent && <StatusBadge color="blue" label="Now" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {row.wonCount} won · {row.openCount} open
                        </p>
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {formatAmountValue(row.wonValue)}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {formatAmountValue(row.commitValue)}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {formatAmountValue(row.bestCaseValue)}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                        {formatAmountValue(row.pipelineValue)}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold tabular-nums">
                        {formatAmountValue(row.forecastValue)}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {row.target > 0 ? formatAmountValue(row.target) : "—"}
                      </td>
                      <td className="px-4 py-2">
                        {row.target > 0 ? (
                          <div className="flex min-w-[120px] items-center gap-2">
                            <Progress value={Math.min(100, row.attainment)} className="h-1.5" />
                            <span
                              className={cn(
                                "shrink-0 text-xs font-medium tabular-nums",
                                attainmentTone(row.attainment, true)
                              )}
                            >
                              {row.attainment}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No target</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              icon={Users}
              title="By owner"
              description="Who is carrying the number, and how close they are."
            >
              {(data?.byOwner ?? []).length === 0 ? (
                <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                  No deals close in this window yet.
                </p>
              ) : (
                <ul className="grid gap-2">
                  {(data?.byOwner ?? []).map((row) => (
                    <li
                      key={row.ownerId ?? "unassigned"}
                      className="rounded-lg border px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium">{row.name}</span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatAmountValue(row.forecastValue)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          {row.openCount} open · {formatAmountValue(row.openValue)} in play
                        </span>
                        {row.target > 0 ? (
                          <span
                            className={cn(
                              "shrink-0 text-xs font-medium tabular-nums",
                              attainmentTone(row.attainment, true)
                            )}
                          >
                            {row.attainment}% of {formatAmountValue(row.target)}
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-[11px]">
                            No target
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              icon={GitBranch}
              title="By pipeline"
              description="Where the expected revenue is coming from."
            >
              {(data?.byPipeline ?? []).length === 0 ? (
                <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                  No deals close in this window yet.
                </p>
              ) : (
                <ul className="grid gap-2">
                  {(data?.byPipeline ?? []).map((row) => (
                    <li
                      key={row.pipelineId}
                      className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <ColorChip color={row.color} label={row.name} />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.openCount} open · {formatAmountValue(row.openValue)} in play
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatAmountValue(row.wonValue + row.weightedValue)}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {formatAmountValue(row.wonValue)} won
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <SectionCard
            icon={Target}
            title="Targets"
            description="What the forecast is measured against. A per-person target overrides the team one for that period."
            action={
              access.canCreate && (
                <ActionButton
                  icon={Plus}
                  label="Add"
                  onClick={() => {
                    setEditingTarget(null);
                    setTargetOpen(true);
                  }}
                />
              )
            }
          >
            {targets.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                No targets set yet. Without one the forecast has nothing to measure against.
              </p>
            ) : (
              <ul className="grid gap-2">
                {targets.map((target) => (
                  <li
                    key={target._id}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {target.periodLabel} · {target.owner?.name ?? "Whole team"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {target.pipeline?.name ?? "Every pipeline"}
                        {target.notes ? ` · ${target.notes}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatAmountValue(target.amount)}
                      </span>
                      <RowActions
                        label={`Actions for ${target.periodLabel} target`}
                        actions={[
                          {
                            key: "edit",
                            label: "Edit",
                            icon: Pencil,
                            disabled: !access.canEdit,
                            onSelect: () => {
                              setEditingTarget(target);
                              setTargetOpen(true);
                            },
                          },
                          {
                            key: "delete",
                            label: "Delete",
                            icon: Trash2,
                            variant: "destructive",
                            separated: true,
                            disabled: !access.canDelete,
                            onSelect: () => setPendingDelete(target),
                          },
                        ]}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      )}

      <ForecastTargetModal
        open={targetOpen}
        onOpenChange={setTargetOpen}
        target={editingTarget}
        defaultPeriodType={periodType}
        defaultPeriod={currentPeriodOf(periodType)}
        currency={currency}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this target?"
        description="The forecast for that period goes back to having nothing to measure against."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
