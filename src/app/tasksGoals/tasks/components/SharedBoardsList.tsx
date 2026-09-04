import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGetSharedBoardsQuery } from "@/redux/apis/resourceShareApis";
import { SHARE_CAPABILITY_OPTIONS } from "@/types/domain/resourceShare";
import { ArrowRight } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

export function SharedBoardsList() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const { data, isLoading } = useGetSharedBoardsQuery({ page, limit, search });

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
        placeholder="Search shared boards..."
        className="sm:max-w-xs"
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
      />

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
          No board has been shared with you yet. Once you accept an invitation the board shows up
          here.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map(({ share, board }) => {
            const granted = SHARE_CAPABILITY_OPTIONS.TASK_BOARD.filter(
              (option) => share.permissions[option.key]
            );

            return (
              <article key={share._id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    className="min-w-0 cursor-pointer text-left"
                    onClick={() => navigate(`/company/tasks-and-goals/tasks/${board._id}`)}
                  >
                    <ColorChip color={board.color} label={board.name} />
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {board.description || "No description"}
                    </p>
                  </button>
                  {board.isArchived && <StatusBadge color="zinc" label="Archived" />}
                </div>

                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Shared by</dt>
                    <dd className="truncate font-medium">
                      {share.sharedByName || share.sharedByEmail}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Lists</dt>
                    <dd className="font-medium tabular-nums">{board.lists.length}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {share.permissions.canViewAllCards ? (
                    <StatusBadge color="blue" label="Every card" />
                  ) : (
                    <StatusBadge color="amber" label="Only cards assigned to you" />
                  )}
                  {granted
                    .filter((option) => option.key !== "canViewAllCards")
                    .map((option) => (
                      <Badge key={option.key} variant="outline" className="text-[10px]">
                        {option.label}
                      </Badge>
                    ))}
                </div>

                <div className="mt-3 border-t pt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => navigate(`/company/tasks-and-goals/tasks/${board._id}`)}
                  >
                    Open board
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </article>
            );
          })}
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
