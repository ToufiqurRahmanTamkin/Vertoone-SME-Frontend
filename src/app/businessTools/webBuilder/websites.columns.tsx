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
import type { WebSiteListItem } from "@/types/domain/webBuilder";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ExternalLink,
  Files,
  Globe,
  MoreHorizontal,
  Settings,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Link } from "react-router-dom";
import { absoluteSiteUrl } from "./webBuilder.utils";

interface WebsiteColumnActions {
  onSettings: (site: WebSiteListItem) => void;
  onTogglePublished: (site: WebSiteListItem) => void;
  onDelete: (site: WebSiteListItem) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const websiteColumns = ({
  onSettings,
  onTogglePublished,
  onDelete,
  canEdit,
  canDelete,
}: WebsiteColumnActions): ColumnDef<WebSiteListItem>[] => [
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
            to={`/business-tools/web-builder/${row.original._id}`}
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
    cell: ({ row }) => {
      const site = row.original;
      const url = absoluteSiteUrl(site.publicUrl, site.publicPath);

      return (
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/business-tools/web-builder/${site._id}`}>
              <Files className="mr-2 size-3.5" />
              Pages
            </Link>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onSettings(site)}
                aria-label={`Settings for ${site.name}`}
              >
                <Settings className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Website settings</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="More actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={!site.isPublished}
                onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="mr-2 size-4" />
                View live
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canEdit} onClick={() => onTogglePublished(site)}>
                <UploadCloud className="mr-2 size-4" />
                {site.isPublished ? "Take offline" : "Take live"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={!canDelete}
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(site)}
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
