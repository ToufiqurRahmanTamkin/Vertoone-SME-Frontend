import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDateTime } from "@/lib/date";
import { useDeleteNoteMutation, useGetNoteQuery, useUpdateNoteMutation } from "@/redux/apis/noteApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  NOTE_VISIBILITY_COLORS,
  NOTE_VISIBILITY_LABELS,
  NOTE_VISIBILITY_SHORT_LABELS,
  type Note,
} from "@/types/domain/note";
import { Archive, ArchiveRestore, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface NoteDetailSheetProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditNote: (note: Note) => void;
  canEdit: boolean;
  canDelete: boolean;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

export function NoteDetailSheet({
  note,
  open,
  onOpenChange,
  onEditNote,
  canEdit,
  canDelete,
}: NoteDetailSheetProps) {
  const { data: fresh } = useGetNoteQuery(note?._id ?? "", { skip: !note || !open });
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const current = fresh ?? note;

  const patch = async (body: Parameters<typeof updateNote>[0]["body"], message: string) => {
    if (!current) return;
    try {
      await updateNote({ id: current._id, body }).unwrap();
      toast.success(message);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the note");
    }
  };

  const confirmDelete = async () => {
    if (!current) return;
    try {
      await deleteNote(current._id).unwrap();
      toast.success("Note deleted");
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the note");
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
          aria-describedby={undefined}
        >
          {current && (
            <>
              <SheetHeader className="space-y-2 border-b px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <SheetTitle className="truncate text-base">{current.title}</SheetTitle>
                    <SheetDescription className="truncate">
                      {current.wordCount} words · edited {formatDateTime(current.updatedAt)}
                    </SheetDescription>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {canEdit && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={current.isPinned ? "Unpin note" : "Pin note"}
                          className="size-8 cursor-pointer"
                          onClick={() =>
                            void patch(
                              { isPinned: !current.isPinned },
                              current.isPinned ? "Note unpinned" : "Note pinned"
                            )
                          }
                        >
                          {current.isPinned ? (
                            <PinOff className="size-4" />
                          ) : (
                            <Pin className="size-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={current.isArchived ? "Restore note" : "Archive note"}
                          className="size-8 cursor-pointer"
                          onClick={() =>
                            void patch(
                              { isArchived: !current.isArchived },
                              current.isArchived ? "Note restored" : "Note archived"
                            )
                          }
                        >
                          {current.isArchived ? (
                            <ArchiveRestore className="size-4" />
                          ) : (
                            <Archive className="size-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Edit note"
                          className="size-8 cursor-pointer"
                          onClick={() => onEditNote(current)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </>
                    )}
                    {canDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Delete note"
                        className="size-8 cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => setConfirmOpen(true)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <ColorChip color={current.color} label="Colour" />
                  <StatusBadge
                    color={NOTE_VISIBILITY_COLORS[current.visibility]}
                    label={NOTE_VISIBILITY_SHORT_LABELS[current.visibility]}
                  />
                  {current.isPinned && <StatusBadge color="amber" label="Pinned" />}
                  {current.isArchived && <StatusBadge color="zinc" label="Archived" />}
                  {current.isReminderDue && <StatusBadge color="red" label="Reminder due" />}
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {current.content ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{current.content}</p>
                ) : (
                  <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                    This note has no body yet.
                  </p>
                )}

                <Separator className="my-4" />

                <dl className="divide-y">
                  <DetailRow label="Visible to">
                    {NOTE_VISIBILITY_LABELS[current.visibility]}
                  </DetailRow>
                  <DetailRow label="Owner">{current.owner?.name ?? "Unassigned"}</DetailRow>
                  {current.visibility === "SHARED" && (
                    <DetailRow label="Shared with">
                      {current.sharedWith.length > 0
                        ? current.sharedWith.map((person) => person.name).join(", ")
                        : "Nobody yet"}
                    </DetailRow>
                  )}
                  <DetailRow label="Linked board">
                    {current.board ? (
                      <ColorChip color={current.board.color} label={current.board.name} />
                    ) : (
                      "—"
                    )}
                  </DetailRow>
                  <DetailRow label="Tags">
                    <TagList tags={current.tags} className="justify-end" />
                  </DetailRow>
                  <DetailRow label="Reminder">
                    {current.reminderAt ? formatDateTime(current.reminderAt) : "None"}
                  </DetailRow>
                  <DetailRow label="Created">{formatDateTime(current.createdAt)}</DetailRow>
                </dl>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${current?.title ?? ""}"?`}
        description="The note is removed from every list it appears on. Archive it instead if you may want it back."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
