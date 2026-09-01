import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { FormListItem } from "@/types/domain/formBuilder";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ClipboardList,
  Copy,
  ExternalLink,
  Inbox,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Link } from "react-router-dom";
import { absoluteFormUrl } from "./formBuilder.utils";

interface FormColumnActions {
  onShare: (form: FormListItem) => void;
  onTogglePublished: (form: FormListItem) => void;
  onDuplicate: (form: FormListItem) => void;
  onDelete: (form: FormListItem) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

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
}: FormColumnActions): ColumnDef<FormListItem>[] => [
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
    cell: ({ row }) => {
      const form = row.original;
      const url = absoluteFormUrl(form.publicUrl, form.publicPath);

      return (
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/business-tools/form-builder/${form._id}/responses`}>
              <Inbox className="mr-2 size-3.5" />
              Responses
            </Link>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onShare(form)}
                aria-label={`Share ${form.name}`}
              >
                <Share2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share this form</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="More actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/business-tools/form-builder/${form._id}`}>
                  <Pencil className="mr-2 size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={form.status !== "PUBLISHED"}
                onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="mr-2 size-4" />
                View live
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canEdit} onClick={() => onTogglePublished(form)}>
                <UploadCloud className="mr-2 size-4" />
                {form.status === "PUBLISHED" ? "Take offline" : "Publish"}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canCreate} onClick={() => onDuplicate(form)}>
                <Copy className="mr-2 size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={!canDelete}
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(form)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
