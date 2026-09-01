import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SubmissionListItem } from "@/types/domain/formBuilder";
import { Eye, MoreHorizontal, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";

export interface SubmissionRowActionHandlers {
  onOpen: (submission: SubmissionListItem) => void;
  onToggleSpam: (submission: SubmissionListItem) => void;
  onDelete: (submission: SubmissionListItem) => void;
  canEdit: boolean;
  canDelete: boolean;
}

interface SubmissionRowActionsProps extends SubmissionRowActionHandlers {
  submission: SubmissionListItem;
}

export function SubmissionRowActions({
  submission,
  onOpen,
  onToggleSpam,
  onDelete,
  canEdit,
  canDelete,
}: SubmissionRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="outline" size="sm" onClick={() => onOpen(submission)}>
        <Eye className="size-3.5" />
        Open
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="More actions for this response"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem disabled={!canEdit} onClick={() => onToggleSpam(submission)}>
            {submission.isSpam ? <ShieldCheck /> : <ShieldAlert />}
            {submission.isSpam ? "Not spam" : "Mark as spam"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!canDelete}
            onClick={() => onDelete(submission)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
