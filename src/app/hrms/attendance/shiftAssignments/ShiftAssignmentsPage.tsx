import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDate } from "@/lib/date";
import {
  useDeleteShiftAssignmentMutation,
  useGetShiftAssignmentSummaryQuery,
  useGetShiftAssignmentsQuery,
} from "@/redux/apis/employeeShiftApis";
import { useGetShiftOptionsQuery } from "@/redux/apis/shiftApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  SHIFT_ASSIGNMENT_TYPES,
  SHIFT_ASSIGNMENT_TYPE_LABELS,
  type EmployeeShift,
  type ShiftAssignmentType,
} from "@/types/domain/employeeShift";
import { Plus, Users } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { BulkAssignDialog } from "./components/BulkAssignDialog";
import { ShiftAssignmentFormModal } from "./components/ShiftAssignmentFormModal";
import {
  AssignmentShape,
  ShiftAssignmentRowMenu,
  shiftAssignmentColumns,
} from "./shiftAssignments.columns";

export default function ShiftAssignmentsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/attendance/shift-assignments");

  const { data: shifts = [] } = useGetShiftOptionsQuery();

  const listFilters: FilterConfig[] = React.useMemo(
    () => [
      {
        name: "assignmentType",
        label: "Arrangement",
        type: "select",
        options: SHIFT_ASSIGNMENT_TYPES.map((value) => ({
          label: SHIFT_ASSIGNMENT_TYPE_LABELS[value],
          value,
        })),
      },
      {
        name: "shiftId",
        label: "Shift",
        type: "select",
        options: shifts.map((shift) => ({ label: shift.name, value: shift._id })),
      },
      {
        name: "currentOnly",
        label: "Period",
        type: "select",
        options: [
          { label: "In force today", value: "true" },
          { label: "All periods", value: "false" },
        ],
      },
      {
        name: "isActive",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
    ],
    [shifts]
  );

  const { data, isLoading, isFetching } = useGetShiftAssignmentsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    assignmentType: filters.assignmentType as ShiftAssignmentType | undefined,
    shiftId: filters.shiftId as string | undefined,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    currentOnly: filters.currentOnly === "true" ? true : undefined,
  });

  const { data: summary } = useGetShiftAssignmentSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmployeeShift | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<EmployeeShift | null>(null);
  const [deleteAssignment, { isLoading: isDeleting }] = useDeleteShiftAssignmentMutation();

  const rowActions = React.useMemo(
    () => ({
      onEdit: (assignment: EmployeeShift) => {
        setEditing(assignment);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => shiftAssignmentColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteAssignment(pendingDelete._id).unwrap();
      toast.success("Assignment removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the assignment");
    }
  };

  const assignments = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Shift assignments"
        description="Which shift each employee works, and from what date. People without an assignment fall back to the default shift."
        actions={
          access.canCreate && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setBulkOpen(true)}
            >
              <Users className="size-4" />
              Assign in bulk
            </Button>
          )
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Assigned today</StatLabel>
          <StatValue>{summary?.assigned ?? 0}</StatValue>
          <StatDescription>Out of {summary?.employeeCount ?? 0} active people</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>On the default shift</StatLabel>
          <StatValue>{summary?.unassigned ?? 0}</StatValue>
          <StatDescription>
            {summary?.defaultShiftName
              ? `Falling back to ${summary.defaultShiftName}`
              : "No default shift set yet"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Fixed shifts</StatLabel>
          <StatValue>{summary?.fixedCount ?? 0}</StatValue>
          <StatDescription>{summary?.weeklyCount ?? 0} vary by weekday</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Roster driven</StatLabel>
          <StatValue>{summary?.rosterCount ?? 0}</StatValue>
          <StatDescription>Days come from the published roster</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search people..."
        filters={listFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Assign shift"
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
        data={assignments}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        getRowId={(row) => row._id}
        mobileCard={(assignment) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{assignment.employee?.name ?? "—"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  From {formatDate(assignment.effectiveFrom)}
                </p>
              </div>
              <StatusBadge
                color={
                  !assignment.isActive ? "zinc" : assignment.isCurrent ? "green" : "muted"
                }
                label={
                  !assignment.isActive
                    ? "Inactive"
                    : assignment.isCurrent
                      ? "Current"
                      : "Scheduled"
                }
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {SHIFT_ASSIGNMENT_TYPE_LABELS[assignment.assignmentType]}
              </Badge>
              <AssignmentShape assignment={assignment} />
            </div>

            <div className="mt-3 border-t pt-3">
              <ShiftAssignmentRowMenu assignment={assignment} actions={rowActions} />
            </div>
          </div>
        )}
      />

      <ShiftAssignmentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        assignment={editing}
      />

      <BulkAssignDialog open={bulkOpen} onOpenChange={setBulkOpen} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove ${pendingDelete?.employee?.name ?? "this"} assignment?`}
        description="They fall back to the previous assignment, or to the company default shift."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
