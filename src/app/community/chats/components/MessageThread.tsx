import { FilePickerDialog } from "@/components/shared/file-picker-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useDeleteCommunityMessageMutation,
  useEditCommunityMessageMutation,
  useGetCommunityMessagesQuery,
  useMarkCommunityConversationReadMutation,
  useSendCommunityMessageMutation,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type {
  CommunityConversation,
  CommunityMessage,
  CommunityMessageAttachment,
} from "@/types/domain/community";
import { ArrowLeft, MessagesSquare, Paperclip, SendHorizonal, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { GroupAvatar } from "../../groups/components/GroupAvatar";
import { MemberAvatar } from "../../members/components/MemberAvatar";
import { MessageBubble } from "./MessageBubble";

const PAGE_SIZE = 30;
const MAX_ATTACHMENTS = 5;
const SKELETON_ROWS = Array.from({ length: 5 });

interface MessageThreadProps {
  conversation: CommunityConversation | null;
  canSend: boolean;
  canEditMessages: boolean;
  canDeleteMessages: boolean;
  onBack: () => void;
}

const attachmentTypeOf = (mimeType: string): CommunityMessageAttachment["type"] => {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "FILE";
};

export function MessageThread({
  conversation,
  canSend,
  canEditMessages,
  canDeleteMessages,
  onBack,
}: MessageThreadProps) {
  const conversationId = conversation?._id ?? "";

  const [limit, setLimit] = React.useState(PAGE_SIZE);

  const { data, isLoading, isFetching } = useGetCommunityMessagesQuery(
    { conversationId, limit, sortOrder: "desc" },
    { skip: !conversationId }
  );

  const [sendMessage, { isLoading: isSending }] = useSendCommunityMessageMutation();
  const [editMessage, { isLoading: isEditing }] = useEditCommunityMessageMutation();
  const [deleteMessage, { isLoading: isDeleting }] = useDeleteCommunityMessageMutation();
  const [markRead] = useMarkCommunityConversationReadMutation();

  const [draft, setDraft] = React.useState("");
  const [attachments, setAttachments] = React.useState<CommunityMessageAttachment[]>([]);
  const [replyTo, setReplyTo] = React.useState<CommunityMessage | null>(null);
  const [editingMessage, setEditingMessage] = React.useState<CommunityMessage | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<CommunityMessage | null>(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const messages = React.useMemo(() => [...(data?.data ?? [])].reverse(), [data]);
  const total = data?.meta.total ?? 0;
  const hasMore = messages.length < total;
  const unreadCount = conversation?.unreadCount ?? 0;

  React.useEffect(() => {
    if (!conversationId || unreadCount === 0) return;
    void markRead(conversationId);
  }, [conversationId, unreadCount, markRead]);

  React.useEffect(() => {
    if (limit !== PAGE_SIZE) return;
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, limit]);

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <MessagesSquare className="size-8 text-muted-foreground" />
        <p className="font-medium">Pick a conversation</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Every group you belong to has its own chat. You can also message anybody in the community
          one to one.
        </p>
      </div>
    );
  }

  const resetComposer = () => {
    setDraft("");
    setAttachments([]);
    setReplyTo(null);
    setEditingMessage(null);
  };

  const submit = async () => {
    const body = draft.trim();
    if (!body && attachments.length === 0) return;

    try {
      if (editingMessage) {
        await editMessage({
          conversationId: conversation._id,
          messageId: editingMessage._id,
          body,
        }).unwrap();
        toast.success("Message updated");
      } else {
        await sendMessage({
          conversationId: conversation._id,
          body: { body, attachments, replyToId: replyTo?._id ?? null },
        }).unwrap();
      }
      resetComposer();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send that message");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteMessage({
        conversationId: conversation._id,
        messageId: pendingDelete._id,
      }).unwrap();
      toast.success("Message removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove that message");
    }
  };

  const startEdit = (message: CommunityMessage) => {
    setEditingMessage(message);
    setReplyTo(null);
    setAttachments([]);
    setDraft(message.body);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  const busy = isSending || isEditing;
  const composerDisabled = !canSend || !conversation.canPost;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b p-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 cursor-pointer lg:hidden"
          aria-label="Back to conversations"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
        </Button>

        {conversation.type === "GROUP" ? (
          <GroupAvatar
            name={conversation.title}
            color={conversation.group?.color ?? "#8b5cf6"}
            logoUrl={conversation.avatarUrl}
            className="size-10"
          />
        ) : (
          <MemberAvatar
            name={conversation.title}
            avatarUrl={conversation.avatarUrl}
            className="size-10"
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{conversation.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.type === "GROUP"
              ? `${conversation.participantCount} member${conversation.participantCount === 1 ? "" : "s"}`
              : (conversation.counterpart?.role.toLowerCase() ?? "Direct message")}
          </p>
        </div>

        <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">
          {conversation.messageCount} message{conversation.messageCount === 1 ? "" : "s"}
        </Badge>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          SKELETON_ROWS.map((_, index) => <Skeleton key={index} className="h-14 w-2/3 rounded-2xl" />)
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <MessagesSquare className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Say hello — everybody here will see it.
            </p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={isFetching}
                  onClick={() => setLimit((current) => current + PAGE_SIZE)}
                >
                  {isFetching ? <LoadingSpinner /> : "Load earlier messages"}
                </Button>
              </div>
            )}

            {messages.map((message, index) => (
              <MessageBubble
                key={message._id}
                message={message}
                showAuthor={
                  conversation.type === "GROUP" &&
                  messages[index - 1]?.senderId !== message.senderId
                }
                onReply={(target) => {
                  setEditingMessage(null);
                  setReplyTo(target);
                }}
                onEdit={canEditMessages ? startEdit : () => undefined}
                onDelete={canDeleteMessages ? setPendingDelete : () => undefined}
              />
            ))}
          </>
        )}
      </div>

      <div className="border-t p-3">
        {composerDisabled ? (
          <p className="rounded-lg border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
            {canSend
              ? "This conversation is read only."
              : "You do not have permission to send messages."}
          </p>
        ) : (
          <div className="space-y-2">
            {(replyTo || editingMessage) && (
              <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">
                    {editingMessage
                      ? "Editing your message"
                      : `Replying to ${replyTo?.sender?.displayName ?? "someone"}`}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {(editingMessage ?? replyTo)?.body}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 cursor-pointer"
                  aria-label="Cancel"
                  onClick={resetComposer}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <Badge key={attachment.url} variant="secondary" className="gap-1 text-[10px]">
                    <Paperclip className="size-3" />
                    <span className="max-w-40 truncate">
                      {attachment.fileName || "Attachment"}
                    </span>
                    <button
                      type="button"
                      className="cursor-pointer"
                      aria-label={`Remove ${attachment.fileName || "attachment"}`}
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter((entry) => entry.url !== attachment.url)
                        )
                      }
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 shrink-0 cursor-pointer"
                aria-label="Attach a file"
                disabled={busy || Boolean(editingMessage)}
                onClick={() => setPickerOpen(true)}
              >
                <Paperclip className="size-4" />
              </Button>

              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Write a message. Enter sends, Shift+Enter starts a new line."
                className={cn("max-h-40 min-h-9 resize-none py-2")}
                disabled={busy}
              />

              <Button
                type="button"
                size="icon"
                className="size-9 shrink-0 cursor-pointer"
                aria-label={editingMessage ? "Save message" : "Send message"}
                disabled={busy || (!draft.trim() && attachments.length === 0)}
                onClick={() => void submit()}
              >
                {busy ? <LoadingSpinner /> : <SendHorizonal className="size-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      <FilePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        multiple
        title="Attach files"
        description={`Pick up to ${MAX_ATTACHMENTS} files from your file manager.`}
        onSelect={(files) => {
          setAttachments((current) => {
            const known = new Set(current.map((entry) => entry.url));
            const additions = files
              .filter((file) => !known.has(file.url))
              .map((file) => ({
                type: attachmentTypeOf(file.mimeType),
                url: file.url,
                publicId: file.publicId,
                fileName: file.fileName || file.name,
                mimeType: file.mimeType,
                fileSize: file.fileSize,
              }));

            const next = [...current, ...additions];
            if (next.length > MAX_ATTACHMENTS) {
              toast.warning(`A message can carry at most ${MAX_ATTACHMENTS} attachments`);
            }
            return next.slice(0, MAX_ATTACHMENTS);
          });
          setPickerOpen(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this message?"
        description="It disappears for everybody in the conversation."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
