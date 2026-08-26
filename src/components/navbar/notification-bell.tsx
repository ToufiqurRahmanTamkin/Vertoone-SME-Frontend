import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { NOTIFICATION_TYPE_LABELS } from "@/constant";
import { safeDistanceToNow } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  useClearNotificationsMutation,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/redux/apis/notificationApis";
import { useRealtime } from "@/contexts/realtime-context";
import type { ApiErrorResponse } from "@/redux/baseApi";
import type { AppNotification, NotificationLevel } from "@/types/domain/notification";
import {
  Bell,
  BellOff,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  Info,
  Loader2,
  ShieldAlert,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// With a live socket the count is pushed, so polling only needs to cover the
// gap while the connection is down (or on a serverless deployment where there
// is no socket at all).
const UNREAD_POLL_INTERVAL_MS = 60_000;
const UNREAD_POLL_INTERVAL_LIVE_MS = 300_000;
const PANEL_LIMIT = 12;

const LEVEL_ICONS: Record<NotificationLevel, LucideIcon> = {
  INFO: Info,
  SUCCESS: CircleCheck,
  WARNING: ShieldAlert,
  ERROR: CircleAlert,
};

const LEVEL_STYLES: Record<NotificationLevel, string> = {
  INFO: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  SUCCESS: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  WARNING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ERROR: "bg-red-500/10 text-red-600 dark:text-red-400",
};

interface NotificationRowProps {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
}

function NotificationRow({ notification, onOpen }: NotificationRowProps) {
  const Icon = LEVEL_ICONS[notification.level] ?? Info;

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/60",
        !notification.isRead && "bg-primary/[0.04]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          LEVEL_STYLES[notification.level] ?? LEVEL_STYLES.INFO
        )}
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {notification.title}
          </span>
          {!notification.isRead && (
            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />
          )}
        </span>
        {notification.message && (
          <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
            {notification.message}
          </span>
        )}
        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
            {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
          </span>
          <span>·</span>
          <span>{safeDistanceToNow(notification.createdAt)}</span>
        </span>
      </span>
    </button>
  );
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const { isLive } = useRealtime();

  const { data: unreadCount } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: isLive ? UNREAD_POLL_INTERVAL_LIVE_MS : UNREAD_POLL_INTERVAL_MS,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data, isLoading, isFetching } = useGetNotificationsQuery(
    { limit: PANEL_LIMIT },
    { skip: !open }
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [clearAll, { isLoading: isClearing }] = useClearNotificationsMutation();

  const notifications = data?.data ?? [];
  const unread = unreadCount?.unread ?? 0;
  const badgeLabel = unread > 99 ? "99+" : String(unread);

  const openNotification = async (notification: AppNotification) => {
    setOpen(false);
    if (!notification.isRead) {
      await markRead(notification._id).unwrap().catch(() => undefined);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not mark notifications as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll().unwrap();
      toast.success("Notifications cleared");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not clear notifications");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 cursor-pointer rounded-full"
          aria-label={unread > 0 ? `Notifications — ${unread} unread` : "Notifications"}
        >
          <Bell className="size-[1.15rem]" />
          {unread > 0 && (
            <>
              <span className="absolute right-1 top-1 flex size-2 animate-ping rounded-full bg-primary/60" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground tabular-nums">
                {badgeLabel}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none">Notifications</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "You are all caught up"}
            </p>
          </div>
          {isFetching && <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />}
        </div>

        <ScrollArea className="max-h-[min(24rem,60vh)]">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="size-8 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationRow
                key={notification._id}
                notification={notification}
                onOpen={openNotification}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <BellOff className="size-5" />
              </span>
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground">
                Sales, payment reviews and security alerts land here.
              </p>
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="flex items-center justify-between gap-2 border-t bg-muted/40 px-2 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 cursor-pointer gap-1.5 text-xs"
              disabled={unread === 0 || isMarkingAll}
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 cursor-pointer gap-1.5 text-xs text-destructive hover:text-destructive"
              disabled={isClearing}
              onClick={handleClearAll}
            >
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
