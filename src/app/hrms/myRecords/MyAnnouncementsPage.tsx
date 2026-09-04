import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useGetAnnouncementFeedQuery,
  useMarkAnnouncementReadMutation,
} from "@/redux/apis/announcementApis";
import {
  ANNOUNCEMENT_PRIORITY_COLORS,
  ANNOUNCEMENT_PRIORITY_LABELS,
  ANNOUNCEMENT_TYPE_LABELS,
  type Announcement,
} from "@/types/domain/announcement";
import { Download, Megaphone, Pin, Search } from "lucide-react";
import * as React from "react";

const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function MyAnnouncementsPage() {
  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState("all");
  const [reading, setReading] = React.useState<Announcement | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetAnnouncementFeedQuery({
    search: debouncedSearch || undefined,
    unreadOnly: tab === "unread" ? true : undefined,
    pinnedOnly: tab === "pinned" ? true : undefined,
    limit: 60,
  });

  const [markRead] = useMarkAnnouncementReadMutation();

  const announcements = data?.data ?? [];
  const unreadCount = announcements.filter((row) => !row.isRead).length;

  const open = (announcement: Announcement) => {
    setReading(announcement);
    if (!announcement.isRead) void markRead(announcement._id);
  };

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Company news that applies to you, newest and pinned first."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>For you</StatLabel>
          <StatValue>{announcements.length}</StatValue>
          <StatDescription>Live announcements you can see</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Unread</StatLabel>
          <StatValue>{unreadCount}</StatValue>
          <StatDescription>
            {unreadCount > 0 ? "Have a read when you get a moment" : "You are all caught up"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Pinned</StatLabel>
          <StatValue>{announcements.filter((row) => row.isPinned).length}</StatValue>
          <StatDescription>Kept at the top by HR</StatDescription>
        </Stat>
      </StatGrid>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all" className="cursor-pointer">
              Everything
            </TabsTrigger>
            <TabsTrigger value="unread" className="cursor-pointer">
              Unread
            </TabsTrigger>
            <TabsTrigger value="pinned" className="cursor-pointer">
              Pinned
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" />
          <TabsContent value="unread" />
          <TabsContent value="pinned" />
        </Tabs>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search announcements..."
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-16 text-center">
          <Megaphone className="size-7 text-muted-foreground" />
          <p className="font-medium">Nothing to read right now</p>
          <p className="max-w-md text-sm text-muted-foreground">
            When HR posts something that applies to you, it lands here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <button
              key={announcement._id}
              type="button"
              onClick={() => open(announcement)}
              className={`flex w-full cursor-pointer gap-4 rounded-xl border bg-card p-4 text-left transition hover:border-primary/40 ${
                announcement.isRead ? "" : "border-primary/30 bg-primary/[0.02]"
              }`}
            >
              {announcement.coverImageUrl && (
                <img
                  src={announcement.coverImageUrl}
                  alt=""
                  loading="lazy"
                  className="hidden h-20 w-32 shrink-0 rounded-lg border object-cover sm:block"
                />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {announcement.isPinned && (
                      <Pin className="size-3.5 shrink-0 text-amber-500" />
                    )}
                    <p className="truncate font-semibold">{announcement.title}</p>
                  </div>
                  {!announcement.isRead && (
                    <Badge className="shrink-0 text-[10px]">New</Badge>
                  )}
                </div>

                {announcement.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {announcement.summary}
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-1">
                  <StatusBadge
                    color={ANNOUNCEMENT_PRIORITY_COLORS[announcement.priority]}
                    label={ANNOUNCEMENT_PRIORITY_LABELS[announcement.priority]}
                  />
                  <Badge variant="secondary" className="text-[10px]">
                    {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {formatDay(announcement.publishedAt ?? announcement.publishAt)}
                  </Badge>
                  {announcement.author && (
                    <Badge variant="outline" className="text-[10px]">
                      {announcement.author.name}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={Boolean(reading)} onOpenChange={(next) => !next && setReading(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{reading?.title ?? ""}</DialogTitle>
            <DialogDescription>
              {reading?.author?.name ? `From ${reading.author.name} · ` : ""}
              {formatDay(reading?.publishedAt ?? reading?.publishAt ?? null)}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {reading?.coverImageUrl && (
              <img
                src={reading.coverImageUrl}
                alt=""
                className="w-full rounded-lg border object-cover"
              />
            )}

            <div className="flex flex-wrap gap-1.5">
              {reading && (
                <StatusBadge
                  color={ANNOUNCEMENT_PRIORITY_COLORS[reading.priority]}
                  label={ANNOUNCEMENT_PRIORITY_LABELS[reading.priority]}
                />
              )}
              {reading && (
                <Badge variant="secondary" className="text-[10px]">
                  {ANNOUNCEMENT_TYPE_LABELS[reading.type]}
                </Badge>
              )}
              {reading?.expiresAt && (
                <Badge variant="outline" className="text-[10px]">
                  Up until {formatDay(reading.expiresAt)}
                </Badge>
              )}
            </div>

            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {reading?.body ?? ""}
            </div>

            {reading && reading.attachments.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Attachments</p>
                {reading.attachments.map((attachment) => (
                  <Button
                    key={attachment.publicId}
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full cursor-pointer justify-start"
                  >
                    <a href={attachment.url} target="_blank" rel="noreferrer" download>
                      <Download className="size-4" />
                      {attachment.fileName || "Attachment"}
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
