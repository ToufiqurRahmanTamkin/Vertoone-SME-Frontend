import { ActionButton, CardActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { USER_STATUS_COLORS, USER_STATUS_LABELS } from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteTeamMemberMutation,
  useGetTeamMembersQuery,
  useGetTeamSummaryQuery,
} from "@/redux/apis/teamMemberApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { UserStatus } from "@/types/domain/auth";
import type { TeamMember } from "@/types/domain/teamMember";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { TeamMemberFormModal } from "./components/TeamMemberFormModal";
import { teamMemberColumns } from "./team-members.columns";

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

const describeAllowance = (used: number, limit: number | null): string =>
  limit === null
    ? `${used} in use · unlimited on your plan`
    : `${used} of ${limit} allowed by your plan`;

export default function TeamMembersPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/settings/access/users");

  const { data, isLoading, isFetching } = useGetTeamMembersQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as UserStatus | undefined,
  });
  const { data: summary } = useGetTeamSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TeamMember | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<TeamMember | null>(null);
  const [deleteMember, { isLoading: isDeleting }] = useDeleteTeamMemberMutation();

  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditing(member);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMember(pendingDelete._id).unwrap();
      toast.success("User removed");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the user");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () =>
      teamMemberColumns({
        onEdit: openEdit,
        onDelete: setPendingDelete,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const members = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Users"
        description="People who can sign in to this workspace. Give each of them roles, direct menu access, or both."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Users</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>{describeAllowance(used, limit)}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Can sign in right now</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Remaining</StatLabel>
          <StatValue>{summary?.remaining ?? "∞"}</StatValue>
          <StatDescription>
            {limit === null
              ? "Your plan sets no cap on users"
              : "Seats left before you reach the plan limit"}
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search users..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Add user"

              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} users. Remove one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} user seats on your plan. Remove a user or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={members}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(member) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">{member.email}</p>
              </div>
              <StatusBadge
                color={USER_STATUS_COLORS[member.status]}
                label={USER_STATUS_LABELS[member.status]}
              />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-[10px]">
                {
                  Object.values(member.effectivePermissions).filter(
                    (permission) => permission.canView
                  ).length
                }{" "}
                menus
              </Badge>
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <CardActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => openEdit(member)}
                disabled={!access.canEdit}
              />
              <CardActionButton
                icon={Trash2}
                label="Remove"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(member)}
                disabled={!access.canDelete}
              />
            </div>
          </div>
        )}
      />

      <TeamMemberFormModal open={formOpen} onOpenChange={setFormOpen} member={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.name ?? ""}"?`}
        description="They are signed out immediately and lose access to this workspace."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
