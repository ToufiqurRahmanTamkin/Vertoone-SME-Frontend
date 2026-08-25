import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { GUIDE_AUDIENCE_LABELS, GUIDE_CATEGORY_LABELS, toOptions } from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useDeleteGuideMutation, useGetGuidesQuery } from "@/redux/apis/guideApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { GuideAudience, GuideCategory, UserGuide } from "@/types/domain/guide";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { GuideFormModal } from "./components/GuideFormModal";
import { guideColumns } from "./guides.columns";

const FILTERS: FilterConfig[] = [
  { name: "category", label: "Category", type: "select", options: toOptions(GUIDE_CATEGORY_LABELS) },
  { name: "audience", label: "Audience", type: "select", options: toOptions(GUIDE_AUDIENCE_LABELS) },
  {
    name: "isPublished",
    label: "Status",
    type: "select",
    options: [
      { label: "Published", value: "true" },
      { label: "Draft", value: "false" },
    ],
  },
];

export default function GuidesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();

  const { data, isLoading, isFetching } = useGetGuidesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    category: filters.category as GuideCategory | undefined,
    audience: filters.audience as GuideAudience | undefined,
    // Forwarded as the literal "true"/"false" the backend's schema expects.
    isPublished: filters.isPublished as unknown as boolean | undefined,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UserGuide | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<UserGuide | null>(null);
  const [deleteGuide, { isLoading: isDeleting }] = useDeleteGuideMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (guide: UserGuide) => {
    setEditing(guide);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteGuide(pendingDelete._id).unwrap();
      toast.success("Guide deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the guide");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () => guideColumns({ onEdit: openEdit, onDelete: setPendingDelete }),
    []
  );

  const guides = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="User Guides"
        description="Help articles for the console. Drafts stay hidden until published."
      />

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search guides..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            New guide
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={guides}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(guide) => (
          <div className="space-y-2 text-xs">
            {guide.summary && <p className="text-muted-foreground">{guide.summary}</p>}
            <p className="line-clamp-6 whitespace-pre-wrap">{guide.content}</p>
          </div>
        )}
        mobileCard={(guide) => (
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{guide.title}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  /{guide.slug}
                </p>
              </div>
              {guide.isPublished ? (
                <StatusBadge color="green" label="Published" />
              ) : (
                <StatusBadge color="amber" label="Draft" />
              )}
            </div>
            {guide.summary && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{guide.summary}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {GUIDE_CATEGORY_LABELS[guide.category]} · {GUIDE_AUDIENCE_LABELS[guide.audience]}
            </p>
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => openEdit(guide)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(guide)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      />

      <GuideFormModal open={formOpen} onOpenChange={setFormOpen} guide={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="This permanently removes the guide. This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
