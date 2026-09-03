import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";
import * as React from "react";

interface SignaturePadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  disabled?: boolean;
}

const WIDTH = 600;
const HEIGHT = 200;

export function SignaturePad({ value, onChange, disabled = false }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const [hasInk, setHasInk] = React.useState(Boolean(value));

  const context = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#18181b";
    return ctx;
  };

  const pointOf = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const ctx = context();
    if (!ctx) return;
    drawing.current = true;
    canvasRef.current?.setPointerCapture(event.pointerId);
    const { x, y } = pointOf(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = context();
    if (!ctx) return;
    const { x, y } = pointOf(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInk(true);
  };

  const end = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
    const canvas = canvasRef.current;
    if (canvas && hasInk) onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = context();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    setHasInk(false);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="w-full cursor-crosshair touch-none rounded-lg border bg-background"
        style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        aria-label="Draw your signature"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {hasInk ? "Looks good — you can redraw it if you need to." : "Draw your signature above."}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 cursor-pointer text-xs"
          disabled={!hasInk || disabled}
          onClick={clear}
        >
          <Eraser className="size-3" />
          Clear
        </Button>
      </div>
    </div>
  );
}
