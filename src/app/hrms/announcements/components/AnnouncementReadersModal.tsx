import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useGetAnnouncementReadersQuery } from "@/redux/apis/announcementApis";
import type { Announcement } from "@/types/domain/announcement";
import { Loader2 } from "lucide-react";

interface AnnouncementReadersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
}

const formatMoment = (value: string): string =>
  new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AnnouncementReadersModal({
  open,
  onOpenChange,
  announcement,
}: AnnouncementReadersModalProps) {
  const { data, isLoading } = useGetAnnouncementReadersQuery(announcement?._id ?? "", {
    skip: !open || !announcement,
  });

  const readers = data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Who has read it</DialogTitle>
          <DialogDescription>{announcement?.title ?? ""}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="space-y-1.5 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">
                {announcement?.readCount ?? 0} of {announcement?.audienceCount ?? 0} people
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {announcement?.readRate ?? 0}%
              </Badge>
            </div>
            <Progress value={announcement?.readRate ?? 0} className="h-1.5" />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : readers.length === 0 ? (
            <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Nobody has opened it yet
            </p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {readers.map((reader) => (
                <div
                  key={`${reader._id}-${reader.readAt}`}
                  className="flex items-center justify-between gap-3 rounded-md border p-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{reader.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{reader.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatMoment(reader.readAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
