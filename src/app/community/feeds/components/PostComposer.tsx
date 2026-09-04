import { MemberAvatar } from "@/app/community/members/components/MemberAvatar";
import { FilePickerDialog } from "@/components/shared/file-picker-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCommunityPostMutation } from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type {
  CommunityAttachment,
  CommunityGroupOption,
  CommunitySettings,
} from "@/types/domain/community";
import type { ManagedFile } from "@/types/domain/fileManager";
import { ImagePlus, Link2, Loader2, Send, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface PostComposerProps {
  groups: CommunityGroupOption[];
  settings: CommunitySettings | undefined;
  authorName: string;
  authorAvatarUrl: string;
  defaultGroupId?: string;
}

const WHOLE_COMMUNITY = "ALL";

const attachmentTypeOf = (file: ManagedFile): CommunityAttachment["type"] => {
  if (file.kind === "IMAGE") return "IMAGE";
  if (file.kind === "VIDEO") return "VIDEO";
  return "FILE";
};

const toAttachment = (file: ManagedFile): CommunityAttachment => ({
  type: attachmentTypeOf(file),
  url: file.url,
  publicId: file.publicId,
  fileName: file.fileName || file.name,
  mimeType: file.mimeType,
  fileSize: file.fileSize,
});

export function PostComposer({
  groups,
  settings,
  authorName,
  authorAvatarUrl,
  defaultGroupId,
}: PostComposerProps) {
  const [body, setBody] = React.useState("");
  const [groupId, setGroupId] = React.useState(defaultGroupId ?? WHOLE_COMMUNITY);
  const [attachments, setAttachments] = React.useState<CommunityAttachment[]>([]);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [showLink, setShowLink] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const [createPost, { isLoading }] = useCreateCommunityPostMutation();

  const [lastDefaultGroupId, setLastDefaultGroupId] = React.useState(defaultGroupId);
  if (lastDefaultGroupId !== defaultGroupId) {
    setLastDefaultGroupId(defaultGroupId);
    setGroupId(defaultGroupId ?? WHOLE_COMMUNITY);
  }

  const allowAttachments = settings?.posting.allowAttachments ?? true;
  const needsApproval = settings?.posting.requirePostApproval ?? false;

  const groupOptions = React.useMemo(
    () => [
      { value: WHOLE_COMMUNITY, label: "Everybody in the community" },
      ...groups.map((group) => ({ value: group._id, label: group.name })),
    ],
    [groups]
  );

  const reset = () => {
    setBody("");
    setAttachments([]);
    setLinkUrl("");
    setShowLink(false);
  };

  const onSubmit = async () => {
    if (!body.trim() && attachments.length === 0) {
      toast.info("Write something or attach a file first");
      return;
    }

    try {
      await createPost({
        body: body.trim(),
        groupId: groupId === WHOLE_COMMUNITY ? null : groupId,
        attachments,
        linkUrl: linkUrl.trim(),
      }).unwrap();

      toast.success(needsApproval ? "Sent for approval" : "Posted");
      reset();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not publish the post");
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4 md:p-5">
        <div className="flex gap-3">
          <MemberAvatar name={authorName} avatarUrl={authorAvatarUrl} className="size-9" />
          <Textarea
            value={body}
            rows={3}
            maxLength={8000}
            placeholder="Share something with the company"
            className="resize-none"
            onChange={(event) => setBody(event.target.value)}
          />
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-12">
            {attachments.map((attachment, index) => (
              <div
                key={`${attachment.url}-${index}`}
                className="relative overflow-hidden rounded-lg border bg-muted/30"
              >
                {attachment.type === "IMAGE" ? (
                  <img
                    src={attachment.url}
                    alt={attachment.fileName}
                    className="size-20 object-cover"
                  />
                ) : (
                  <span className="flex size-20 items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
                    {attachment.fileName}
                  </span>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-1 top-1 size-5 cursor-pointer rounded-full"
                  aria-label={`Remove ${attachment.fileName}`}
                  onClick={() =>
                    setAttachments((previous) =>
                      previous.filter((_, position) => position !== index)
                    )
                  }
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {showLink && (
          <div className="pl-12">
            <Input
              value={linkUrl}
              placeholder="https://"
              onChange={(event) => setLinkUrl(event.target.value)}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pl-12">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger className="h-8 w-56 cursor-pointer text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groupOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {allowAttachments && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 cursor-pointer"
                onClick={() => setPickerOpen(true)}
              >
                <ImagePlus className="size-4" />
                Photo or video
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 cursor-pointer"
              onClick={() => setShowLink((previous) => !previous)}
            >
              <Link2 className="size-4" />
              Link
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            className="cursor-pointer"
            disabled={isLoading}
            onClick={() => void onSubmit()}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {needsApproval ? "Send for approval" : "Post"}
          </Button>
        </div>
      </CardContent>

      <FilePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        multiple
        title="Attach to your post"
        description="Pick something already in your file manager, or upload it now."
        onSelect={(files) =>
          setAttachments((previous) => [...previous, ...files.map(toAttachment)].slice(0, 10))
        }
      />
    </Card>
  );
}
