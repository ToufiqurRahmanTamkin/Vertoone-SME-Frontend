import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { EMAIL_STATUS_COLORS, EMAIL_STATUS_LABELS, EMAIL_TEMPLATE_LABELS } from "@/constant";
import { formatDateTime, safeDistanceToNow } from "@/lib/date";
import type { EmailLogListItem } from "@/types/domain/email";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

interface EmailColumnActions {
  onPreview: (email: EmailLogListItem) => void;
}

export const emailColumns = ({
  onPreview,
}: EmailColumnActions): ColumnDef<EmailLogListItem>[] => [
  {
    accessorKey: "sentAt",
    header: "Sent",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="whitespace-nowrap text-sm font-medium">
          {formatDateTime(row.original.sentAt)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {safeDistanceToNow(row.original.sentAt)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "to",
    header: "Recipient",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{row.original.recipientName || "—"}</p>
        <p className="max-w-xs truncate text-[11px] text-muted-foreground">{row.original.to}</p>
      </div>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <p className="max-w-sm truncate text-sm">{row.original.subject}</p>
    ),
  },
  {
    accessorKey: "template",
    header: "Template",
    cell: ({ row }) => (
      <span className="text-sm">
        {EMAIL_TEMPLATE_LABELS[row.original.template] ?? row.original.template}
      </span>
    ),
  },
  {
    accessorKey: "relatedReference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.relatedReference || "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge
          color={EMAIL_STATUS_COLORS[row.original.status]}
          label={EMAIL_STATUS_LABELS[row.original.status]}
        />
        {row.original.errorMessage && (
          <span className="max-w-[14rem] truncate text-[11px] text-muted-foreground">
            {row.original.errorMessage}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onPreview(row.original)}
          aria-label={`Preview email to ${row.original.to}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
