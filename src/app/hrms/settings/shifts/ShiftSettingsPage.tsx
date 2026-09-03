import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetHrmsSettingsQuery } from "@/redux/apis/hrmsSettingsApis";
import {
  useDeleteShiftMutation,
  useGetShiftSummaryQuery,
  useGetShiftsQuery,
  useUpdateShiftMutation,
} from "@/redux/apis/shiftApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Shift } from "@/types/domain/shift";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ShiftFormModal } from "./components/ShiftFormModal";
import { WeekSettingsForm } from "./components/WeekSettingsForm";
import { ShiftRowMenu, formatHours, shiftColumns, workingDayLabel } from "./shifts.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "isActive",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];

export default function ShiftSettingsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/settings/shifts");

  const { data, isLoading, isFetching } = useGetShiftsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetShiftSummaryQuery();
  const { data: settings, isLoading: isLoadingSettings } = useGetHrmsSettingsQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Shift | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Shift | null>(null);
  const [deleteShift, { isLoading: isDeleting }] = useDeleteShiftMutation();
  const [updateShift] = useUpdateShiftMutation();

  const makeDefault = React.useCallback(
    async (shift: Shift) => {
      try {
        await updateShift({ id: shift._id, body: { isDefault: true } }).unwrap();
        toast.success(`${shift.name} is now the default shift`);
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not change the default shift");
      }
    },
    [updateShift]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: (shift: Shift) => {
        setEditing(shift);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      onMakeDefault: (shift: Shift) => void makeDefault(shift),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete, makeDefault]
  );

  const columns = React.useMemo(() => shiftColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteShift(pendingDelete._id).unwrap();
      toast.success("Shift deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the shift");
    }
  };

  const shifts = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Shifts"
        description="Working-hour patterns your people are rostered onto, and the shape of your week."
        actions={<BackLink to="/hrms/settings/overview" label="All settings" />}
      />

      <Tabs defaultValue="shifts" className="gap-4">
        <TabsList>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="week">Working week</TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="flex flex-col gap-4">
          <StatGrid className="sm:grid-cols-4">
            <Stat>
              <StatLabel>Shifts</StatLabel>
              <StatValue>{used}</StatValue>
              <StatDescription>
                {limit === null
                  ? "Unlimited on your plan"
                  : `${used} of ${limit} allowed by your plan`}
              </StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Active</StatLabel>
              <StatValue>{summary?.activeCount ?? 0}</StatValue>
              <StatDescription>Offered when rostering an employee</StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Average paid day</StatLabel>
              <StatValue>{summary?.averagePaidHours ?? 0}h</StatValue>
              <StatDescription>Across your active shifts, breaks excluded</StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Overnight shifts</StatLabel>
              <StatValue>{summary?.nightShiftCount ?? 0}</StatValue>
              <StatDescription>
                Default: {summary?.defaultShiftName || "none set"}
              </StatDescription>
            </Stat>
          </StatGrid>

          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search shifts..."
            filters={FILTERS}
            currentFilters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetching}
            actions={
              access.canCreate && (
                <ActionButton
                  icon={Plus}
                  label="New shift"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  disabled={isLimitReached}
                  title={
                    isLimitReached
                      ? `Your plan allows ${limit} shifts. Delete one or upgrade to add more.`
                      : undefined
                  }
                />
              )
            }
          />

          {isLimitReached && (
            <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
              You have used all {limit} shifts your plan allows. Delete one or upgrade your
              subscription to add more.
            </p>
          )}

          <DataTable
            columns={columns}
            data={shifts}
            isLoading={isLoading}
            pagination={
              meta
                ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
                : undefined
            }
            onPageChange={(page) => setFilter("page", page)}
            onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
            getRowId={(row) => row._id}
            mobileCard={(shift) => (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: shift.color }}
                    />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate font-semibold">
                        {shift.name}
                        {shift.isDefault && (
                          <Badge variant="secondary" className="text-[10px]">
                            Default
                          </Badge>
                        )}
                      </p>
                      <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                        {shift.code}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    color={shift.isActive ? "green" : "zinc"}
                    label={shift.isActive ? "Active" : "Inactive"}
                  />
                </div>

                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Hours</dt>
                    <dd className="font-medium">
                      {shift.startTime} – {shift.endTime}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Paid time</dt>
                    <dd className="font-medium">{formatHours(shift.paidMinutes)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Working days</dt>
                    <dd className="font-medium">{workingDayLabel(shift.workingDays)}</dd>
                  </div>
                </dl>

                <div className="mt-3 border-t pt-3">
                  <ShiftRowMenu shift={shift} actions={rowActions} />
                </div>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="week">
          {isLoadingSettings || !settings ? (
            <LoadingSpinner />
          ) : (
            <WeekSettingsForm
              key={settings.updatedAt}
              week={settings.week}
              canEdit={access.canEdit}
            />
          )}
        </TabsContent>
      </Tabs>

      <ShiftFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        shift={editing}
        isFirstShift={used === 0}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="Employees on this shift keep their logged attendance, but they will need a new shift assigned."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
