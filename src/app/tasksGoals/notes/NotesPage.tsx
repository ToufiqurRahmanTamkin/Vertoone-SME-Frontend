import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { ShareInvitations } from "@/components/shared/share-invitations";
import { ShareResourceDialog } from "@/components/shared/share-resource-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDateTime } from "@/lib/date";
import { useGetAiAllowanceQuery } from "@/redux/apis/aiApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useDeleteNoteMutation,
  useGetNoteSummaryQuery,
  useGetNotesQuery,
  useUpdateNoteMutation,
} from "@/redux/apis/noteApis";
import { useGetShareSummaryQuery } from "@/redux/apis/resourceShareApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { useGetTaskBoardOptionsQuery } from "@/redux/apis/taskApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  NOTE_VISIBILITIES,
  NOTE_VISIBILITY_COLORS,
  NOTE_VISIBILITY_SHORT_LABELS,
  type Note,
  type NoteVisibility,
} from "@/types/domain/note";
import { Bot, Pin, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AiNoteModal } from "./components/AiNoteModal";
import { NoteDetailSheet } from "./components/NoteDetailSheet";
import { NoteFormModal } from "./components/NoteFormModal";
import { SharedNotesList } from "./components/SharedNotesList";
import { NoteRowActions, noteColumns } from "./notes.columns";

