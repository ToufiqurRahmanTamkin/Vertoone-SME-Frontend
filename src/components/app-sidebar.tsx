import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_NAME, APP_TAGLINE, BRAND_MARK } from "@/config/branding";
import { getNavigation } from "@/config/navigation";
import { usePermissions } from "@/hooks/use-permission";
import { selectCurrentUser } from "@/redux/authSlice";
import * as React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector(selectCurrentUser);
  const role = user?.role ?? "";
  const { modules } = usePermissions();

  const navGroups = React.useMemo(() => getNavigation(role, modules), [role, modules]);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-(--header-height) justify-center gap-0 border-b border-sidebar-border p-0 px-2 group-data-[collapsible=icon]:px-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              to="/dashboard"
              className="flex h-9 items-center gap-2.5 rounded-lg px-1.5 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <img
                src={BRAND_MARK}
                alt={APP_NAME}
                className="size-7 shrink-0 object-contain group-data-[collapsible=icon]:size-6"
              />
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-[13px] font-bold leading-none text-sidebar-foreground">
                  {APP_NAME}
                </p>
                <p className="mt-1 truncate text-[10px] leading-none text-sidebar-foreground/55">
                  {APP_TAGLINE}
                </p>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0 py-2">
        {navGroups.map((group, index) => (
          <NavMain
            key={`${group.label}-${index}`}
            label={group.label}
            items={group.items}
            collapsible={props.collapsible}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
