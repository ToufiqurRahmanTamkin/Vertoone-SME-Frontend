import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date";
import type { CommunityMessage } from "@/types/domain/community";
import { CornerUpLeft, MoreVertical, Paperclip, Pencil, Trash2 } from "lucide-react";
import { MemberAvatar } from "../../members/components/MemberAvatar";

interface MessageBubbleProps {
  message: CommunityMessage;
  showAuthor: boolean;
  onReply: (message: CommunityMessage) => void;
  onEdit: (message: CommunityMessage) => void;
  onDelete: (message: CommunityMessage) => void;
}

export function MessageBubble({
  message,
  showAuthor,
  onReply,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const mine = message.isMine;

  return (
    <div className={cn("group flex items-end gap-2", mine ? "flex-row-reverse" : "flex-row")}>
      <div className="w-8 shrink-0">
        {showAuthor && !mine && (
          <MemberAvatar
            name={message.sender?.displayName ?? "Someone"}
            avatarUrl={message.sender?.avatarUrl}
          />
        )}
      </div>

      <div className={cn("flex max-w-[75%] flex-col gap-1", mine && "items-end")}>
        {showAuthor && !mine && (
          <span className="px-1 text-xs font-medium text-muted-foreground">
            {message.sender?.displayName ?? "Someone"}
          </span>
        )}

        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm",
            mine
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-muted text-foreground"
          )}
        >
          {message.replyTo && (
            <div
              className={cn(
                "mb-2 rounded-lg border-l-2 px-2 py-1 text-xs",
                mine
                  ? "border-primary-foreground/50 bg-primary-foreground/10"
                  : "border-muted-foreground/40 bg-background/60"
              )}
            >
              <p className="font-medium">
                {message.replyTo.sender?.displayName ?? "Someone"}
              </p>
              <p className="line-clamp-2 opacity-80">{message.replyTo.body}</p>
            </div>
          )}

          {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}

          {message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment) =>
                attachment.type === "IMAGE" ? (
                  <a
                    key={attachment.url}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-lg"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.fileName || "Attachment"}
                      className="max-h-64 w-full object-cover"
                    />
                  </a>
                ) : (
                  <a
                    key={attachment.url}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs underline-offset-2 hover:underline",
                      mine ? "bg-primary-foreground/10" : "bg-background/60"
                    )}
                  >
                    <Paperclip className="size-3.5 shrink-0" />
                    <span className="truncate">{attachment.fileName || "Attachment"}</span>
                  </a>
                )
              )}
            </div>
          )}

          <p
            className={cn(
              "mt-1 text-[10px]",
              mine ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {formatDateTime(message.createdAt)}
            {message.isEdited && " · edited"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 cursor-pointer"
              aria-label="Message actions"
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={mine ? "start" : "end"}>
            <DropdownMenuItem onSelect={() => onReply(message)}>
              <CornerUpLeft className="size-4" />
              Reply
            </DropdownMenuItem>
            {message.canEdit && (
              <DropdownMenuItem onSelect={() => onEdit(message)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
            )}
            {message.canDelete && (
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(message)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
