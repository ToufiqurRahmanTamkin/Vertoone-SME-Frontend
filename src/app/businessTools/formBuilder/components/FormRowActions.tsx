import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FormListItem } from "@/types/domain/formBuilder";
import {
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
import { absoluteFormUrl } from "../formBuilder.utils";

export interface FormRowActionHandlers {
  onShare: (form: FormListItem) => void;
  onTogglePublished: (form: FormListItem) => void;
  onDuplicate: (form: FormListItem) => void;
  onDelete: (form: FormListItem) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface FormRowActionsProps extends FormRowActionHandlers {
  form: FormListItem;
}

export function FormRowActions({
  form,
  onShare,
  onTogglePublished,
  onDuplicate,
  onDelete,
  canCreate,
  canEdit,
  canDelete,
}: FormRowActionsProps) {
  const url = absoluteFormUrl(form.publicUrl, form.publicPath);
  const isPublished = form.status === "PUBLISHED";

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="outline" size="sm" asChild>
        <Link to={`/crm/business-tools/form-builder/${form._id}/responses`}>
          <Inbox className="size-3.5" />
          Responses
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`More actions for ${form.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild>
            <Link to={`/crm/business-tools/form-builder/${form._id}`}>
              <Pencil />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onShare(form)}>
            <Share2 />
            Share this form
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!isPublished}
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink />
            View live
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canEdit} onClick={() => onTogglePublished(form)}>
            <UploadCloud />
            {isPublished ? "Take offline" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canCreate} onClick={() => onDuplicate(form)}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!canDelete}
            onClick={() => onDelete(form)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
