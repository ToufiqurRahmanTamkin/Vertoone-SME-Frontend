import { ActionButton } from "@/components/shared/action-button";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteAnnouncementMutation,
  useGetAnnouncementSummaryQuery,
  useGetAnnouncementsQuery,
  usePublishAnnouncementMutation,
} from "@/redux/apis/announcementApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_PRIORITY_COLORS,
  ANNOUNCEMENT_PRIORITY_LABELS,
  ANNOUNCEMENT_STATUSES,
  ANNOUNCEMENT_STATUS_COLORS,
  ANNOUNCEMENT_STATUS_LABELS,
  ANNOUNCEMENT_TYPES,
  ANNOUNCEMENT_TYPE_LABELS,
  type Announcement,
  type AnnouncementPriority,
  type AnnouncementStatus,
  type AnnouncementType,
} from "@/types/domain/announcement";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Pin, Plus, Send, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AnnouncementFormModal } from "./components/AnnouncementFormModal";
import { AnnouncementReadersModal } from "./components/AnnouncementReadersModal";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ANNOUNCEMENT_STATUSES.map((value) => ({
      label: ANNOUNCEMENT_STATUS_LABELS[value],
      value,
    })),
  },
  {
    name: "type",
    label: "Kind",
    type: "select",
    options: ANNOUNCEMENT_TYPES.map((value) => ({
      label: ANNOUNCEMENT_TYPE_LABELS[value],
      value,
    })),
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: ANNOUNCEMENT_PRIORITIES.map((value) => ({
      label: ANNOUNCEMENT_PRIORITY_LABELS[value],
      value,
    })),
  },
  {
    name: "pinnedOnly",
    label: "Pinned",
    type: "select",
    options: [{ label: "Pinned only", value: "true" }],
  },
];

const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function AnnouncementsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/announcements");

  const { data, isLoading, isFetching } = useGetAnnouncementsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as AnnouncementStatus | undefined,
    type: filters.type as AnnouncementType | undefined,
    priority: filters.priority as AnnouncementPriority | undefined,
    pinnedOnly: filters.pinnedOnly === "true" ? true : undefined,
  });

  const { data: summary } = useGetAnnouncementSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Announcement | null>(null);
  const [readers, setReaders] = React.useState<Announcement | null>(null);
  const [pendingPublish, setPendingPublish] = React.useState<Announcement | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Announcement | null>(null);

  const [publishAnnouncement, { isLoading: isPublishing }] = usePublishAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();

  const onEdit = React.useCallback((announcement: Announcement) => {
    setEditing(announcement);
    setFormOpen(true);
  }, []);

  const rowMenu = React.useCallback(
    (announcement: Announcement) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer"
              aria-label={`More actions for ${announcement.title}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setReaders(announcement)}>
              <Eye className="size-4" />
              Who has read it
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!access.canEdit} onSelect={() => onEdit(announcement)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!access.canEdit || announcement.status === "PUBLISHED"}
              onSelect={() => setPendingPublish(announcement)}
            >
              <Send className="size-4" />
              Publish now
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={!access.canDelete}
              onSelect={() => setPendingDelete(announcement)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    [access.canEdit, access.canDelete, onEdit]
  );

  const columns = React.useMemo<ColumnDef<Announcement>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Announcement",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            {row.original.isPinned && <Pin className="size-3.5 shrink-0 text-amber-500" />}
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {row.original.summary || row.original.audienceLabel}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Kind",
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-[10px]">
            {ANNOUNCEMENT_TYPE_LABELS[row.original.type]}
          </Badge>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <StatusBadge
            color={ANNOUNCEMENT_PRIORITY_COLORS[row.original.priority]}
            label={ANNOUNCEMENT_PRIORITY_LABELS[row.original.priority]}
          />
        ),
      },
      {
        accessorKey: "readRate",
        header: "Read",
        cell: ({ row }) => (
          <div className="w-28 space-y-1">
            <Progress value={row.original.readRate} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {row.original.readCount} of {row.original.audienceCount}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "publishAt",
        header: "Goes out",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            <p>{formatDay(row.original.publishAt ?? row.original.publishedAt)}</p>
            {row.original.expiresAt && <p>until {formatDay(row.original.expiresAt)}</p>}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            color={
              row.original.isExpired ? "zinc" : ANNOUNCEMENT_STATUS_COLORS[row.original.status]
            }
            label={
              row.original.isExpired
                ? "Expired"
                : ANNOUNCEMENT_STATUS_LABELS[row.original.status]
            }
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

  const confirmPublish = async () => {
    if (!pendingPublish) return;
    try {
      await publishAnnouncement(pendingPublish._id).unwrap();
      toast.success("Announcement is out");
      setPendingPublish(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not publish the announcement");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteAnnouncement(pendingDelete._id).unwrap();
      toast.success("Announcement removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the announcement");
    }
  };

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Company news, sent to exactly the people it concerns, with who has read it."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Out there</StatLabel>
          <StatValue>{summary?.publishedCount ?? 0}</StatValue>
          <StatDescription>
            {summary?.scheduledCount ?? 0} scheduled · {summary?.draftCount ?? 0} draft
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Average read</StatLabel>
          <StatValue>{summary?.averageReadRate ?? 0}%</StatValue>
          <StatDescription className="space-y-1.5">
            <Progress value={summary?.averageReadRate ?? 0} className="h-1.5" />
            <span>Across everything currently live</span>
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Pinned</StatLabel>
          <StatValue>{summary?.pinnedCount ?? 0}</StatValue>
          <StatDescription>{summary?.expiringSoonCount ?? 0} expiring this week</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Unread by you</StatLabel>
          <StatValue>{summary?.unreadForMe ?? 0}</StatValue>
          <StatDescription>Live announcements you have not opened</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search announcements..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New announcement"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} announcements. Remove one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} announcements your plan allows. Remove one or upgrade your
          subscription to add more.
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
        mobileCard={(announcement) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {announcement.isPinned && <Pin className="size-3.5 shrink-0 text-amber-500" />}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{announcement.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {announcement.audienceLabel}
                  </p>
                </div>
              </div>
              <StatusBadge
                color={
                  announcement.isExpired ? "zinc" : ANNOUNCEMENT_STATUS_COLORS[announcement.status]
                }
                label={
                  announcement.isExpired
                    ? "Expired"
                    : ANNOUNCEMENT_STATUS_LABELS[announcement.status]
                }
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {ANNOUNCEMENT_PRIORITY_LABELS[announcement.priority]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {announcement.readRate}% read
              </Badge>
            </div>

            <div className="mt-3 border-t pt-3">{rowMenu(announcement)}</div>
          </div>
        )}
      />

      <AnnouncementFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        announcement={editing}
      />

      <AnnouncementReadersModal
        open={Boolean(readers)}
        onOpenChange={(open) => !open && setReaders(null)}
        announcement={readers}
      />

      <ConfirmDialog
        open={Boolean(pendingPublish)}
        onOpenChange={(open) => !open && setPendingPublish(null)}
        title={`Publish "${pendingPublish?.title ?? ""}"?`}
        description="Everyone in the audience sees it straight away."
        confirmText="Publish"
        isLoading={isPublishing}
        onConfirm={confirmPublish}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.title ?? ""}"?`}
        description="It disappears from everyone's feed, along with who read it."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
