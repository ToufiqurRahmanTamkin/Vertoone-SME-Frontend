import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WebSiteListItem } from "@/types/domain/webBuilder";
import { ExternalLink, Files, MoreHorizontal, Settings, Trash2, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { absoluteSiteUrl } from "../webBuilder.utils";

export interface WebsiteRowActionHandlers {
  onSettings: (site: WebSiteListItem) => void;
  onTogglePublished: (site: WebSiteListItem) => void;
  onDelete: (site: WebSiteListItem) => void;
  canEdit: boolean;
  canDelete: boolean;
}

interface WebsiteRowActionsProps extends WebsiteRowActionHandlers {
  site: WebSiteListItem;
}

export function WebsiteRowActions({
  site,
  onSettings,
  onTogglePublished,
  onDelete,
  canEdit,
  canDelete,
}: WebsiteRowActionsProps) {
  const url = absoluteSiteUrl(site.publicUrl, site.publicPath);

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="outline" size="sm" asChild>
        <Link to={`/crm/business-tools/web-builder/${site._id}`}>
          <Files className="size-3.5" />
          Pages
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`More actions for ${site.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => onSettings(site)}>
            <Settings />
            Website settings
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!site.isPublished}
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink />
            View live
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canEdit} onClick={() => onTogglePublished(site)}>
            <UploadCloud />
            {site.isPublished ? "Take offline" : "Take live"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!canDelete}
            onClick={() => onDelete(site)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
