import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getNavigationForRole } from "@/config/navigation";
import { APP_NAME, APP_TAGLINE, BRAND_MARK } from "@/config/branding";
import { selectCurrentUser } from "@/redux/authSlice";
import * as React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector(selectCurrentUser);
  const role = user?.role ?? "";

  const navGroups = React.useMemo(() => getNavigationForRole(role), [role]);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-2.5 h-(--header-height)">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              to="/dashboard"
              className="group/brand flex items-center gap-3 rounded-xl px-1.5 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1"
            >
              <img
                src={BRAND_MARK}
                alt={APP_NAME}
                className="size-8 shrink-0 object-contain group-data-[collapsible=icon]:size-7"
              />
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-bold leading-tight text-sidebar-foreground">
                  {APP_NAME}
                </p>
                <p className="truncate text-[11px] leading-tight text-sidebar-foreground/55">
                  {APP_TAGLINE}
                </p>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0 py-2">
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
