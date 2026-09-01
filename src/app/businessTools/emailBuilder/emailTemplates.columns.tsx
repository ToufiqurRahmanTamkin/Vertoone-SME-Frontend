import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { EmailTemplateListItem } from "@/types/domain/emailBuilder";
import type { ColumnDef } from "@tanstack/react-table";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import {
  EmailTemplateRowActions,
  type EmailTemplateRowActionHandlers,
} from "./components/EmailTemplateRowActions";
import { relativeDate, titleCase } from "./emailBuilder.utils";

export const emailTemplateColumns = ({
  onSend,
  onTogglePublished,
  onDuplicate,
  onDelete,
  canCreate,
  canEdit,
  canDelete,
}: EmailTemplateRowActionHandlers): ColumnDef<EmailTemplateListItem>[] => [
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
    cell: ({ row }) => <Badge variant="secondary">{titleCase(row.original.category)}</Badge>,
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
    cell: ({ row }) => (
      <EmailTemplateRowActions
        template={row.original}
        onSend={onSend}
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
