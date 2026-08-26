import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useOnlineStatus } from "@/hooks/use-pwa";
import { WifiOff } from "lucide-react";

export function ConnectionStatus() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

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
