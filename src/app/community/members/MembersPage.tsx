import { MemberAvatar } from "@/app/community/members/components/MemberAvatar";
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
import { safeDistanceToNow } from "@/lib/date";
import {
  useGetCommunityMemberSummaryQuery,
  useGetCommunityMembersQuery,
  useRemoveCommunityMemberMutation,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  COMMUNITY_MEMBER_ROLES,
  COMMUNITY_MEMBER_ROLE_COLORS,
  COMMUNITY_MEMBER_ROLE_LABELS,
  COMMUNITY_MEMBER_STATUSES,
  COMMUNITY_MEMBER_STATUS_COLORS,
  COMMUNITY_MEMBER_STATUS_LABELS,
  type CommunityMember,
  type CommunityMemberRole,
  type CommunityMemberStatus,
} from "@/types/domain/community";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { EnrolMembersModal } from "./components/EnrolMembersModal";
import { MemberFormModal } from "./components/MemberFormModal";

const FILTERS: FilterConfig[] = [
  {
    name: "role",
    label: "Role",
    type: "select",
    options: COMMUNITY_MEMBER_ROLES.map((value) => ({
      value,
      label: COMMUNITY_MEMBER_ROLE_LABELS[value],
    })),
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: COMMUNITY_MEMBER_STATUSES.map((value) => ({
      value,
      label: COMMUNITY_MEMBER_STATUS_LABELS[value],
    })),
  },
];

export default function CommunityMembersPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/company/community/members");

  const { data, isLoading, isFetching } = useGetCommunityMembersQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    role: filters.role as CommunityMemberRole | undefined,
    status: filters.status as CommunityMemberStatus | undefined,
  });

  const { data: summary } = useGetCommunityMemberSummaryQuery();

  const [enrolOpen, setEnrolOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CommunityMember | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<CommunityMember | null>(null);
  const [removeMember, { isLoading: isRemoving }] = useRemoveCommunityMemberMutation();

  const onEdit = React.useCallback((member: CommunityMember) => setEditing(member), []);

  const rowMenu = React.useCallback(
    (member: CommunityMember) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer"
              aria-label={`More actions for ${member.displayName}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={!access.canEdit} onSelect={() => onEdit(member)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={!access.canDelete}
              onSelect={() => setPendingDelete(member)}
            >
              <Trash2 className="size-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    [access.canEdit, access.canDelete, onEdit]
  );

  const columns = React.useMemo<ColumnDef<CommunityMember>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: "Member",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <MemberAvatar
              name={row.original.displayName}
              avatarUrl={row.original.avatarUrl}
            />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {row.original.displayName}
                {row.original.isMe && (
                  <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {row.original.headline || row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <StatusBadge
            color={COMMUNITY_MEMBER_ROLE_COLORS[row.original.role]}
            label={COMMUNITY_MEMBER_ROLE_LABELS[row.original.role]}
          />
        ),
      },
      {
        accessorKey: "points",
        header: () => <div className="text-right">Points</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm font-medium">
            {formatNumber(row.original.points)}
          </div>
        ),
      },
      {
        id: "contribution",
        header: () => <div className="text-right">Posts · Comments</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm text-muted-foreground">
            {formatNumber(row.original.postCount)} · {formatNumber(row.original.commentCount)}
          </div>
        ),
      },
      {
        accessorKey: "groupCount",
        header: () => <div className="text-right">Groups</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm">{formatNumber(row.original.groupCount)}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            color={COMMUNITY_MEMBER_STATUS_COLORS[row.original.status]}
            label={COMMUNITY_MEMBER_STATUS_LABELS[row.original.status]}
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
      await removeMember(pendingDelete._id).unwrap();
      toast.success("Member removed from the community");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the member");
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
        title="Community members"
        description="Everybody from your system who has been let into the community, and what each of them may do."
        actions={<BackLink to="/company/community/overview" label="Community overview" />}
      />

      <StatGrid>
        <Stat>
          <StatLabel>Members</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{formatNumber(summary?.activeCount)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.suspendedCount)} suspended ·{" "}
            {formatNumber(summary?.invitedCount)} invited
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Moderators</StatLabel>
          <StatValue>{formatNumber(summary?.moderatorCount)}</StatValue>
          <StatDescription>Admins and moderators together</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Points earned</StatLabel>
          <StatValue>{formatNumber(summary?.totalPoints)}</StatValue>
          <StatDescription>Across every member</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search members..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={UserPlus}
              label="Add members"
              onClick={() => setEnrolOpen(true)}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} members. Remove one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          You have used all {limit} community members your plan allows. Remove one or upgrade your
          plan to add more.
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
        mobileCard={(member) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <MemberAvatar name={member.displayName} avatarUrl={member.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{member.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.headline || member.email}
                  </p>
                </div>
              </div>
              <StatusBadge
                color={COMMUNITY_MEMBER_STATUS_COLORS[member.status]}
                label={COMMUNITY_MEMBER_STATUS_LABELS[member.status]}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {COMMUNITY_MEMBER_ROLE_LABELS[member.role]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {formatNumber(member.points)} points
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {formatNumber(member.postCount)} posts
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Joined {safeDistanceToNow(member.joinedAt)}
              </Badge>
            </div>

            <div className="mt-3 border-t pt-3">{rowMenu(member)}</div>
          </div>
        )}
      />

      <EnrolMembersModal
        open={enrolOpen}
        onOpenChange={setEnrolOpen}
        remaining={summary?.remaining ?? null}
      />

      <MemberFormModal
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        member={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.displayName ?? ""}"?`}
        description="They drop out of every group. Their posts stay where they are."
        confirmText="Remove"
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={confirmDelete}
      />
    </>
  );
}
