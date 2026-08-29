import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Check, Loader2, Minus, Plus, RotateCcw } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;
const NUDGE_PX = 12;
const DEFAULT_MAX_OUTPUT_WIDTH = 1600;

export interface ImageCropperDialogProps {
  open: boolean;
  src: string | null;
  aspect: number;
  fileName?: string;
  mimeType?: string;
  title?: string;
  description?: string;
  maxOutputWidth?: number;
  maxOutputBytes?: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const withExtension = (name: string, type: string) => {
  const extension = type === "image/png" ? "png" : "jpg";
  const base = name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}.${extension}`;
};

export function ImageCropperDialog({
  open,
  src,
  aspect,
  fileName = "image",
  mimeType = "image/png",
  title = "Adjust image",
  description = "Drag to reposition, scroll or use the slider to zoom.",
  maxOutputWidth = DEFAULT_MAX_OUTPUT_WIDTH,
  maxOutputBytes,
  onCancel,
  onConfirm,
}: ImageCropperDialogProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [natural, setNatural] = React.useState<{ width: number; height: number } | null>(null);
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 });
  const [zoom, setZoom] = React.useState(MIN_ZOOM);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isRendering, setIsRendering] = React.useState(false);

  const [loadedSrc, setLoadedSrc] = React.useState(src);
  if (loadedSrc !== src) {
    setLoadedSrc(src);
    setNatural(null);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  }

  React.useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      setViewport({ width: box.width, height: box.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [open, src]);

  const baseScale =
    natural && viewport.width > 0
      ? Math.max(viewport.width / natural.width, viewport.height / natural.height)
      : 0;

  const clampOffset = React.useCallback(
    (next: { x: number; y: number }, nextZoom: number) => {
      if (!natural || baseScale === 0) return { x: 0, y: 0 };
      const scale = baseScale * nextZoom;
      const maxX = Math.max(0, (natural.width * scale - viewport.width) / 2);
      const maxY = Math.max(0, (natural.height * scale - viewport.height) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [baseScale, natural, viewport.height, viewport.width]
  );

  const applyZoom = React.useCallback(
    (nextZoom: number) => {
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
      const ratio = clamped / zoom;
      setOffset(clampOffset({ x: offset.x * ratio, y: offset.y * ratio }, clamped));
      setZoom(clamped);
    },
    [clampOffset, offset.x, offset.y, zoom]
  );

  React.useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      applyZoom(zoom - event.deltaY * 0.002);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [applyZoom, zoom, open, src]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!natural || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset(
      clampOffset(
        {
          x: drag.originX + (event.clientX - drag.startX),
          y: drag.originY + (event.clientY - drag.startY),
        },
        zoom
      )
    );
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -NUDGE_PX, y: 0 },
      ArrowRight: { x: NUDGE_PX, y: 0 },
      ArrowUp: { x: 0, y: -NUDGE_PX },
      ArrowDown: { x: 0, y: NUDGE_PX },
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      setOffset((previous) => clampOffset({ x: previous.x + move.x, y: previous.y + move.y }, zoom));
      return;
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      applyZoom(zoom + ZOOM_STEP);
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      applyZoom(zoom - ZOOM_STEP);
    }
  };

  const reset = () => {
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = async () => {
    const image = imageRef.current;
    if (!image || !natural || baseScale === 0) return;

    setIsRendering(true);
    try {
      const scale = baseScale * zoom;
      const sourceWidth = viewport.width / scale;
      const sourceHeight = viewport.height / scale;
      const sourceX = natural.width / 2 - offset.x / scale - sourceWidth / 2;
      const sourceY = natural.height / 2 - offset.y / scale - sourceHeight / 2;

      const outputWidth = Math.max(1, Math.round(Math.min(sourceWidth, maxOutputWidth)));
      const outputHeight = Math.max(1, Math.round(outputWidth / aspect));

      const keepsAlpha = mimeType === "image/png" || mimeType === "image/webp";
      let outputType = keepsAlpha ? "image/png" : "image/jpeg";

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      if (outputType === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, outputWidth, outputHeight);
      }
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );

      let blob = await toBlob(canvas, outputType, 0.92);
      if (blob && outputType === "image/png" && maxOutputBytes && blob.size > maxOutputBytes) {
        const flattened = document.createElement("canvas");
        flattened.width = outputWidth;
        flattened.height = outputHeight;
        const flatContext = flattened.getContext("2d");
        if (!flatContext) throw new Error("Canvas is unavailable");
        flatContext.fillStyle = "#ffffff";
        flatContext.fillRect(0, 0, outputWidth, outputHeight);
        flatContext.drawImage(canvas, 0, 0);
        outputType = "image/jpeg";
        blob = await toBlob(flattened, outputType, 0.9);
      }
      if (!blob) throw new Error("Could not encode the image");

      onConfirm(new File([blob], withExtension(fileName, outputType), { type: outputType }));
    } catch {
      toast.error("Could not process that image. Try uploading it without adjusting.");
    } finally {
      setIsRendering(false);
    }
  };

  const displayWidth = natural ? natural.width * baseScale * zoom : 0;
  const displayHeight = natural ? natural.height * baseScale * zoom : 0;
  const isRemote = Boolean(src && !src.startsWith("blob:") && !src.startsWith("data:"));

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isRendering && onCancel()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div
            ref={viewportRef}
            role="application"
            aria-label="Image crop area"
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDown}
            className="relative mx-auto w-full cursor-grab touch-none overflow-hidden rounded-lg border bg-muted select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden active:cursor-grabbing"
            style={{ aspectRatio: String(aspect), maxWidth: `calc(55vh * ${aspect})` }}
          >
            {src && (
              <img
                ref={imageRef}
                src={src}
                alt=""
                draggable={false}
                crossOrigin={isRemote ? "anonymous" : undefined}
                onLoad={(event) => {
                  const element = event.currentTarget;
                  if (!element.naturalWidth || !element.naturalHeight) {
                    toast.error("That image cannot be adjusted here");
                    onCancel();
                    return;
                  }
                  setNatural({ width: element.naturalWidth, height: element.naturalHeight });
                }}
                onError={() => {
                  toast.error("That image could not be opened for editing. Upload it again to adjust it.");
                  onCancel();
                }}
                className="absolute top-1/2 left-1/2 max-w-none"
                style={{
                  width: displayWidth || undefined,
                  height: displayHeight || undefined,
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                  visibility: natural ? "visible" : "hidden",
                }}
              />
            )}

            {!natural && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }, (_, index) => (
                <div key={index} className="border border-white/20" />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0 cursor-pointer"
              onClick={() => applyZoom(zoom - ZOOM_STEP)}
              disabled={!natural || zoom <= MIN_ZOOM}
              aria-label="Zoom out"
            >
              <Minus className="size-4" />
            </Button>
            <Slider
              value={[zoom]}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              disabled={!natural}
              onValueChange={([next]) => applyZoom(next)}
              aria-label="Zoom"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0 cursor-pointer"
              onClick={() => applyZoom(zoom + ZOOM_STEP)}
              disabled={!natural || zoom >= MAX_ZOOM}
              aria-label="Zoom in"
            >
              <Plus className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 cursor-pointer"
              onClick={reset}
              disabled={!natural}
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Reset
            </Button>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onCancel}
            disabled={isRendering}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => void handleConfirm()}
            disabled={!natural || isRendering}
          >
            {isRendering ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Check className="mr-1.5 size-4" />
            )}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
