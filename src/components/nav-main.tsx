"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/config/navigation";
import { useEffect, useState } from "react";

const MENU_BUTTON_CLASS = cn(
  "group/btn relative h-9 gap-3 cursor-pointer rounded-lg font-medium transition-all duration-150",
  "text-sidebar-foreground/80 [&>svg]:size-[18px] [&>svg]:text-sidebar-foreground/65",
  "hover:bg-sidebar-accent hover:text-sidebar-foreground hover:[&>svg]:text-sidebar-foreground",
  "data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/25 data-[active=true]:to-primary/5",
  "data-[active=true]:text-primary data-[active=true]:font-semibold data-[active=true]:[&>svg]:text-primary",
  "data-[active=true]:ring-1 data-[active=true]:ring-inset data-[active=true]:ring-primary/20",
  "data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1/2 data-[active=true]:before:h-5 data-[active=true]:before:w-1 data-[active=true]:before:-translate-y-1/2 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-primary data-[active=true]:before:shadow-[0_0_8px_0] data-[active=true]:before:shadow-primary/50"
);

const SUB_BUTTON_CLASS = cn(
  "relative h-8 cursor-pointer rounded-md font-medium text-sidebar-foreground/70 transition-colors duration-150",
  "hover:bg-sidebar-accent hover:text-sidebar-foreground",
  "data-[active=true]:bg-primary/15 data-[active=true]:font-semibold data-[active=true]:text-primary",
  "data-[active=true]:before:absolute data-[active=true]:before:-left-[11px] data-[active=true]:before:top-1/2 data-[active=true]:before:h-4 data-[active=true]:before:w-0.5 data-[active=true]:before:-translate-y-1/2 data-[active=true]:before:rounded-full data-[active=true]:before:bg-primary"
);

export function NavMain({
  label,
  items,
  activePath,
  collapsible = "offcanvas",
}: {
  label: string;
  items: NavItem[];
  activePath?: string;
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const location = useLocation();
  const { setOpenMobile, isMobile, state } = useSidebar();
  const currentPath = activePath ?? location.pathname;
  const isIconCollapsed = collapsible === "icon" && state === "collapsed" && !isMobile;

  const isSubItemActive = (subItem: NavItem) => currentPath === subItem.url;
  const isParentActive = (item: NavItem) => item.items?.some(isSubItemActive) || false;

  const [openState, setOpenState] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.items?.length) {
        initial[item.title] = isParentActive(item);
      }
    });
    return initial;
  });

  useEffect(() => {
    items.forEach((item) => {
      if (item.items?.length && isParentActive(item)) {
        setOpenState((prev) => ({ ...prev, [item.title]: true }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  const handleItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup className="px-2.5 py-1">
      {label && (
        <SidebarGroupLabel className="h-7 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-sidebar-foreground/55">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={MENU_BUTTON_CLASS}
                  isActive={currentPath === item.url}
                >
                  <Link to={item.url} onClick={handleItemClick}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          if (isIconCollapsed) {
            return (
              <SidebarMenuItem key={item.title}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      className={MENU_BUTTON_CLASS}
                      isActive={isParentActive(item)}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="min-w-48">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {item.title}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem key={subItem.title} asChild>
                        <Link
                          to={subItem.url}
                          onClick={handleItemClick}
                          className={cn(
                            "cursor-pointer",
                            isSubItemActive(subItem) && "bg-primary/15 font-semibold text-primary"
                          )}
                        >
                          {subItem.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              open={openState[item.title] ?? false}
              onOpenChange={(open) => setOpenState((prev) => ({ ...prev, [item.title]: open }))}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={MENU_BUTTON_CLASS}
                    isActive={isParentActive(item)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-sidebar-foreground/40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent
                  className={cn(
                    "overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up"
                  )}
                >
                  <SidebarMenuSub className="mx-3.5 my-1 gap-1 border-sidebar-border">
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={SUB_BUTTON_CLASS}
                          isActive={isSubItemActive(subItem)}
                        >
                          <Link to={subItem.url} onClick={handleItemClick}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
