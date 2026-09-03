import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import {
  DOCUMENT_CATEGORY_COLORS,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_VISIBILITY_COLORS,
  DOCUMENT_VISIBILITY_SHORT_LABELS,
  formatFileSize,
  type CompanyDocument,
} from "@/types/domain/document";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, FileText, FolderOpen, History, Pencil, Trash2 } from "lucide-react";

export interface DocumentColumnActions {
  onOpen: (document: CompanyDocument) => void;
  onEdit: (document: CompanyDocument) => void;
  onNewVersion: (document: CompanyDocument) => void;
  onDownload: (document: CompanyDocument) => void;
  onDelete: (document: CompanyDocument) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function DocumentRowActions({
  document,
  ...actions
}: DocumentColumnActions & { document: CompanyDocument }) {
  return (
    <RowActions
      label={`Actions for ${document.title}`}
      actions={[
        {
          key: "download",
          label: "Download",
          icon: Download,
          onSelect: () => actions.onDownload(document),
        },
        {
          key: "edit",
          label: "Edit details",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(document),
        },
        {
          key: "version",
          label: "Upload a new version",
          icon: History,
          disabled: !actions.canEdit,
          onSelect: () => actions.onNewVersion(document),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(document),
        },
      ]}
    />
  );
}

export const documentColumns = (
  rowActions: DocumentColumnActions
): ColumnDef<CompanyDocument>[] => [
  {
    accessorKey: "title",
    header: "Document",
    cell: ({ row }) => (
      <button
        type="button"
        className="flex min-w-0 cursor-pointer items-center gap-2.5 text-left"
        onClick={() => rowActions.onOpen(row.original)}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
          <FileText className="size-4 text-muted-foreground" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium hover:underline">{row.original.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            <span className="font-mono uppercase">{row.original.file.extension}</span>
            {" · "}
            {formatFileSize(row.original.fileSize)}
            {row.original.version > 1 ? ` · v${row.original.version}` : ""}
          </span>
        </span>
      </button>
    ),
  },
  {
    accessorKey: "folder",
    header: "Folder",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <FolderOpen className="size-3.5 text-muted-foreground" />
        {row.original.folder}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <StatusBadge
        color={DOCUMENT_CATEGORY_COLORS[row.original.category]}
        label={DOCUMENT_CATEGORY_LABELS[row.original.category]}
      />
    ),
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => (
      <span className="truncate text-sm">{row.original.owner?.name ?? "Unassigned"}</span>
    ),
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => <TagList tags={row.original.tags} emptyLabel="—" />,
  },
  {
    accessorKey: "visibility",
    header: "Who can see it",
    cell: ({ row }) => (
      <StatusBadge
        color={DOCUMENT_VISIBILITY_COLORS[row.original.visibility]}
        label={DOCUMENT_VISIBILITY_SHORT_LABELS[row.original.visibility]}
      />
    ),
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      if (!row.original.expiresAt) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      return (
        <StatusBadge
          color={
            row.original.isExpired ? "red" : row.original.isExpiringSoon ? "amber" : "zinc"
          }
          label={formatDate(row.original.expiresAt)}
        />
      );
    },
  },
  {
    accessorKey: "downloadCount",
    header: "Downloads",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] tabular-nums">
        {row.original.downloadCount}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <DocumentRowActions document={row.original} {...rowActions} />,
  },
];
