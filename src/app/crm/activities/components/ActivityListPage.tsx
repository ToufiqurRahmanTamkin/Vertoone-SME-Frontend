import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  useDeleteCrmActivityMutation,
  useGetCrmActivitiesQuery,
  useGetCrmActivitySummaryQuery,
  useUpdateCrmActivityMutation,
} from "@/redux/apis/crmActivityApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CRM_ACTIVITY_RELATED_COLORS,
  CRM_ACTIVITY_RELATED_LABELS,
  CRM_ACTIVITY_RELATED_TYPES,
  CRM_ACTIVITY_TYPE_LABELS,
  CRM_ACTIVITY_TYPES_BY_CATEGORY,
  type CrmActivity,
  type CrmActivityCategory,
  type CrmActivityRelatedType,
  type CrmActivityType,
} from "@/types/domain/crmActivity";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { activityStateOf, defaultTypeOf, relatedNameOf } from "../activity.helpers";
import { ActivityRowActions, activityColumns } from "../activities.columns";
import { ActivityFormModal } from "./ActivityFormModal";

interface ActivityListPageProps {
  category: CrmActivityCategory;
  modulePath: string;
  title: string;
  description: string;
  createLabel: string;
  emptyHint: string;
  showDue?: boolean;
  statLabels?: { total: string; open: string; overdue: string; done: string };
}

const STATE_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "Overdue", value: "overdue" },
  { label: "Done", value: "done" },
];

export function ActivityListPage({
  category,
  modulePath,
  title,
  description,
  createLabel,
  emptyHint,
  showDue = true,
  statLabels,
}: ActivityListPageProps) {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission(modulePath);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const state = filters.state as string | undefined;

  const listQuery = React.useMemo(
    () => ({
      category,
      search: filters.search,
      relatedType: filters.relatedType as CrmActivityRelatedType | undefined,
      type: filters.type as CrmActivityType | undefined,
      performedById: filters.performedById as string | undefined,
      isCompleted: state === "done" ? true : state === "open" ? false : undefined,
      isOverdue: state === "overdue" ? true : undefined,
    }),
    [category, filters.search, filters.relatedType, filters.type, filters.performedById, state]
  );

  const { data, isLoading, isFetching } = useGetCrmActivitiesQuery({
    ...listQuery,
    page: filters.page,
    limit: filters.limit,
  });

  const { data: summary } = useGetCrmActivitySummaryQuery({ category });

  const [updateActivity] = useUpdateCrmActivityMutation();
  const [deleteActivity, { isLoading: isDeleting }] = useDeleteCrmActivityMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CrmActivity | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<CrmActivity | null>(null);

  const toolbarFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "relatedType",
        label: "Against",
        type: "select",
        options: CRM_ACTIVITY_RELATED_TYPES.map((related) => ({
          label: CRM_ACTIVITY_RELATED_LABELS[related],
          value: related,
        })),
      },
      {
        name: "type",
        label: "Kind",
        type: "select",
        options: CRM_ACTIVITY_TYPES_BY_CATEGORY[category].map((type) => ({
          label: CRM_ACTIVITY_TYPE_LABELS[type],
          value: type,
        })),
      },
      {
        name: "performedById",
        label: "Owner",
        type: "select",
        options: employeeOptions.map((employee) => ({
          label: employee.name,
          value: employee._id,
        })),
      },
      { name: "state", label: "State", type: "select", options: STATE_OPTIONS },
    ],
    [category, employeeOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (activity: CrmActivity) => {
    setEditing(activity);
    setFormOpen(true);
  };

  const complete = async (activity: CrmActivity) => {
    try {
      await updateActivity({ id: activity._id, body: { isCompleted: true } }).unwrap();
      toast.success("Marked done");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the activity");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteActivity(pendingDelete._id).unwrap();
      toast.success("Activity removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the activity");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onComplete: (activity: CrmActivity) => void complete(activity),
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(
    () => activityColumns(rowActions, { showDue }),
    [rowActions, showDue]
  );

  const activities = data?.data ?? [];
  const meta = data?.meta;

  const labels = statLabels ?? {
    total: "Logged",
    open: "Open",
    overdue: "Overdue",
    done: "Completed",
  };

  return (
    <>
      <PageHeader title={title} description={description} />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>{labels.total}</StatLabel>
          <StatValue>{summary?.total ?? 0}</StatValue>
          <StatDescription>{summary?.loggedThisWeekCount ?? 0} in the last 7 days</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>{labels.open}</StatLabel>
          <StatValue>{summary?.openCount ?? 0}</StatValue>
          <StatDescription>{summary?.dueTodayCount ?? 0} due today</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>{labels.overdue}</StatLabel>
          <StatValue>{summary?.overdueCount ?? 0}</StatValue>
          <StatDescription>Past their due date and still open</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>{labels.done}</StatLabel>
          <StatValue>{summary?.completedCount ?? 0}</StatValue>
          <StatDescription>{summary?.unassignedCount ?? 0} open with nobody on them</StatDescription>
        </Stat>
      </StatGrid>

      {!isLoading && activities.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          {emptyHint}
        </p>
      )}

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search subject, notes and location..."
        filters={toolbarFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton icon={Plus} label={createLabel} onClick={openCreate} />
          )
        }
      />

      <DataTable
        columns={columns}
        data={activities}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(activity) => {
          const activityState = activityStateOf(activity);

          return (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{activity.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {CRM_ACTIVITY_TYPE_LABELS[activity.type]}
                  </p>
                </div>
                <StatusBadge color={activityState.color} label={activityState.label} />
              </div>

              <dl className="mt-3 grid gap-1 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Against</dt>
                  <dd className="truncate font-medium">{relatedNameOf(activity)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Owner</dt>
                  <dd className="truncate font-medium">
                    {activity.performedBy?.name || "Unassigned"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">When</dt>
                  <dd className="font-medium">{formatDateTime(activity.occurredAt)}</dd>
                </div>
                {showDue && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Due</dt>
                    <dd
                      className={cn(
                        "font-medium",
                        activity.isOverdue && "text-red-600 dark:text-red-400"
                      )}
                    >
                      {activity.dueAt ? formatDateTime(activity.dueAt) : "—"}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge
                  color={CRM_ACTIVITY_RELATED_COLORS[activity.relatedType]}
                  label={CRM_ACTIVITY_RELATED_LABELS[activity.relatedType]}
                />
              </div>

              <div className="mt-3 border-t pt-3">
                <ActivityRowActions activity={activity} {...rowActions} />
              </div>
            </div>
          );
        }}
      />

      <ActivityFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        activity={editing}
        defaultType={defaultTypeOf(category)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this activity?"
        description="It disappears from the timeline. The record it sits on is untouched."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
