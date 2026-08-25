import { Link, useLocation } from "react-router-dom";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebarActions,
} from "@/components/ui/sidebar";
import { env } from "@/config/env";
import { findNavItem, NAV_ITEMS } from "@/config/navigation";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  // Actions only: this component must not re-render on every collapse toggle.
  const { isMobile, setOpenMobile } = useSidebarActions();
  const activeItem = findNavItem(pathname);

  // On mobile the sidebar is a drawer over the page; navigating has to close it.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-(--header-height) justify-center border-b border-sidebar-border px-2.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              to="/dashboard"
              onClick={closeOnMobile}
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <span className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                V
              </span>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-bold leading-tight text-sidebar-foreground">
                  {env.appName}
                </p>
                <p className="truncate text-[11px] leading-tight text-sidebar-foreground/55">
                  Super Admin Console
                </p>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={activeItem?.path === item.path}
                >
                  <Link to={item.path} onClick={closeOnMobile}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
