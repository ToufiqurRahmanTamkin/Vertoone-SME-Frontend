import { ActionButton, CardActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { USER_STATUS_COLORS, USER_STATUS_LABELS } from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteMaintainerMutation,
  useGetMaintainerSummaryQuery,
  useGetMaintainersQuery,
} from "@/redux/apis/maintainerApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { UserStatus } from "@/types/domain/auth";
import type { Maintainer } from "@/types/domain/maintainer";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AccessBadge } from "./components/AccessBadge";
import { MaintainerFormModal } from "./components/MaintainerFormModal";
import { maintainerColumns } from "./maintainers.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  },
];

export default function MaintainersPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/platform/maintainers");

  const { data, isLoading, isFetching } = useGetMaintainersQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as UserStatus | undefined,
  });
  const { data: summary } = useGetMaintainerSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Maintainer | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Maintainer | null>(null);
  const [deleteMaintainer, { isLoading: isDeleting }] = useDeleteMaintainerMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (maintainer: Maintainer) => {
    setEditing(maintainer);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMaintainer(pendingDelete._id).unwrap();
      toast.success("Maintainer removed");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the maintainer");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () =>
      maintainerColumns({
        onEdit: openEdit,
        onDelete: setPendingDelete,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const maintainers = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Maintainers"
        description="Staff who run this platform on your behalf. Each one signs in with their own credentials and reaches only the menus you grant them."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Maintainers</StatLabel>
          <StatValue>{summary?.total ?? 0}</StatValue>
          <StatDescription>Accounts that can act for you</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.active ?? 0}</StatValue>
          <StatDescription>Can sign in right now</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Inactive</StatLabel>
          <StatValue>{summary?.inactive ?? 0}</StatValue>
          <StatDescription>Suspended until you reactivate them</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search maintainers..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton icon={Plus} label="Add maintainer" onClick={openCreate} />
          )
        }
      />

      <DataTable
        columns={columns}
        data={maintainers}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(maintainer) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{maintainer.name}</p>
                <p className="truncate text-xs text-muted-foreground">{maintainer.email}</p>
              </div>
              <StatusBadge
                color={USER_STATUS_COLORS[maintainer.status]}
                label={USER_STATUS_LABELS[maintainer.status]}
              />
            </div>
            <dl className="mt-3 space-y-1.5 border-t pt-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="truncate">{maintainer.phone || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Platform access</dt>
                <dd>
                  <AccessBadge maintainer={maintainer} />
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <CardActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => openEdit(maintainer)}
                disabled={!access.canEdit}
              />
              <CardActionButton
                icon={Trash2}
                label="Remove"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(maintainer)}
                disabled={!access.canDelete}
              />
            </div>
          </div>
        )}
      />

      <MaintainerFormModal open={formOpen} onOpenChange={setFormOpen} maintainer={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.name ?? ""}"?`}
        description="They are signed out immediately and lose every platform menu you granted them."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
