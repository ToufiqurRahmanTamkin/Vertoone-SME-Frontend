import type * as React from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * The authenticated shell. Every page renders inside the padded `<main>` below,
 * so page components must not add their own outer padding — the spacing here
 * covers all sides and new pages inherit it.
 */
export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      {/* overflow-hidden pins the shell to the viewport so the content div below
          is the single scroll area, rather than the whole layout growing. */}
      <SidebarInset className="overflow-hidden">
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 overflow-auto overscroll-contain p-4 md:gap-6 md:p-6">
          {children ?? <Outlet />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
