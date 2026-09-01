import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import * as React from "react";

export type CanvasDevice = "DESKTOP" | "TABLET" | "MOBILE";

const DEVICE_WIDTHS: Record<CanvasDevice, number | null> = {
  DESKTOP: null,
  TABLET: 820,
  MOBILE: 390,
};

interface CanvasMessage {
  source?: string;
  type?: string;
  id?: string;
  targetId?: string;
  position?: "before" | "after";
}

interface BuilderCanvasProps {
  html: string;
  device: CanvasDevice;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, targetId: string, position: "before" | "after") => void;
}

export function BuilderCanvas({ html, device, isLoading, onSelect, onMove }: BuilderCanvasProps) {
  const selectRef = React.useRef(onSelect);
  const moveRef = React.useRef(onMove);

  React.useEffect(() => {
    selectRef.current = onSelect;
    moveRef.current = onMove;
  }, [onSelect, onMove]);

  React.useEffect(() => {
    const handler = (event: MessageEvent<CanvasMessage>) => {
      const message = event.data;
      if (!message || message.source !== "vt-preview") return;

      if (message.type === "select" && message.id) {
        selectRef.current(message.id);
        return;
      }

      if (message.type === "move" && message.id && message.targetId) {
        moveRef.current(message.id, message.targetId, message.position ?? "before");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const width = DEVICE_WIDTHS[device];

  return (
    <div className="relative flex h-full min-h-0 flex-1 justify-center overflow-auto bg-muted/40 p-4">
      {isLoading && (
        <div className="pointer-events-none absolute right-6 top-6 z-10 rounded-full border bg-background/90 p-2 shadow-sm">
          <LoadingSpinner className="size-4" />
        </div>
      )}

      <div
        className={cn(
          "h-full w-full overflow-hidden rounded-xl border bg-background shadow-sm transition-[max-width]",
          width ? "mx-auto" : ""
        )}
        style={width ? { maxWidth: width } : undefined}
      >
        <iframe
          title="Page preview"
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin"
          className="h-full w-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
