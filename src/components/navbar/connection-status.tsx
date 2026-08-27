import { NAV_CHIP } from "@/components/navbar/navbar-styles";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRealtime } from "@/contexts/realtime-context";
import { useOnlineStatus } from "@/hooks/use-pwa";
import { cn } from "@/lib/utils";
import { safeDistanceToNow } from "@/lib/date";
import { RefreshCw, WifiOff } from "lucide-react";

function OfflineBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            NAV_CHIP,
            "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          )}
        >
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

  if (status === "DISABLED") return null;

  const isReconnecting = status === "CONNECTING" || status === "DISCONNECTED";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            NAV_CHIP,
            "hidden transition-colors md:flex",
            isLive
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-muted-foreground/30 bg-muted text-muted-foreground"
          )}
        >
          {isLive ? (
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
          ) : (
            <RefreshCw className={cn("size-3.5 shrink-0", isReconnecting && "animate-spin")} />
          )}
          <span className="hidden xl:inline">{isLive ? "Live" : "Reconnecting"}</span>
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