export default function NotesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/company/tasks-and-goals/notes");

  // Someone who only got here through a share cannot call the company-wide endpoints.
  const ownsModule = access.canView;
  const tab = ownsModule ? ((filters.tab as string) ?? "all") : "shared";

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery(undefined, {
    skip: !ownsModule,
  });
  const { data: tagOptions = [] } = useGetTagOptionsQuery(undefined, { skip: !ownsModule });
  const { data: boardOptions = [] } = useGetTaskBoardOptionsQuery(undefined, {
    skip: !ownsModule,
  });

  const { data, isLoading, isFetching } = useGetNotesQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      visibility: filters.visibility as NoteVisibility | undefined,
      ownerId: filters.ownerId as string | undefined,
      boardId: filters.boardId as string | undefined,
      tagIds: filters.tagIds as string | undefined,
      isPinned: filters.isPinned === undefined ? undefined : filters.isPinned === "true",
      isArchived: filters.isArchived === "true" ? true : undefined,
      hasReminder: filters.hasReminder === undefined ? undefined : filters.hasReminder === "true",
    },
    { skip: !ownsModule }
  );

  const { data: summary } = useGetNoteSummaryQuery(undefined, { skip: !ownsModule });
  const { data: shareSummary } = useGetShareSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Note | null>(null);
  const [reading, setReading] = React.useState<Note | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<Note | null>(null);
  const [sharing, setSharing] = React.useState<Note | null>(null);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();
  const [updateNote] = useUpdateNoteMutation();

  const toolbarFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "visibility",
        label: "Visible to",
        type: "select",
        options: NOTE_VISIBILITIES.map((visibility) => ({
          label: NOTE_VISIBILITY_SHORT_LABELS[visibility],
          value: visibility,
        })),
      },
      {
        name: "ownerId",
        label: "Owner",
        type: "select",
        options: employeeOptions.map((employee) => ({
          label: employee.name,
          value: employee._id,
        })),
      },
      {
        name: "boardId",
        label: "Board",
        type: "select",
        options: boardOptions.map((board) => ({ label: board.name, value: board._id })),
      },
      {
        name: "tagIds",
        label: "Tag",
        type: "select",
        options: tagOptions.map((tag) => ({ label: tag.name, value: tag._id })),
      },
      {
        name: "isPinned",
        label: "Pinned",
        type: "select",
        options: [
          { label: "Pinned only", value: "true" },
          { label: "Not pinned", value: "false" },
        ],
      },
      {
        name: "hasReminder",
        label: "Reminder",
        type: "select",
        options: [
          { label: "With a reminder", value: "true" },
          { label: "Without one", value: "false" },
        ],
      },
      {
        name: "isArchived",
        label: "Archived",
        type: "select",
        options: [
          { label: "Archived only", value: "true" },
          { label: "Active only", value: "false" },
        ],
      },
    ],
    [employeeOptions, boardOptions, tagOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = React.useCallback((note: Note) => {
    setEditing(note);
    setFormOpen(true);
  }, []);

  const openDetail = React.useCallback((note: Note) => {
    setReading(note);
    setDetailOpen(true);
  }, []);

  const openShare = React.useCallback((note: Note) => {
    setSharing(note);
    setShareOpen(true);
  }, []);

  const togglePin = React.useCallback(
    async (note: Note) => {
      try {
        await updateNote({ id: note._id, body: { isPinned: !note.isPinned } }).unwrap();
        toast.success(note.isPinned ? "Note unpinned" : "Note pinned");
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not update the note");
      }
    },
    [updateNote]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteNote(pendingDelete._id).unwrap();
      toast.success("Note deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the note");
    }
  };

  const { data: ai } = useGetAiAllowanceQuery(undefined, { skip: !ownsModule });
  const [aiOpen, setAiOpen] = React.useState(false);

  const rowActions = React.useMemo(
    () => ({
      onOpen: openDetail,
      onEdit: openEdit,
      onTogglePin: (note: Note) => void togglePin(note),
      onShare: openShare,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canShare: access.canEdit,
    }),
    [openDetail, openEdit, togglePin, openShare, access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => noteColumns(rowActions), [rowActions]);

  const notes = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Notes"
        description="What was said, decided and promised — kept next to the work it belongs to."
      />

      <ShareInvitations resourceType="NOTE" />

      <Tabs value={tab} onValueChange={(next) => setFilter("tab", next)} className="gap-4">
        <TabsList>
          {ownsModule && <TabsTrigger value="all">All notes</TabsTrigger>}
          <TabsTrigger value="shared" className="gap-1.5">
            Shared with me
            {(shareSummary?.noteCount ?? 0) > 0 && (
              <Badge variant="secondary" className="text-[10px] tabular-nums">
                {shareSummary?.noteCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {ownsModule && (
          <TabsContent value="all" className="space-y-4">
            <StatGrid className="sm:grid-cols-4">
              <Stat>
                <StatLabel>Notes</StatLabel>
                <StatValue>{used}</StatValue>
                <StatDescription>
                  {limit === null
                    ? "Unlimited on your plan"
                    : `${used} of ${limit} allowed by your plan`}
                </StatDescription>
              </Stat>
              <Stat>
                <StatLabel>Pinned</StatLabel>
                <StatValue>{summary?.pinnedCount ?? 0}</StatValue>
                <StatDescription>Held at the top of the list</StatDescription>
              </Stat>
              <Stat>
                <StatLabel>Reminders due</StatLabel>
                <StatValue>{summary?.reminderDueCount ?? 0}</StatValue>
                <StatDescription>Past the time you asked to be nudged</StatDescription>
              </Stat>
              <Stat>
                <StatLabel>Active</StatLabel>
                <StatValue>{summary?.activeCount ?? 0}</StatValue>
                <StatDescription>{summary?.archivedCount ?? 0} archived</StatDescription>
              </Stat>
            </StatGrid>

            <DataTableToolbar
              searchValue={filters.search}
              onSearchChange={(value) => setFilter("search", value)}
              searchPlaceholder="Search notes..."
              filters={toolbarFilters}
              currentFilters={filters}
              onFilterChange={setFilter}
              onClear={clearFilters}
              isLoading={isFetching}
              actions={
                access.canCreate && (
                  <>
                    {ai?.isConfigured && (
                      <ActionButton
                        icon={Bot}
                        label="Write with AI"
                        variant="outline"
                        disabled={isLimitReached}
                        onClick={() => setAiOpen(true)}
                      />
                    )}
                    <ActionButton
                      icon={Plus}
                      label="New note"
                      onClick={openCreate}
                      disabled={isLimitReached}
                      title={
                        isLimitReached
                          ? `Your plan allows ${limit} notes. Delete one or upgrade to add more.`
                          : undefined
                      }
                    />
                  </>
                )
              }
            />

            {isLimitReached && (
              <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
                You have used all {limit} notes your plan allows. Delete one or upgrade your
                subscription to add more.
              </p>
            )}

            <DataTable
              columns={columns}
              data={notes}
              isLoading={isLoading}
              pagination={
                meta
                  ? {
                      page: meta.page,
                      limit: meta.limit,
                      total: meta.total,
                      pages: meta.totalPages,
                    }
                  : undefined
              }
              onPageChange={(page) => setFilter("page", page)}
              onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
              getRowId={(row) => row._id}
              mobileCard={(note) => (
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 cursor-pointer text-left"
                      onClick={() => openDetail(note)}
                    >
                      <span className="flex items-center gap-1.5">
                        {note.isPinned && (
                          <Pin className="size-3 shrink-0 text-amber-500" aria-hidden />
                        )}
                        <ColorChip color={note.color} label={note.title} />
                      </span>
                      <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                        {note.excerpt || "Empty note"}
                      </p>
                    </button>
                    <StatusBadge
                      color={NOTE_VISIBILITY_COLORS[note.visibility]}
                      label={NOTE_VISIBILITY_SHORT_LABELS[note.visibility]}
                    />
                  </div>

                  <dl className="mt-3 grid gap-1 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Owner</dt>
                      <dd className="truncate font-medium">{note.owner?.name ?? "Unassigned"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Board</dt>
                      <dd className="truncate font-medium">{note.board?.name ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Reminder</dt>
                      <dd className="truncate font-medium">
                        {note.reminderAt ? formatDateTime(note.reminderAt) : "None"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Last edited</dt>
                      <dd className="truncate font-medium">{formatDateTime(note.updatedAt)}</dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <TagList tags={note.tags} emptyLabel="" />
                    {note.isReminderDue && <StatusBadge color="red" label="Reminder due" />}
                    {note.isArchived && <StatusBadge color="zinc" label="Archived" />}
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <NoteRowActions note={note} {...rowActions} />
                  </div>
                </div>
              )}
            />
          </TabsContent>
        )}

        <TabsContent value="shared">
          <SharedNotesList onOpen={openDetail} onEdit={openEdit} />
        </TabsContent>
      </Tabs>

      <NoteFormModal open={formOpen} onOpenChange={setFormOpen} note={editing} />

      <NoteDetailSheet
        note={reading}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEditNote={(note) => {
          setDetailOpen(false);
          openEdit(note);
        }}
        canEdit={access.canEdit}
        canDelete={access.canDelete}
      />

      <AiNoteModal open={aiOpen} onOpenChange={setAiOpen} />

      <ShareResourceDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        resourceType="NOTE"
        resourceId={sharing?._id ?? null}
        resourceTitle={sharing?.title ?? ""}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="The note is removed from every list it appears on. Archive it instead if you may want it back."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
