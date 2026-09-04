import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatNumber } from "@/lib/amount";
import {
  useDeleteCommunityGroupMutation,
  useGetCommunityGroupSummaryQuery,
  useGetCommunityGroupsQuery,
  useJoinCommunityGroupMutation,
  useLeaveCommunityGroupMutation,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  COMMUNITY_GROUP_VISIBILITIES,
  COMMUNITY_GROUP_VISIBILITY_COLORS,
  COMMUNITY_GROUP_VISIBILITY_LABELS,
  type CommunityGroup,
  type CommunityGroupVisibility,
} from "@/types/domain/community";
import type { ColumnDef } from "@tanstack/react-table";
import { LogIn, LogOut, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { GroupFormModal } from "./components/GroupFormModal";

const FILTERS: FilterConfig[] = [
  {
    name: "visibility",
    label: "Visibility",
    type: "select",
    options: COMMUNITY_GROUP_VISIBILITIES.map((value) => ({
      value,
      label: COMMUNITY_GROUP_VISIBILITY_LABELS[value],
    })),
  },
  {
    name: "isArchived",
    label: "State",
    type: "select",
    options: [
      { label: "Active", value: "false" },
      { label: "Archived", value: "true" },
    ],
  },
  {
    name: "joinedByMe",
    label: "Membership",
    type: "select",
    options: [{ label: "Only mine", value: "true" }],
  },
];

export default function CommunityGroupsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/company/community/groups");

  const { data, isLoading, isFetching } = useGetCommunityGroupsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    visibility: filters.visibility as CommunityGroupVisibility | undefined,
    isArchived: filters.isArchived === undefined ? undefined : filters.isArchived === "true",
    joinedByMe: filters.joinedByMe === "true" ? true : undefined,
  });

  const { data: summary } = useGetCommunityGroupSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CommunityGroup | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<CommunityGroup | null>(null);

  const [deleteGroup, { isLoading: isDeleting }] = useDeleteCommunityGroupMutation();
  const [joinGroup] = useJoinCommunityGroupMutation();
  const [leaveGroup] = useLeaveCommunityGroupMutation();

  const onEdit = React.useCallback((group: CommunityGroup) => {
    setEditing(group);
    setFormOpen(true);
  }, []);

  const toggleMembership = React.useCallback(
    async (group: CommunityGroup) => {
      try {
        if (group.isJoined) {
          await leaveGroup(group._id).unwrap();
          toast.success(`You left ${group.name}`);
        } else {
          await joinGroup(group._id).unwrap();
          toast.success(`You joined ${group.name}`);
        }
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not change your membership");
      }
    },
    [joinGroup, leaveGroup]
  );

  const rowMenu = React.useCallback(
    (group: CommunityGroup) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={group.isJoined ? "outline" : "default"}
          size="sm"
          className="cursor-pointer"
          disabled={group.isArchived}
          onClick={() => void toggleMembership(group)}
        >
          {group.isJoined ? <LogOut className="size-4" /> : <LogIn className="size-4" />}
          {group.isJoined ? "Leave" : "Join"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer"
              aria-label={`More actions for ${group.name}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={!access.canEdit} onSelect={() => onEdit(group)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={!access.canDelete}
              onSelect={() => setPendingDelete(group)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    [access.canEdit, access.canDelete, onEdit, toggleMembership]
  );

  const columns = React.useMemo<ColumnDef<CommunityGroup>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Group",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: row.original.color }}
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {row.original.description || `/${row.original.slug}`}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "visibility",
        header: "Visibility",
        cell: ({ row }) => (
          <StatusBadge
            color={COMMUNITY_GROUP_VISIBILITY_COLORS[row.original.visibility]}
            label={COMMUNITY_GROUP_VISIBILITY_LABELS[row.original.visibility]}
          />
        ),
      },
      {
        accessorKey: "memberCount",
        header: () => <div className="text-right">Members</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm">{formatNumber(row.original.memberCount)}</div>
        ),
      },
      {
        accessorKey: "postCount",
        header: () => <div className="text-right">Posts</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm">{formatNumber(row.original.postCount)}</div>
        ),
      },
      {
        id: "state",
        header: "State",
        cell: ({ row }) => (
          <StatusBadge
            color={row.original.isArchived ? "zinc" : "green"}
            label={row.original.isArchived ? "Archived" : "Active"}
          />
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => rowMenu(row.original),
      },
    ],
    [rowMenu]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteGroup(pendingDelete._id).unwrap();
      toast.success("Group deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the group");
    }
  };

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const limit = summary?.limit ?? access.limit;
  const used = summary?.used ?? 0;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Community groups"
        description="Smaller spaces inside the community, and who belongs to each."
        actions={<BackLink to="/company/community/overview" label="Community overview" />}
      />

      <StatGrid>
        <Stat>
          <StatLabel>Groups</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{formatNumber(summary?.activeCount)}</StatValue>
          <StatDescription>{formatNumber(summary?.archivedCount)} archived</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Open to everyone</StatLabel>
          <StatValue>{formatNumber(summary?.openCount)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.privateCount)} closed or secret
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Average size</StatLabel>
          <StatValue>{summary?.averageMembers ?? 0}</StatValue>
          <StatDescription>Members per active group</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search groups..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New group"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} groups. Delete one or upgrade to add more.`
                  : undefined
              }
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          You have used all {limit} groups your plan allows. Delete one or upgrade your plan to add
          more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        getRowId={(row) => row._id}
        mobileCard={(group) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{group.name}</p>
                  <p className="truncate text-xs text-muted-foreground">/{group.slug}</p>
                </div>
              </div>
              <StatusBadge
                color={COMMUNITY_GROUP_VISIBILITY_COLORS[group.visibility]}
                label={COMMUNITY_GROUP_VISIBILITY_LABELS[group.visibility]}
              />
            </div>

            {group.description && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                {group.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {group.postCount} post{group.postCount === 1 ? "" : "s"}
              </Badge>
              {group.isArchived && (
                <Badge variant="outline" className="text-[10px]">
                  Archived
                </Badge>
              )}
            </div>

            <div className="mt-3 border-t pt-3">{rowMenu(group)}</div>
          </div>
        )}
      />

      <GroupFormModal open={formOpen} onOpenChange={setFormOpen} group={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The group goes, and its posts stop showing in the feed."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
