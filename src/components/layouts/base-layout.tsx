"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";
import { cn } from "@/lib/utils";
import type { BaseLayoutProps } from "@/types";
import * as React from "react";

export function BaseLayout({ children }: BaseLayoutProps) {
  const sidebarConfig = useSidebarConfig();
  const config = sidebarConfig?.config || {
    variant: "default",
    collapsible: "icon",
    side: "left",
  };

  // Single source of truth for the authenticated content shell. Every page is
  // rendered inside this padded <main>, so page components must NOT add their
  // own outer padding (p-*, px-*, py-*) — the global spacing below covers all
  // sides consistently and new pages inherit it automatically.
  const content = (
    // overflow-hidden: keep the shell pinned to the viewport height so the inner
    // content div below is the SINGLE scroll area. Without this, SidebarInset's
    // own overflow-auto becomes a second scroller and data-heavy pages scroll the
    // whole shell (growing the layout) instead of just the content.
    <SidebarInset className="overflow-hidden">
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 min-w-0 min-h-0 overflow-auto overscroll-contain">
        {children}
      </div>
      <SiteFooter />
    </SidebarInset>
  );

  const sidebar = (
    <AppSidebar
      variant={config.variant}
      collapsible={config.collapsible}
      side={config.side}
    />
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "calc(var(--spacing) * 16)",
        } as React.CSSProperties
      }
      variant={config.variant}
      className={cn(config.collapsible === "none" ? "sidebar-none-mode" : "")}
    >
      {config.side === "left" ? (
        <>
          {sidebar}
          {content}
        </>
      ) : (
        <>
          {content}
          {sidebar}
        </>
      )}
    </SidebarProvider>
  );
}
