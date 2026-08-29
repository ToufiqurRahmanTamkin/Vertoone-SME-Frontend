"use client";

import { cn } from "@/lib/utils";
import type { SidebarConfig } from "@/redux/settingsSlice";
import { Moon, Sun } from "lucide-react";
import * as React from "react";

export interface PreviewCanvasProps {
  styles?: Record<string, string> | null;
  radius: string;
  fontSize: number;
  isDarkMode: boolean;
  glassHeader: boolean;
  sidebar: SidebarConfig;
  presetName?: string;
  isPreviewing?: boolean;
}

const toCssVars = (styles?: Record<string, string> | null): React.CSSProperties => {
  if (!styles) return {};
  const entries = Object.entries(styles)
    .filter(([key]) => key !== "radius")
    .map(([key, value]) => [`--${key}`, value]);
  return Object.fromEntries(entries) as React.CSSProperties;
};

const RAIL_WIDTH: Record<SidebarConfig["collapsible"], string> = {
  offcanvas: "w-0",
  icon: "w-7",
  none: "w-16",
};

function RailLines({ compact }: { compact: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-2">
        <span className="size-3 rounded-[4px] bg-sidebar-primary" />
        <span className="size-3 rounded-[4px] bg-sidebar-foreground/25" />
        <span className="size-3 rounded-[4px] bg-sidebar-foreground/15" />
        <span className="size-3 rounded-[4px] bg-sidebar-foreground/10" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-1.5">
        <span className="size-3 shrink-0 rounded-[4px] bg-sidebar-primary" />
        <span className="h-1.5 w-8 rounded-full bg-sidebar-foreground/30" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-3 shrink-0 rounded-[4px] bg-sidebar-foreground/25" />
        <span className="h-1.5 w-6 rounded-full bg-sidebar-foreground/20" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-3 shrink-0 rounded-[4px] bg-sidebar-foreground/20" />
        <span className="h-1.5 w-7 rounded-full bg-sidebar-foreground/15" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-3 shrink-0 rounded-[4px] bg-sidebar-foreground/15" />
        <span className="h-1.5 w-5 rounded-full bg-sidebar-foreground/10" />
      </div>
    </div>
  );
}

export function PreviewCanvas({
  styles,
  radius,
  fontSize,
  isDarkMode,
  glassHeader,
  sidebar,
  presetName,
  isPreviewing = false,
}: PreviewCanvasProps) {
  const isRight = sidebar.side === "right";
  const isHidden = sidebar.collapsible === "offcanvas";
  const isCompact = sidebar.collapsible === "icon";

  const rail = (
    <div
      className={cn(
        "shrink-0 overflow-hidden bg-sidebar text-sidebar-foreground transition-all duration-300",
        RAIL_WIDTH[sidebar.collapsible],
        sidebar.variant === "floating" && "m-1.5 rounded-md border border-sidebar-border",
        sidebar.variant === "inset" && "my-1.5 rounded-md",
        sidebar.variant === "inset" && (isRight ? "mr-1.5" : "ml-1.5"),
        sidebar.variant === "sidebar" &&
          (isRight ? "border-l border-sidebar-border" : "border-r border-sidebar-border")
      )}
    >
      {!isHidden && <RailLines compact={isCompact} />}
    </div>
  );

  const screen = (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col bg-background",
        sidebar.variant === "inset" && "m-1.5 overflow-hidden rounded-md border border-border"
      )}
    >
      <div
        className={cn(
          "flex h-8 shrink-0 items-center gap-2 border-b border-border px-2.5",
          glassHeader ? "bg-background/60 backdrop-blur-sm" : "bg-background"
        )}
      >
        {isHidden && (
          <span className="flex flex-col gap-[3px]">
            <span className="h-[2px] w-3 rounded-full bg-foreground/50" />
            <span className="h-[2px] w-3 rounded-full bg-foreground/50" />
            <span className="h-[2px] w-3 rounded-full bg-foreground/50" />
          </span>
        )}
        <span className="h-2 w-14 rounded-full bg-foreground/25" />
        <span className="ml-auto flex items-center gap-1.5">
          <span className="h-4 w-12 rounded-md border border-border bg-muted" />
          <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {isDarkMode ? <Moon className="size-2.5" /> : <Sun className="size-2.5" />}
          </span>
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="font-semibold text-foreground"
            style={{ fontSize: Math.round(fontSize * 0.68) }}
          >
            Dashboard
          </span>
          <span
            className="rounded-md bg-primary px-2 py-1 font-medium text-primary-foreground"
            style={{ fontSize: Math.round(fontSize * 0.44) }}
          >
            Action
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="rounded-md border border-border bg-card p-1.5 text-card-foreground"
            >
              <span className="block h-1.5 w-6 rounded-full bg-muted-foreground/40" />
              <span
                className="mt-1 block font-semibold"
                style={{ fontSize: Math.round(fontSize * 0.55) }}
              >
                {index === 0 ? "128" : index === 1 ? "64" : "12"}
              </span>
              <span
                className={cn(
                  "mt-0.5 block h-1 rounded-full",
                  index === 0 ? "w-8 bg-primary" : index === 1 ? "w-5 bg-accent" : "w-3 bg-secondary"
                )}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-4 rounded-md bg-secondary px-2" />
          <span className="h-4 w-10 rounded-md border border-border" />
          <span className="h-4 w-6 rounded-md bg-accent" />
          <span className="ml-auto h-4 w-8 rounded-md bg-destructive/80" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-[12px] border border-border shadow-sm"
        style={{ ...toCssVars(styles), "--radius": radius } as React.CSSProperties}
      >
        <div
          className={cn(
            "flex h-44 bg-background",
            sidebar.variant === "inset" && "bg-sidebar",
            isRight && "flex-row-reverse"
          )}
        >
          {rail}
          {screen}
        </div>
      </div>

      {presetName && (
        <span
          className={cn(
            "pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-full border px-2 py-0.5 text-[10px] font-medium shadow-sm transition-opacity",
            isPreviewing
              ? "border-primary/40 bg-primary text-primary-foreground"
              : "border-border bg-background/90 text-muted-foreground backdrop-blur"
          )}
        >
          {isPreviewing ? `Previewing ${presetName}` : presetName}
        </span>
      )}
    </div>
  );
}
