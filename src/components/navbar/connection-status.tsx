import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRealtime } from "@/contexts/realtime-context";
import { useOnlineStatus } from "@/hooks/use-pwa";
import { cn } from "@/lib/utils";
import { safeDistanceToNow } from "@/lib/date";
import { Radio, RefreshCw, WifiOff } from "lucide-react";

function OfflineBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex h-8 items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          <WifiOff className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">Offline</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        You are offline — cached pages still work, but changes cannot be saved.
      </TooltipContent>
    </Tooltip>
  );
}

export function ConnectionStatus() {
  const isOnline = useOnlineStatus();
  const { status, isLive, lastEventAt } = useRealtime();

  if (!isOnline) return <OfflineBadge />;

  // Realtime off for this deployment: the app polls instead, and there is
  // nothing for the user to act on, so stay out of the way.
  if (status === "DISABLED") return null;

  const isReconnecting = status === "CONNECTING" || status === "DISCONNECTED";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold",
            isLive
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-muted-foreground/30 bg-muted text-muted-foreground"
          )}
        >
          {isLive ? (
            <Radio className="size-3.5 shrink-0" />
          ) : (
            <RefreshCw className={cn("size-3.5 shrink-0", isReconnecting && "animate-spin")} />
          )}
          <span className="hidden sm:inline">{isLive ? "Live" : "Reconnecting"}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {isLive
          ? `Realtime updates are connected${
              lastEventAt ? ` — last update ${safeDistanceToNow(lastEventAt)}` : ""
            }.`
          : "Realtime updates are reconnecting — the app is falling back to periodic refreshes."}
      </TooltipContent>
    </Tooltip>
  );
}
