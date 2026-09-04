import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDate } from "@/lib/date";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useDeleteWorkHistoryMutation,
  useGetWorkHistoriesQuery,
  useGetWorkHistorySummaryQuery,
} from "@/redux/apis/workHistoryApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  WORK_HISTORY_TYPES,
  WORK_HISTORY_TYPE_COLORS,
  WORK_HISTORY_TYPE_LABELS,
  type WorkHistoryEntry,
  type WorkHistoryType,
} from "@/types/domain/workHistory";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { WorkHistoryFormModal } from "./components/WorkHistoryFormModal";
import {
  ChangeSummary,
  WorkHistoryRowMenu,
  workHistoryColumns,
} from "./workHistory.columns";

export default function WorkHistoryPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/directory/work-history");

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const listFilters: FilterConfig[] = React.useMemo(
    () => [
      {
        name: "employeeId",
        label: "Employee",
        type: "select",
        options: employeeOptions.map((option) => ({
          label: option.name,
          value: option._id,
        })),
      },
      {
        name: "type",
        label: "Type",
        type: "select",
        options: WORK_HISTORY_TYPES.map((value) => ({
          label: WORK_HISTORY_TYPE_LABELS[value],
          value,
        })),
      },
      {
        name: "isSystem",
        label: "Source",
        type: "select",
        options: [
          { label: "Recorded by hand", value: "false" },
          { label: "Recorded automatically", value: "true" },
        ],
      },
      { name: "from", label: "From", type: "date" },
      { name: "to", label: "To", type: "date" },
    ],
    [employeeOptions]
  );

  const query = {
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    employeeId: filters.employeeId as string | undefined,
    type: filters.type as WorkHistoryType | undefined,
    from: filters.from as string | undefined,
    to: filters.to as string | undefined,
    isSystem: filters.isSystem === undefined ? undefined : filters.isSystem === "true",
  };

  const { data, isLoading, isFetching } = useGetWorkHistoriesQuery(query);
  const { data: summary } = useGetWorkHistorySummaryQuery({
    employeeId: query.employeeId,
    type: query.type,
    from: query.from,
    to: query.to,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<WorkHistoryEntry | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<WorkHistoryEntry | null>(null);
  const [deleteEntry, { isLoading: isDeleting }] = useDeleteWorkHistoryMutation();

  const rowActions = React.useMemo(
    () => ({
      onEdit: (entry: WorkHistoryEntry) => {
        setEditing(entry);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => workHistoryColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteEntry(pendingDelete._id).unwrap();
      toast.success("Entry removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the entry");
    }
  };

  const entries = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Work history"
        description="Every posting, promotion and transfer behind an employee. Most of it is recorded for you as records change."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Events</StatLabel>
          <StatValue>{summary?.total ?? 0}</StatValue>
          <StatDescription>Across {summary?.employeesCovered ?? 0} people</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Promotions</StatLabel>
          <StatValue>{summary?.promotions ?? 0}</StatValue>
          <StatDescription>{summary?.confirmations ?? 0} confirmations</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Transfers</StatLabel>
          <StatValue>{summary?.transfers ?? 0}</StatValue>
          <StatDescription>Moves between departments</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Exits</StatLabel>
          <StatValue>{summary?.exits ?? 0}</StatValue>
          <StatDescription>
            {summary?.lastEventAt
              ? `Last event ${formatDate(summary.lastEventAt)}`
              : "Nothing recorded yet"}
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search people or events..."
        filters={listFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Add entry"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={entries}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        getRowId={(row) => row._id}
        mobileCard={(entry) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{entry.title || entry.typeLabel}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {entry.employee?.name ?? "—"} · {formatDate(entry.effectiveDate)}
                </p>
              </div>
              <StatusBadge
                color={WORK_HISTORY_TYPE_COLORS[entry.type] ?? "muted"}
                label={entry.typeLabel}
              />
            </div>

            <div className="mt-3">
              <ChangeSummary entry={entry} />
            </div>

            {entry.isSystem && (
              <div className="mt-3">
                <Badge variant="outline" className="text-[10px]">
                  Automatic
                </Badge>
              </div>
            )}

            <div className="mt-3 border-t pt-3">
              <WorkHistoryRowMenu entry={entry} actions={rowActions} />
            </div>
          </div>
        )}
      />

      <WorkHistoryFormModal open={formOpen} onOpenChange={setFormOpen} entry={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this entry?"
        description="It disappears from the employee's timeline. Automatic entries may be recorded again on the next change."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
