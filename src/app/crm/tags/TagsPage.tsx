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
import { useDeleteTagMutation, useGetTagsQuery, useGetTagSummaryQuery } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Tag } from "@/types/domain/tag";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { tagColumns } from "./tags.columns";

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

export default function TagsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/settings/crm/tags");

  const { data, isLoading, isFetching } = useGetTagsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetTagSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Tag | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Tag | null>(null);
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditing(tag);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTag(pendingDelete._id).unwrap();
      toast.success("Tag deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the tag");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () =>
      tagColumns({
        onEdit: openEdit,
        onDelete: setPendingDelete,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const tags = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Tags"
        description="Colour-coded labels you can attach to any record — employees, teams, leads and more — and then filter by."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Tags</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Offered when tagging a record</StatDescription>
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
        searchPlaceholder="Search tags..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Add tag"

              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} tags. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} tags your plan allows. Delete one or upgrade your subscription
          to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={tags}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(tag) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <ColorChip color={tag.color} label={tag.name} />
              <StatusBadge
                color={tag.isActive ? "green" : "zinc"}
                label={tag.isActive ? "Active" : "Inactive"}
              />
            </div>
            {tag.description && (
              <p className="mt-3 text-xs text-muted-foreground">{tag.description}</p>
            )}
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <CardActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => openEdit(tag)}
                disabled={!access.canEdit}
              />
              <CardActionButton
                icon={Trash2}
                label="Delete"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(tag)}
                disabled={!access.canDelete}
              />
            </div>
          </div>
        )}
      />

      <ColorLabelFormModal
        kind="tag"
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The tag stops being offered on new records. Nothing else is removed."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
