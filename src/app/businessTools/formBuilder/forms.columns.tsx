import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { FormListItem } from "@/types/domain/formBuilder";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { FormRowActions, type FormRowActionHandlers } from "./components/FormRowActions";

const relativeDate = (value: string | null): string => {
  if (!value) return "No responses yet";

  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;

  return new Date(value).toLocaleDateString();
};

export const formColumns = ({
  onShare,
  onTogglePublished,
  onDuplicate,
  onDelete,
  canCreate,
  canEdit,
  canDelete,
}: FormRowActionHandlers): ColumnDef<FormListItem>[] => [
  {
    accessorKey: "name",
    header: "Form",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-md border text-white"
          style={{ backgroundColor: row.original.primaryColor }}
        >
          <ClipboardList className="size-4" />
        </span>
        <div className="min-w-0">
          <Link
            to={`/business-tools/form-builder/${row.original._id}`}
            className="block truncate text-sm font-semibold hover:underline"
          >
            {row.original.name}
          </Link>
          <span className="block truncate font-mono text-[11px] text-muted-foreground">
            {row.original.publicPath}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "fieldCount",
    header: "Questions",
    cell: ({ row }) => (
      <Badge variant="secondary" className="tabular-nums">
        {row.original.fieldCount}
      </Badge>
    ),
  },
  {
    accessorKey: "submissionCount",
    header: "Responses",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Link
          to={`/business-tools/form-builder/${row.original._id}/responses`}
          className="text-sm font-semibold tabular-nums hover:underline"
        >
          {row.original.submissionCount}
        </Link>
        <span className="text-[11px] text-muted-foreground">
          {relativeDate(row.original.lastSubmissionAt)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge
          color={row.original.status === "PUBLISHED" ? "green" : "zinc"}
          label={row.original.status === "PUBLISHED" ? "Live" : "Draft"}
        />
        {row.original.hasUnpublishedChanges && (
          <Badge variant="outline" className="text-[10px]">
            Changes pending
          </Badge>
        )}
        {row.original.status === "PUBLISHED" && !row.original.isAcceptingResponses && (
          <Badge variant="outline" className="text-[10px]">
            Closed
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <FormRowActions
        form={row.original}
        onShare={onShare}
        onTogglePublished={onTogglePublished}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    ),
  },
];
