import { NAV_STATUS } from "@/components/navbar/navbar-styles";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRealtime } from "@/contexts/realtime-context";
import { useOnlineStatus } from "@/hooks/use-pwa";
import { cn } from "@/lib/utils";
import { safeDistanceToNow } from "@/lib/date";
import { WifiOff } from "lucide-react";

function StatusDot({ className, ping = false }: { className?: string; ping?: boolean }) {
  return (
    <span className="relative flex size-1.5 shrink-0">
      {ping && (
        <span
          className={cn("absolute inline-flex size-full animate-ping rounded-full", className)}
        />
      )}
      <span className={cn("relative inline-flex size-1.5 rounded-full ring-3", className)} />
    </span>
  );
}

function OfflineBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn(NAV_STATUS, "bg-rose-500/10 text-rose-600 dark:text-rose-400")}>
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

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            NAV_STATUS,
            "hidden md:flex",
            isLive
              ? "text-muted-foreground"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          )}
        >
          {isLive ? (
            <StatusDot className="bg-emerald-500 ring-emerald-500/20" ping />
          ) : (
            <StatusDot className="animate-pulse bg-amber-500 ring-amber-500/20" />
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
