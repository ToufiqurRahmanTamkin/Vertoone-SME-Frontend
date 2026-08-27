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

  const content = (
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
          "--header-height": "calc(var(--spacing) * 14)",
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
