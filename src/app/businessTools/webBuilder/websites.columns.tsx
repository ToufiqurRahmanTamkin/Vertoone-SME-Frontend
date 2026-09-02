import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { WebSiteListItem } from "@/types/domain/webBuilder";
import type { ColumnDef } from "@tanstack/react-table";
import { Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { WebsiteRowActions, type WebsiteRowActionHandlers } from "./components/WebsiteRowActions";

export const websiteColumns = ({
  onSettings,
  onTogglePublished,
  onDelete,
  canEdit,
  canDelete,
}: WebsiteRowActionHandlers): ColumnDef<WebSiteListItem>[] => [
  {
    accessorKey: "name",
    header: "Website",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        {row.original.logoUrl ? (
          <img
            src={row.original.logoUrl}
            alt=""
            className="size-9 shrink-0 rounded-md border object-contain"
          />
        ) : (
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-md border text-white"
            style={{ backgroundColor: row.original.primaryColor }}
          >
            <Globe className="size-4" />
          </span>
        )}
        <div className="min-w-0">
          <Link
            to={`/crm/business-tools/web-builder/${row.original._id}`}
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
    accessorKey: "pageCount",
    header: "Pages",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Badge variant="secondary" className="tabular-nums">
          {row.original.pageCount}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {row.original.publishedPageCount} live
        </span>
      </div>
    ),
  },
  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge
          color={row.original.isPublished ? "green" : "zinc"}
          label={row.original.isPublished ? "Live" : "Draft"}
        />
        {row.original.pagesWithUnpublishedChanges > 0 && (
          <Badge variant="outline" className="text-[10px]">
            {row.original.pagesWithUnpublishedChanges} pending
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "homePageTitle",
    header: "Home page",
    cell: ({ row }) => (
      <span className="truncate text-sm text-muted-foreground">
        {row.original.homePageTitle || "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <WebsiteRowActions
        site={row.original}
        onSettings={onSettings}
        onTogglePublished={onTogglePublished}
        onDelete={onDelete}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    ),
  },
];
