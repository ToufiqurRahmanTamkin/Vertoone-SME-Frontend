import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDateTime } from "@/lib/date";
import { useGetSharedNotesQuery } from "@/redux/apis/resourceShareApis";
import type { Note } from "@/types/domain/note";
import { Eye, Pencil } from "lucide-react";
import * as React from "react";

interface SharedNotesListProps {
  onOpen: (note: Note) => void;
  onEdit: (note: Note) => void;
}

export function SharedNotesList({ onOpen, onEdit }: SharedNotesListProps) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const { data, isLoading } = useGetSharedNotesQuery({ page, limit, search });

  const rows = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        value={search}
        placeholder="Search shared notes..."
        className="sm:max-w-xs"
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
      />

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
          Nothing has been shared with you yet. Once you accept an invitation the note shows up
          here.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ share, note }) => (
            <article key={share._id} className="rounded-xl border bg-card p-4">
              <button
                type="button"
                className="min-w-0 cursor-pointer text-left"
                onClick={() => onOpen(note)}
              >
                <ColorChip color={note.color} label={note.title} />
                <p className="mt-2 line-clamp-4 text-xs text-muted-foreground">
                  {note.excerpt || "Empty note"}
                </p>
              </button>

              <dl className="mt-3 grid gap-1 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Shared by</dt>
                  <dd className="truncate font-medium">
                    {share.sharedByName || share.sharedByEmail}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Last edited</dt>
                  <dd className="truncate font-medium">{formatDateTime(note.updatedAt)}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <TagList tags={note.tags} emptyLabel="" />
                {!share.permissions.canEdit && <StatusBadge color="zinc" label="Read only" />}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => onOpen(note)}
                >
                  <Eye className="size-4" />
                  Open
                </Button>
                {share.permissions.canEdit && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => onEdit(note)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {meta && meta.total > 0 && (
        <DataTablePagination
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
          pages={meta.totalPages}
          onPageChange={setPage}
          onLimitChange={(next) => {
            setLimit(next);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
