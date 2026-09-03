import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetAiAllowanceQuery } from "@/redux/apis/aiApis";
import {
  useDeleteDesignationMutation,
  useGetDesignationSummaryQuery,
  useGetDesignationsQuery,
} from "@/redux/apis/designationApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Designation } from "@/types/domain/designation";
import { Bot, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AiDesignationsModal } from "./components/AiDesignationsModal";
import { DesignationFormModal } from "./components/DesignationFormModal";
import { DesignationRowActions, designationColumns } from "./designations.columns";

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

export default function DesignationsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/directory/designations");

  const { data, isLoading, isFetching } = useGetDesignationsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetDesignationSummaryQuery();

  const { data: ai } = useGetAiAllowanceQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [aiOpen, setAiOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Designation | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Designation | null>(null);
  const [deleteDesignation, { isLoading: isDeleting }] = useDeleteDesignationMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (designation: Designation) => {
    setEditing(designation);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteDesignation(pendingDelete._id).unwrap();
      toast.success("Designation deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the designation");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => designationColumns(rowActions), [rowActions]);

  const designations = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Designations"
        description="Job titles available when hiring or promoting. An employee can hold more than one."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Designations</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Offered when assigning an employee</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Unassigned employees</StatLabel>
          <StatValue>{summary?.unassignedEmployeeCount ?? 0}</StatValue>
          <StatDescription>People without a designation yet</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search designations..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <>
              {ai?.isConfigured && (
                <ActionButton
                  icon={Bot}
                  label="Generate with AI"
                  variant="outline"
                  onClick={() => setAiOpen(true)}
                  disabled={isLimitReached}
                  title={
                    isLimitReached
                      ? `Your plan allows ${limit} designations. Delete one or upgrade to add more.`
                      : undefined
                  }
                />
              )}
              <ActionButton
                icon={Plus}
                label="New designation"
                onClick={openCreate}
                disabled={isLimitReached}
                title={
                  isLimitReached
                    ? `Your plan allows ${limit} designations. Delete one or upgrade to add more.`
                    : undefined
                }
              />
            </>
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} designations your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={designations}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(designation) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{designation.name}</p>
                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                  {designation.code}
                </p>
              </div>
              <StatusBadge
                color={designation.isActive ? "green" : "zinc"}
                label={designation.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Level</dt>
                <dd className="font-medium">{designation.level || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Employees</dt>
                <dd className="font-medium">{designation.employeeCount}</dd>
              </div>
            </dl>

            {designation.description && (
              <p className="mt-3 text-xs text-muted-foreground">{designation.description}</p>
            )}

            <div className="mt-3 border-t pt-3">
              <DesignationRowActions designation={designation} {...rowActions} />
            </div>
          </div>
        )}
      />

      <DesignationFormModal open={formOpen} onOpenChange={setFormOpen} designation={editing} />

      <AiDesignationsModal
        open={aiOpen}
        onOpenChange={setAiOpen}
        remaining={limit === null ? null : Math.max(0, limit - used)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="A designation still held by employees cannot be deleted. Reassign them first."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
