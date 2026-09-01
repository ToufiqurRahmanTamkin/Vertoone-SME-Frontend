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
import type { EmailTemplateListItem } from "@/types/domain/emailBuilder";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Mail, MoreHorizontal, Pencil, Send, Trash2, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { relativeDate, titleCase } from "./emailBuilder.utils";

interface EmailTemplateColumnActions {
  onSend: (template: EmailTemplateListItem) => void;
  onTogglePublished: (template: EmailTemplateListItem) => void;
  onDuplicate: (template: EmailTemplateListItem) => void;
  onDelete: (template: EmailTemplateListItem) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const emailTemplateColumns = ({
  onSend,
  onTogglePublished,
  onDuplicate,
  onDelete,
  canCreate,
  canEdit,
  canDelete,
}: EmailTemplateColumnActions): ColumnDef<EmailTemplateListItem>[] => [
  {
    accessorKey: "name",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-md border text-white"
          style={{ backgroundColor: row.original.brandColor }}
        >
          <Mail className="size-4" />
        </span>
        <div className="min-w-0">
          <Link
            to={`/business-tools/email-builder/${row.original._id}`}
            className="block truncate text-sm font-semibold hover:underline"
          >
            {row.original.name}
          </Link>
          <span className="block truncate text-[11px] text-muted-foreground">
            {row.original.subject || "No subject line yet"}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary">{titleCase(row.original.category)}</Badge>
    ),
  },
  {
    accessorKey: "blockCount",
    header: "Blocks",
    cell: ({ row }) => (
      <Badge variant="outline" className="tabular-nums">
        {row.original.blockCount}
      </Badge>
    ),
  },
  {
    accessorKey: "sentCount",
    header: "Sent",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-semibold tabular-nums">{row.original.sentCount}</span>
        <span className="text-[11px] text-muted-foreground">
          {relativeDate(row.original.lastSentAt, "Never sent")}
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
          label={row.original.status === "PUBLISHED" ? "Published" : "Draft"}
        />
        {row.original.hasUnpublishedChanges && (
          <Badge variant="outline" className="text-[10px]">
            Changes pending
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const template = row.original;
      const canSend = template.status === "PUBLISHED";

      return (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canSend || !canCreate}
                  onClick={() => onSend(template)}
                >
                  <Send className="mr-2 size-3.5" />
                  Send
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {canSend ? "Choose who receives this" : "Publish this email before sending it"}
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="More actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/business-tools/email-builder/${template._id}`}>
                  <Pencil className="mr-2 size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canEdit} onClick={() => onTogglePublished(template)}>
                <UploadCloud className="mr-2 size-4" />
                {template.status === "PUBLISHED" ? "Move back to draft" : "Publish"}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canCreate} onClick={() => onDuplicate(template)}>
                <Copy className="mr-2 size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={!canDelete}
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(template)}
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
