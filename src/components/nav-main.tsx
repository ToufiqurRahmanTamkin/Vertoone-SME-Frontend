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
import { isMenuPathActive, type NavItem } from "@/config/navigation";
import * as React from "react";

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

interface NavRow {
  item: NavItem;
  hasChildren: boolean;
  isActive: boolean;
  activeChildUrl: string | null;
}

const buildRows = (items: NavItem[], currentPath: string): NavRow[] =>
  items.map((item) => {
    const children = item.items;

    if (!children?.length) {
      return {
        item,
        hasChildren: false,
        isActive: isMenuPathActive(item.url, currentPath),
        activeChildUrl: null,
      };
    }

    const activeChild = children.reduce<NavItem | null>((best, child) => {
      if (!isMenuPathActive(child.url, currentPath)) return best;
      return !best || child.url.length > best.url.length ? child : best;
    }, null);

    return {
      item,
      hasChildren: true,
      isActive: Boolean(activeChild),
      activeChildUrl: activeChild?.url ?? null,
    };
  });

const withActiveParentsOpen = (
  rows: NavRow[],
  previous: Record<string, boolean>
): Record<string, boolean> => {
  let next = previous;

  rows.forEach((row) => {
    if (!row.activeChildUrl || previous[row.item.url]) return;
    if (next === previous) next = { ...previous };
    next[row.item.url] = true;
  });

  return next;
};

const NavLeafRow = React.memo(function NavLeafRow({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate: () => void;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        className={MENU_BUTTON_CLASS}
        isActive={isActive}
      >
        <Link to={item.url} onClick={onNavigate}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

const NavDropdownRow = React.memo(function NavDropdownRow({
  item,
  isActive,
  activeChildUrl,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  activeChildUrl: string | null;
  onNavigate: () => void;
}) {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className={MENU_BUTTON_CLASS} isActive={isActive}>
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
            <DropdownMenuItem key={subItem.url} asChild>
              <Link
                to={subItem.url}
                onClick={onNavigate}
                className={cn(
                  "cursor-pointer",
                  subItem.url === activeChildUrl && "bg-primary/15 font-semibold text-primary"
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
});

const NavBranchRow = React.memo(function NavBranchRow({
  item,
  isActive,
  activeChildUrl,
  isOpen,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  activeChildUrl: string | null;
  isOpen: boolean;
  onToggle: (url: string, open: boolean) => void;
  onNavigate: () => void;
}) {
  const handleOpenChange = React.useCallback(
    (open: boolean) => onToggle(item.url, open),
    [item.url, onToggle]
  );

  return (
    <Collapsible
      asChild
      open={isOpen}
      onOpenChange={handleOpenChange}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} className={MENU_BUTTON_CLASS} isActive={isActive}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <div className="ml-auto flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-sidebar-foreground/40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </div>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <SidebarMenuSub className="mx-3.5 my-1 gap-1 border-sidebar-border">
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.url}>
                <SidebarMenuSubButton
                  asChild
                  className={SUB_BUTTON_CLASS}
                  isActive={subItem.url === activeChildUrl}
                >
                  <Link to={subItem.url} onClick={onNavigate}>
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
});

export const NavMain = React.memo(function NavMain({
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

  const rows = React.useMemo(() => buildRows(items, currentPath), [items, currentPath]);

  const [openState, setOpenState] = React.useState<Record<string, boolean>>(() =>
    withActiveParentsOpen(rows, {})
  );
  const [syncedPath, setSyncedPath] = React.useState(currentPath);

  if (syncedPath !== currentPath) {
    setSyncedPath(currentPath);
    setOpenState((previous) => withActiveParentsOpen(rows, previous));
  }

  const handleNavigate = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  const handleToggle = React.useCallback((url: string, open: boolean) => {
    setOpenState((previous) => (previous[url] === open ? previous : { ...previous, [url]: open }));
  }, []);

  return (
    <SidebarGroup className="px-2.5 py-1">
      {label && (
        <SidebarGroupLabel className="h-7 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-sidebar-foreground/55">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="gap-1">
        {rows.map((row) => {
          if (!row.hasChildren) {
            return (
              <NavLeafRow
                key={row.item.url}
                item={row.item}
                isActive={row.isActive}
                onNavigate={handleNavigate}
              />
            );
          }

          if (isIconCollapsed) {
            return (
              <NavDropdownRow
                key={row.item.url}
                item={row.item}
                isActive={row.isActive}
                activeChildUrl={row.activeChildUrl}
                onNavigate={handleNavigate}
              />
            );
          }

          return (
            <NavBranchRow
              key={row.item.url}
              item={row.item}
              isActive={row.isActive}
              activeChildUrl={row.activeChildUrl}
              isOpen={openState[row.item.url] ?? false}
              onToggle={handleToggle}
              onNavigate={handleNavigate}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
});
