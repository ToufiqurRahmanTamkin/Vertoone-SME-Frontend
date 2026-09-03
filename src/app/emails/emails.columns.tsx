import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { EMAIL_STATUS_COLORS, EMAIL_STATUS_LABELS, EMAIL_TEMPLATE_LABELS } from "@/constant";
import { formatDate, safeDistanceToNow, safeFormat } from "@/lib/date";
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
    meta: { headerClassName: "w-[14%]" },
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{formatDate(row.original.sentAt)}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {safeFormat(row.original.sentAt, "hh:mm a")} · {safeDistanceToNow(row.original.sentAt)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "to",
    header: "Recipient",
    meta: { headerClassName: "w-[19%]" },
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{row.original.recipientName || "—"}</p>
        <p className="truncate text-[11px] text-muted-foreground">{row.original.to}</p>
      </div>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    meta: { headerClassName: "w-[24%]" },
    cell: ({ row }) => <p className="truncate text-sm">{row.original.subject}</p>,
  },
  {
    accessorKey: "template",
    header: "Template",
    meta: { headerClassName: "w-[16%]" },
    cell: ({ row }) => (
      <p className="truncate text-sm">
        {EMAIL_TEMPLATE_LABELS[row.original.template] ?? row.original.template}
      </p>
    ),
  },
  {
    accessorKey: "relatedReference",
    header: "Reference",
    meta: { headerClassName: "w-[12%]" },
    cell: ({ row }) => (
      <p className="truncate font-mono text-xs text-muted-foreground">
        {row.original.relatedReference || "—"}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { headerClassName: "w-[11%]" },
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col items-start gap-1">
        <StatusBadge
          color={EMAIL_STATUS_COLORS[row.original.status]}
          label={EMAIL_STATUS_LABELS[row.original.status]}
        />
        {row.original.errorMessage && (
          <span className="w-full truncate text-[11px] text-muted-foreground">
            {row.original.errorMessage}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { headerClassName: "w-[4%]" },
    cell: ({ row }) => (
      <RowActions
        label={`Actions for the email to ${row.original.to}`}
        actions={[
          {
            key: "preview",
            label: "Preview email",
            icon: Eye,
            onSelect: () => onPreview(row.original),
          },
        ]}
      />
    ),
  },
];
