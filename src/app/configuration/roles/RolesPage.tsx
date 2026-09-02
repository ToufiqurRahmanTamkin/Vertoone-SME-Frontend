import { ActionButton, CardActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteRoleMutation,
  useGetRoleSummaryQuery,
  useGetRolesQuery,
} from "@/redux/apis/roleApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { totalAssignments, type Role } from "@/types/domain/role";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { RoleFormModal } from "./components/RoleFormModal";
import { roleColumns } from "./roles.columns";

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

const describeAllowance = (used: number, limit: number | null): string =>
  limit === null
    ? `${used} in use · unlimited on your plan`
    : `${used} of ${limit} allowed by your plan`;

export default function RolesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/settings/users-and-roles/roles-and-permissions");

  const { data, isLoading, isFetching } = useGetRolesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });
  const { data: summary } = useGetRoleSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Role | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Role | null>(null);
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteRole(pendingDelete._id).unwrap();
      toast.success("Role removed");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the role");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () =>
      roleColumns({
        onEdit: openEdit,
        onDelete: setPendingDelete,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const roles = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Build reusable permission sets, then hand them to a person, a department, a designation or a team."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Roles</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>{describeAllowance(used, limit)}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Granting access right now</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>People with a role</StatLabel>
          <StatValue>{summary?.assignedUserCount ?? 0}</StatValue>
          <StatDescription>Accounts holding at least one role directly</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search roles..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Add role"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} roles. Remove one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(role) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{role.name}</p>
                <p className="truncate text-xs text-muted-foreground">{role.description || "—"}</p>
              </div>
              <StatusBadge
                color={role.isActive ? "green" : "zinc"}
                label={role.isActive ? "Active" : "Inactive"}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {role.moduleCount} menus
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {totalAssignments(role.assignments)} assignments
              </Badge>
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <CardActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => openEdit(role)}
                disabled={!access.canEdit}
              />
              <CardActionButton
                icon={Trash2}
                label="Remove"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(role)}
                disabled={!access.canDelete || totalAssignments(role.assignments) > 0}
              />
            </div>
          </div>
        )}
      />

      <RoleFormModal open={formOpen} onOpenChange={setFormOpen} role={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.name ?? ""}"?`}
        description="Everyone holding this role loses the access it granted, immediately."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
