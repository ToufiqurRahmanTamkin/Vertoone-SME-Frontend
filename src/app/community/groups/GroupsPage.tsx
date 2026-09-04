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
  useCancelCommunityJoinRequestMutation,
  useDeleteCommunityGroupMutation,
  useGetCommunityGroupSummaryQuery,
  useGetCommunityGroupsQuery,
  useGetCommunityJoinRequestsQuery,
  useJoinCommunityGroupMutation,
  useLeaveCommunityGroupMutation,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  COMMUNITY_GROUP_JOIN_MODE_LABELS,
  COMMUNITY_GROUP_VISIBILITIES,
  COMMUNITY_GROUP_VISIBILITY_COLORS,
  COMMUNITY_GROUP_VISIBILITY_LABELS,
  type CommunityGroup,
  type CommunityGroupVisibility,
} from "@/types/domain/community";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Inbox,
  LogIn,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { GroupAvatar } from "./components/GroupAvatar";
import { GroupFormModal } from "./components/GroupFormModal";
import { JoinRequestsModal } from "./components/JoinRequestsModal";
import { RequestToJoinModal } from "./components/RequestToJoinModal";

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
  const chatAccess = useModulePermission("/company/community/chats");

  const { data, isLoading, isFetching } = useGetCommunityGroupsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    visibility: filters.visibility as CommunityGroupVisibility | undefined,
    isArchived: filters.isArchived === undefined ? undefined : filters.isArchived === "true",
    joinedByMe: filters.joinedByMe === "true" ? true : undefined,
  });

  const { data: summary } = useGetCommunityGroupSummaryQuery();
  const { data: myRequests } = useGetCommunityJoinRequestsQuery({
    mineOnly: true,
    status: "PENDING",
    limit: 100,
  });

  const requestIdByGroup = React.useMemo(() => {
    const entries = new Map<string, string>();
    (myRequests?.data ?? []).forEach((request) => entries.set(request.groupId, request._id));
    return entries;
  }, [myRequests]);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CommunityGroup | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<CommunityGroup | null>(null);
  const [requestingFor, setRequestingFor] = React.useState<CommunityGroup | null>(null);
  const [reviewing, setReviewing] = React.useState<CommunityGroup | null>(null);

  const [deleteGroup, { isLoading: isDeleting }] = useDeleteCommunityGroupMutation();
  const [joinGroup] = useJoinCommunityGroupMutation();
  const [leaveGroup] = useLeaveCommunityGroupMutation();
  const [cancelRequest] = useCancelCommunityJoinRequestMutation();

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

  const withdrawRequest = React.useCallback(
    async (group: CommunityGroup) => {
      const requestId = requestIdByGroup.get(group._id);
      if (!requestId) return;

      try {
        await cancelRequest(requestId).unwrap();
        toast.success(`Withdrew your request to join ${group.name}`);
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not withdraw your request");
      }
    },
    [cancelRequest, requestIdByGroup]
  );

  const membershipButton = React.useCallback(
    (group: CommunityGroup) => {
      if (group.isJoined) {
        return (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={group.isArchived}
            onClick={() => void toggleMembership(group)}
          >
            <LogOut className="size-4" />
            Leave
          </Button>
        );
      }

      if (group.hasPendingRequest) {
        return (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={!requestIdByGroup.has(group._id)}
            onClick={() => void withdrawRequest(group)}
          >
            <Undo2 className="size-4" />
            Withdraw
          </Button>
        );
      }

      if (group.canRequestToJoin) {
        return (
          <Button size="sm" className="cursor-pointer" onClick={() => setRequestingFor(group)}>
            <Send className="size-4" />
            Request
          </Button>
        );
      }

      return (
        <Button
          size="sm"
          className="cursor-pointer"
          disabled={!group.canJoin}
          title={
            group.canJoin
              ? undefined
              : group.isArchived
                ? "This group is archived"
                : "A moderator has to add you to this group"
          }
          onClick={() => void toggleMembership(group)}
        >
          <LogIn className="size-4" />
          Join
        </Button>
      );
    },
    [requestIdByGroup, toggleMembership, withdrawRequest]
  );

  const rowMenu = React.useCallback(
    (group: CommunityGroup) => (
      <div className="flex items-center justify-end gap-2">
        {membershipButton(group)}

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
            {group.isJoined && chatAccess.canView && (
              <DropdownMenuItem asChild>
                <Link to={`/company/community/chats?groupId=${group._id}`}>
                  <MessageCircle className="size-4" />
                  Open chat
                </Link>
              </DropdownMenuItem>
            )}
            {group.isModerator && (
              <DropdownMenuItem onSelect={() => setReviewing(group)}>
                <Inbox className="size-4" />
                Requests
                {group.pendingRequestCount > 0 && (
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {group.pendingRequestCount}
                  </Badge>
                )}
              </DropdownMenuItem>
            )}
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
    [access.canEdit, access.canDelete, chatAccess.canView, membershipButton, onEdit]
  );

  const columns = React.useMemo<ColumnDef<CommunityGroup>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Group",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <GroupAvatar
              name={row.original.name}
              color={row.original.color}
              logoUrl={row.original.logoUrl}
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
          <div className="space-y-1">
            <StatusBadge
              color={COMMUNITY_GROUP_VISIBILITY_COLORS[row.original.visibility]}
              label={COMMUNITY_GROUP_VISIBILITY_LABELS[row.original.visibility]}
            />
            <p className="text-xs text-muted-foreground">
              {COMMUNITY_GROUP_JOIN_MODE_LABELS[row.original.joinMode]}
            </p>
          </div>
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
          <div className="space-y-1">
            <StatusBadge
              color={row.original.isArchived ? "zinc" : "green"}
              label={row.original.isArchived ? "Archived" : "Active"}
            />
            {row.original.isModerator && row.original.pendingRequestCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                {row.original.pendingRequestCount} waiting
              </p>
            )}
          </div>
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

      <StatGrid className="lg:grid-cols-4">
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
          <StatLabel>Waiting to join</StatLabel>
          <StatValue>{formatNumber(summary?.pendingRequestCount)}</StatValue>
          <StatDescription>
            Average of {summary?.averageMembers ?? 0} members per active group
          </StatDescription>
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
          <div className="overflow-hidden rounded-xl border bg-card">
            <div
              className="h-20 w-full bg-cover bg-center"
              style={{
                backgroundColor: group.color,
                backgroundImage: group.bannerUrl ? `url(${group.bannerUrl})` : undefined,
              }}
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <GroupAvatar
                    name={group.name}
                    color={group.color}
                    logoUrl={group.logoUrl}
                    className="-mt-8 size-12 border-2 border-background"
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
                <Badge variant="outline" className="text-[10px]">
                  {COMMUNITY_GROUP_JOIN_MODE_LABELS[group.joinMode]}
                </Badge>
                {group.isArchived && (
                  <Badge variant="outline" className="text-[10px]">
                    Archived
                  </Badge>
                )}
                {group.isModerator && group.pendingRequestCount > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {group.pendingRequestCount} waiting
                  </Badge>
                )}
              </div>

              <div className="mt-3 border-t pt-3">{rowMenu(group)}</div>
            </div>
          </div>
        )}
      />

      <GroupFormModal open={formOpen} onOpenChange={setFormOpen} group={editing} />

      <RequestToJoinModal
        open={Boolean(requestingFor)}
        onOpenChange={(open) => !open && setRequestingFor(null)}
        group={requestingFor}
      />

      <JoinRequestsModal
        open={Boolean(reviewing)}
        onOpenChange={(open) => !open && setReviewing(null)}
        group={reviewing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The group goes, along with its posts, its chat and any waiting requests."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
