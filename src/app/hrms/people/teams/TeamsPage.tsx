import { ActionButton, CardActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import {
  useDeleteTeamMutation,
  useGetTeamsQuery,
  useGetTeamsSummaryQuery,
} from "@/redux/apis/teamApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Team } from "@/types/domain/team";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { TeamFormModal } from "./components/TeamFormModal";
import { teamColumns } from "./teams.columns";

export default function TeamsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/people/teams");

  const { data: tagOptions = [] } = useGetTagOptionsQuery({ scope: "TEAM" });
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const { data, isLoading, isFetching } = useGetTeamsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    teamLeadId: filters.teamLeadId as string | undefined,
    memberId: filters.memberId as string | undefined,
    tagIds: filters.tagIds as string | undefined,
  });

  const { data: summary } = useGetTeamsSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Team | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Team | null>(null);
  const [deleteTeam, { isLoading: isDeleting }] = useDeleteTeamMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "isActive",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
      {
        name: "teamLeadId",
        label: "Lead",
        type: "select",
        options: employeeOptions.map((option) => ({ label: option.name, value: option._id })),
      },
      {
        name: "memberId",
        label: "Member",
        type: "select",
        options: employeeOptions.map((option) => ({ label: option.name, value: option._id })),
      },
      {
        name: "tagIds",
        label: "Tag",
        type: "select",
        options: tagOptions.map((tag) => ({ label: tag.name, value: tag._id })),
      },
    ],
    [employeeOptions, tagOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditing(team);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTeam(pendingDelete._id).unwrap();
      toast.success("Team deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the team");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () =>
      teamColumns({
        onEdit: openEdit,
        onDelete: setPendingDelete,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const teams = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Teams"
        description="Groups of employees, each with a team lead and a supervisor."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Teams</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Currently in use</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Employees assigned</StatLabel>
          <StatValue>{summary?.assignedEmployeeCount ?? 0}</StatValue>
          <StatDescription>People who belong to at least one team</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search teams..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New team"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} teams. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} teams your plan allows. Delete one or upgrade your subscription
          to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={teams}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(team) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <ColorChip color={team.color} label={team.name} />
              <StatusBadge
                color={team.isActive ? "green" : "zinc"}
                label={team.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Team lead</dt>
                <dd className="font-medium">{team.teamLead?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Supervisor</dt>
                <dd className="font-medium">{team.supervisor?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Members</dt>
                <dd className="font-medium">{team.memberCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Department</dt>
                <dd className="font-medium">{team.department || "—"}</dd>
              </div>
            </dl>

            {team.tags.length > 0 && (
              <div className="mt-3">
                <TagList tags={team.tags} max={4} />
              </div>
            )}

            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <CardActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => openEdit(team)}
                disabled={!access.canEdit}
              />
              <CardActionButton
                icon={Trash2}
                label="Delete"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(team)}
                disabled={!access.canDelete}
              />
            </div>
          </div>
        )}
      />

      <TeamFormModal open={formOpen} onOpenChange={setFormOpen} team={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The team is removed. The employees in it are not touched."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
