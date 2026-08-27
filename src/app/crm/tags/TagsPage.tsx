import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteTagMutation,
  useGetTagsQuery,
  useGetTagSummaryQuery,
} from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Tag } from "@/types/domain/tag";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { TagFormModal } from "./components/TagFormModal";
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
  const access = useModulePermission("/crm/tags");

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
        description="Colour-coded labels your team can attach to records to group and find them quickly."
      />

      <div className="grid gap-3 sm:grid-cols-3">
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
            {limit === null
              ? "Your plan sets no cap"
              : "Left before you reach the plan limit"}
          </StatDescription>
        </Stat>
      </div>

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
            <Button
              className="cursor-pointer"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} tags. Delete one or upgrade to add more.`
                  : undefined
              }
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add tag
            </Button>
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} tags your plan allows. Delete one or upgrade your
          subscription to add more.
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
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => openEdit(tag)}
                disabled={!access.canEdit}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(tag)}
                disabled={!access.canDelete}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      />

      <TagFormModal open={formOpen} onOpenChange={setFormOpen} tag={editing} />

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
