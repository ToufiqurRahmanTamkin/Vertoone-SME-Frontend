import { ActionButton, CardActionButton } from "@/components/shared/action-button";
import { ColorLabelFormModal } from "@/components/shared/color-label-form-modal";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteLeadSourceMutation,
  useGetLeadSourcesQuery,
  useGetLeadSourceSummaryQuery,
} from "@/redux/apis/leadSourceApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { LeadSource } from "@/types/domain/leadSource";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { leadSourceColumns } from "./lead-sources.columns";

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

export default function LeadSourcesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/settings/crm/lead-sources");

  const { data, isLoading, isFetching } = useGetLeadSourcesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetLeadSourceSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LeadSource | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<LeadSource | null>(null);
  const [deleteLeadSource, { isLoading: isDeleting }] = useDeleteLeadSourceMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (source: LeadSource) => {
    setEditing(source);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteLeadSource(pendingDelete._id).unwrap();
      toast.success("Lead source deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the lead source");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () =>
      leadSourceColumns({
        onEdit: openEdit,
        onDelete: setPendingDelete,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const sources = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Lead Sources"
        description="Where your enquiries come from, colour-coded so you can see at a glance which channels are working."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Lead sources</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Offered when logging a record</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Remaining</StatLabel>
          <StatValue>{summary?.remaining ?? "∞"}</StatValue>
          <StatDescription>
            {limit === null ? "Your plan sets no cap" : "Left before you reach the plan limit"}
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search lead sources..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Add lead source"

              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} lead sources. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} lead sources your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={sources}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(source) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <ColorChip color={source.color} label={source.name} />
              <StatusBadge
                color={source.isActive ? "green" : "zinc"}
                label={source.isActive ? "Active" : "Inactive"}
              />
            </div>
            {source.description && (
              <p className="mt-3 text-xs text-muted-foreground">{source.description}</p>
            )}
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <CardActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => openEdit(source)}
                disabled={!access.canEdit}
              />
              <CardActionButton
                icon={Trash2}
                label="Delete"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(source)}
                disabled={!access.canDelete}
              />
            </div>
          </div>
        )}
      />

      <ColorLabelFormModal
        kind="leadSource"
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The lead source stops being offered on new records. Nothing else is removed."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
