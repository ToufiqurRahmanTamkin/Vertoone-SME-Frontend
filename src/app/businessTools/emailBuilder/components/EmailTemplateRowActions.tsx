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
import { Copy, MoreHorizontal, Pencil, Send, Trash2, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";

export interface EmailTemplateRowActionHandlers {
  onSend: (template: EmailTemplateListItem) => void;
  onTogglePublished: (template: EmailTemplateListItem) => void;
  onDuplicate: (template: EmailTemplateListItem) => void;
  onDelete: (template: EmailTemplateListItem) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface EmailTemplateRowActionsProps extends EmailTemplateRowActionHandlers {
  template: EmailTemplateListItem;
}

export function EmailTemplateRowActions({
  template,
  onSend,
  onTogglePublished,
  onDuplicate,
  onDelete,
  canCreate,
  canEdit,
  canDelete,
}: EmailTemplateRowActionsProps) {
  const isPublished = template.status === "PUBLISHED";

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="outline"
              size="sm"
              disabled={!isPublished || !canCreate}
              onClick={() => onSend(template)}
            >
              <Send className="size-3.5" />
              Send
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {isPublished ? "Choose who receives this" : "Publish this email before sending it"}
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`More actions for ${template.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild>
            <Link to={`/business-tools/email-builder/${template._id}`}>
              <Pencil />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canEdit} onClick={() => onTogglePublished(template)}>
            <UploadCloud />
            {isPublished ? "Move back to draft" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canCreate} onClick={() => onDuplicate(template)}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!canDelete}
            onClick={() => onDelete(template)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
