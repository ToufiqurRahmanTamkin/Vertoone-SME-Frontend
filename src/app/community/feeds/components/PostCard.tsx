import { MemberAvatar } from "@/app/community/members/components/MemberAvatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { safeDistanceToNow } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  useCommentOnCommunityPostMutation,
  useReactToCommunityPostMutation,
  useRemoveCommunityCommentMutation,
  useUpdateCommunityPostMutation,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  COMMUNITY_POST_STATUS_COLORS,
  COMMUNITY_POST_STATUS_LABELS,
  COMMUNITY_REACTIONS,
  COMMUNITY_REACTION_EMOJI,
  COMMUNITY_REACTION_LABELS,
  type CommunityPost,
  type CommunityReaction,
} from "@/types/domain/community";
import {
  Archive,
  CheckCheck,
  ExternalLink,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pin,
  PinOff,
  Send,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface PostCardProps {
  post: CommunityPost;
  allowComments: boolean;
  allowReactions: boolean;
  onDelete: (post: CommunityPost) => void;
}

export function PostCard({ post, allowComments, allowReactions, onDelete }: PostCardProps) {
  const [comment, setComment] = React.useState("");
  const [showComments, setShowComments] = React.useState(false);

  const [react] = useReactToCommunityPostMutation();
  const [addComment, { isLoading: isCommenting }] = useCommentOnCommunityPostMutation();
  const [removeComment] = useRemoveCommunityCommentMutation();
  const [updatePost] = useUpdateCommunityPostMutation();

  const onReact = async (type: CommunityReaction) => {
    try {
      await react({ id: post._id, type: post.myReaction === type ? null : type }).unwrap();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save your reaction");
    }
  };

  const onComment = async () => {
    if (!comment.trim()) return;
    try {
      await addComment({ id: post._id, body: comment.trim() }).unwrap();
      setComment("");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not add your comment");
    }
  };

  const patchPost = async (body: Parameters<typeof updatePost>[0]["body"], done: string) => {
    try {
      await updatePost({ id: post._id, body }).unwrap();
      toast.success(done);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the post");
    }
  };

  const images = post.attachments.filter((attachment) => attachment.type === "IMAGE");
  const videos = post.attachments.filter((attachment) => attachment.type === "VIDEO");
  const files = post.attachments.filter((attachment) => attachment.type === "FILE");

  return (
    <Card>
      <CardContent className="space-y-3 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <MemberAvatar
            name={post.author?.displayName ?? "Someone"}
            avatarUrl={post.author?.avatarUrl}
            className="size-9"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="truncate text-sm font-semibold">
                {post.author?.displayName ?? "Someone"}
              </p>
              {post.group && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  in
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: post.group.color }}
                  />
                  {post.group.name}
                </span>
              )}
              {post.isPinned && (
                <Badge variant="secondary" className="text-[10px]">
                  <Pin className="size-3" />
                  Pinned
                </Badge>
              )}
              {post.status !== "PUBLISHED" && (
                <StatusBadge
                  color={COMMUNITY_POST_STATUS_COLORS[post.status]}
                  label={COMMUNITY_POST_STATUS_LABELS[post.status]}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {safeDistanceToNow(post.publishedAt ?? post.createdAt)}
            </p>
          </div>

          {post.canModerate && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 cursor-pointer"
                  aria-label="More actions for this post"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {post.status === "PENDING" && (
                  <DropdownMenuItem
                    onSelect={() => void patchPost({ status: "PUBLISHED" }, "Post published")}
                  >
                    <CheckCheck className="size-4" />
                    Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onSelect={() =>
                    void patchPost(
                      { isPinned: !post.isPinned },
                      post.isPinned ? "Unpinned" : "Pinned to the top"
                    )
                  }
                >
                  {post.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                  {post.isPinned ? "Unpin" : "Pin to the top"}
                </DropdownMenuItem>
                {post.status !== "ARCHIVED" && (
                  <DropdownMenuItem
                    onSelect={() => void patchPost({ status: "ARCHIVED" }, "Post archived")}
                  >
                    <Archive className="size-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(post)}>
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {post.body && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
        )}

        {images.length > 0 && (
          <div
            className={cn(
              "grid gap-2 overflow-hidden rounded-lg",
              images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            {images.map((attachment, index) => (
              <img
                key={`${attachment.url}-${index}`}
                src={attachment.url}
                alt={attachment.fileName}
                className="max-h-96 w-full rounded-lg border object-cover"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {videos.map((attachment, index) => (
          <video
            key={`${attachment.url}-${index}`}
            src={attachment.url}
            controls
            className="w-full rounded-lg border"
          />
        ))}

        {files.length > 0 && (
          <div className="space-y-1">
            {files.map((attachment, index) => (
              <a
                key={`${attachment.url}-${index}`}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs hover:bg-muted/40"
              >
                <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{attachment.fileName}</span>
              </a>
            ))}
          </div>
        )}

        {post.linkUrl && (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-primary hover:bg-muted/40"
          >
            <ExternalLink className="size-3.5 shrink-0" />
            <span className="truncate">{post.linkUrl}</span>
          </a>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          {allowReactions ? (
            <div className="flex flex-wrap items-center gap-1">
              {COMMUNITY_REACTIONS.map((type) => {
                const count =
                  post.reactionCounts.find((reaction) => reaction.type === type)?.count ?? 0;
                const isMine = post.myReaction === type;

                return (
                  <Button
                    key={type}
                    type="button"
                    variant={isMine ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 cursor-pointer px-2 text-xs"
                    title={COMMUNITY_REACTION_LABELS[type]}
                    onClick={() => void onReact(type)}
                  >
                    <span aria-hidden>{COMMUNITY_REACTION_EMOJI[type]}</span>
                    {count > 0 && <span>{count}</span>}
                  </Button>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Reactions are switched off</span>
          )}

          {allowComments && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 cursor-pointer text-xs"
              onClick={() => setShowComments((previous) => !previous)}
            >
              <MessageCircle className="size-4" />
              {post.commentCount} comment{post.commentCount === 1 ? "" : "s"}
            </Button>
          )}
        </div>

        {allowComments && showComments && (
          <div className="space-y-3 border-t pt-3">
            {post.comments.map((row) => (
              <div key={row._id} className="flex items-start gap-2">
                <MemberAvatar
                  name={row.member?.displayName ?? "Someone"}
                  avatarUrl={row.member?.avatarUrl}
                  className="size-7"
                />
                <div className="min-w-0 flex-1 rounded-lg bg-muted/40 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold">
                      {row.member?.displayName ?? "Someone"}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {safeDistanceToNow(row.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-xs">{row.body}</p>
                </div>
                {(row.isMine || post.canModerate) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 cursor-pointer"
                    aria-label="Remove this comment"
                    onClick={() =>
                      void removeComment({ id: post._id, commentId: row._id }).unwrap()
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            ))}

            {!post.isCommentingClosed && (
              <div className="flex items-center gap-2">
                <Input
                  value={comment}
                  placeholder="Write a comment"
                  maxLength={2000}
                  onChange={(event) => setComment(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void onComment();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  className="shrink-0 cursor-pointer"
                  aria-label="Post comment"
                  disabled={isCommenting || !comment.trim()}
                  onClick={() => void onComment()}
                >
                  {isCommenting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            )}

            {post.isCommentingClosed && (
              <p className="text-xs text-muted-foreground">Commenting is closed on this post.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
