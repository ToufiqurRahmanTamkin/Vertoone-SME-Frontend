import { ActionButton } from "@/components/shared/action-button";
import { FilePickerDialog } from "@/components/shared/file-picker-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { cn } from "@/lib/utils";
import {
  useDeleteManagedFileMutation,
  useGetManagedFileSummaryQuery,
  useGetManagedFilesQuery,
  useUpdateManagedFileMutation,
} from "@/redux/apis/fileManagerApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  MANAGED_FILE_KINDS,
  MANAGED_FILE_KIND_LABELS,
  MANAGED_FILE_SCOPES,
  MANAGED_FILE_SCOPE_LABELS,
  MANAGED_FILE_SOURCES,
  MANAGED_FILE_SOURCE_LABELS,
  formatBytes,
  isPreviewableImage,
  type ManagedFile,
  type ManagedFileKind,
  type ManagedFileScope,
  type ManagedFileSource,
} from "@/types/domain/fileManager";
import {
  Copy,
  Download,
  FileArchive,
  FileAudio,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Share2,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { FileRenameModal } from "./components/FileRenameModal";
import { FileShareModal } from "./components/FileShareModal";

const ICON_BY_KIND: Record<ManagedFileKind, typeof FileText> = {
  IMAGE: ImageIcon,
  DOCUMENT: FileText,
  SPREADSHEET: FileSpreadsheet,
  PRESENTATION: FileText,
  ARCHIVE: FileArchive,
  VIDEO: FileVideo,
  AUDIO: FileAudio,
  OTHER: FileText,
};

const FILTERS: FilterConfig[] = [
  {
    name: "scope",
    label: "Show",
    type: "select",
    options: MANAGED_FILE_SCOPES.map((value) => ({
      label: MANAGED_FILE_SCOPE_LABELS[value],
      value,
    })),
    defaultValue: "ALL",
    hideAllOption: true,
  },
  {
    name: "kind",
    label: "Type",
    type: "select",
    options: MANAGED_FILE_KINDS.map((value) => ({
      label: MANAGED_FILE_KIND_LABELS[value],
      value,
    })),
  },
  {
    name: "source",
    label: "Source",
    type: "select",
    options: MANAGED_FILE_SOURCES.map((value) => ({
      label: MANAGED_FILE_SOURCE_LABELS[value],
      value,
    })),
  },
];

export default function FileManagerPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters(24);
  const access = useModulePermission("/company/file-manager");

  const scope = (filters.scope as ManagedFileScope | undefined) ?? "ALL";

  const { data, isLoading, isFetching } = useGetManagedFilesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    scope,
    kind: filters.kind as ManagedFileKind | undefined,
    source: filters.source as ManagedFileSource | undefined,
  });

  const { data: summary } = useGetManagedFileSummaryQuery();

  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState<ManagedFile | null>(null);
  const [sharing, setSharing] = React.useState<ManagedFile | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<ManagedFile | null>(null);

  const [updateFile] = useUpdateManagedFileMutation();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteManagedFileMutation();

  const files = data?.data ?? [];
  const meta = data?.meta;

  const toggleStar = async (file: ManagedFile) => {
    try {
      await updateFile({ id: file._id, body: { isStarred: !file.isStarred } }).unwrap();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the file");
    }
  };

  const copyLink = async (file: ManagedFile) => {
    try {
      await navigator.clipboard.writeText(file.url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteFile(pendingDelete._id).unwrap();
      toast.success("File removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the file");
    }
  };

  return (
    <>
      <PageHeader
        title="File manager"
        description="Everything you have uploaded, in one place. Files are private to you until you share them."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>My files</StatLabel>
          <StatValue>{summary?.mineCount ?? 0}</StatValue>
          <StatDescription>{formatBytes(summary?.totalSize ?? 0)} stored</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Shared with me</StatLabel>
          <StatValue>{summary?.sharedWithMeCount ?? 0}</StatValue>
          <StatDescription>Files other people let you use</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Shared by me</StatLabel>
          <StatValue>{summary?.sharedByMeCount ?? 0}</StatValue>
          <StatDescription>Your files other people can see</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Starred</StatLabel>
          <StatValue>{summary?.starredCount ?? 0}</StatValue>
          <StatDescription>
            {summary?.imageCount ?? 0} images · {summary?.documentCount ?? 0} documents
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search files..."
        filters={FILTERS}
        currentFilters={{ ...filters, scope }}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton icon={Plus} label="Add files" onClick={() => setPickerOpen(true)} />
          )
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-16 text-center">
          <ImageIcon className="size-7 text-muted-foreground" />
          <p className="font-medium">No files yet</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Upload a file, or bring one in from Google Drive. Anything you upload anywhere else in
            the system lands here too.
          </p>
          {access.canCreate && (
            <Button className="mt-2 cursor-pointer" onClick={() => setPickerOpen(true)}>
              <Plus className="size-4" />
              Add files
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {files.map((file) => {
            const Icon = ICON_BY_KIND[file.kind];

            return (
              <div
                key={file._id}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:border-primary/40"
              >
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-32 items-center justify-center border-b bg-muted/30"
                >
                  {isPreviewableImage(file) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon className="size-9 text-muted-foreground" />
                  )}
                </a>

                <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" title={file.name}>
                        {file.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        <span className="font-mono uppercase">{file.extension}</span>
                        {" · "}
                        {formatBytes(file.fileSize)}
                      </p>
                    </div>

                    {file.isMine && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 cursor-pointer"
                        aria-label={file.isStarred ? "Remove star" : "Star this file"}
                        onClick={() => void toggleStar(file)}
                      >
                        <Star
                          className={cn(
                            "size-4",
                            file.isStarred
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                          )}
                        />
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {MANAGED_FILE_KIND_LABELS[file.kind]}
                    </Badge>
                    {file.source === "GOOGLE_DRIVE" && (
                      <Badge variant="outline" className="text-[10px]">
                        Drive
                      </Badge>
                    )}
                    {!file.isMine && (
                      <Badge variant="outline" className="text-[10px]">
                        {file.owner?.name ?? "Shared"}
                      </Badge>
                    )}
                    {file.isMine && file.shareCount > 0 && (
                      <Badge variant="outline" className="gap-1 text-[10px]">
                        <Users className="size-2.5" />
                        {file.shareCount}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 cursor-pointer px-2 text-xs"
                      asChild
                    >
                      <a href={file.url} target="_blank" rel="noreferrer" download>
                        <Download className="size-3.5" />
                        Open
                      </a>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 cursor-pointer"
                          aria-label={`More actions for ${file.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => void copyLink(file)}>
                          <Copy className="size-4" />
                          Copy link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={!file.isMine || !access.canEdit}
                          onSelect={() => setRenaming(file)}
                        >
                          <Pencil className="size-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={!file.isMine || !access.canEdit}
                          onSelect={() => setSharing(file)}
                        >
                          <Share2 className="size-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={!file.isMine || !access.canDelete}
                          onSelect={() => setPendingDelete(file)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} · {meta.total} files
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={meta.page <= 1}
              onClick={() => setFilter("page", meta.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setFilter("page", meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <FilePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={() => setPickerOpen(false)}
        multiple
        title="Add files"
        description="Upload from this device or bring files in from Google Drive. They stay private to you until you share them."
      />

      <FileRenameModal
        open={Boolean(renaming)}
        onOpenChange={(open) => !open && setRenaming(null)}
        file={renaming}
      />

      <FileShareModal
        open={Boolean(sharing)}
        onOpenChange={(open) => !open && setSharing(null)}
        file={sharing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.name ?? ""}"?`}
        description="It disappears from your file manager and from anyone you shared it with. Places that already use the file keep working."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
