import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { APP_NAME, APP_TAGLINE, BRAND_MARK } from "@/config/branding";
import {
  SWITCHABLE_WORKSPACE_IDS,
  getSidebarBlocks,
  workspaceIdFromPath,
} from "@/config/navigation";
import { useHomeRoute } from "@/hooks/use-home-route";
import { usePermissions } from "@/hooks/use-permission";
import * as React from "react";
import { Link, useLocation } from "react-router-dom";

const ACTIVE_MODULE_KEY = "vertoone.activeModule";

const readStoredModule = (): string | null => {
  const stored = localStorage.getItem(ACTIVE_MODULE_KEY);
  return stored && SWITCHABLE_WORKSPACE_IDS.includes(stored) ? stored : null;
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { menuModules, role } = usePermissions();
  const { pathname } = useLocation();
  const home = useHomeRoute();

  const moduleFromPath = React.useMemo(() => {
    const id = workspaceIdFromPath(pathname);
    return id && SWITCHABLE_WORKSPACE_IDS.includes(id) ? id : null;
  }, [pathname]);

  const [activeModule, setActiveModule] = React.useState(
    () => moduleFromPath ?? readStoredModule()
  );

  if (moduleFromPath && moduleFromPath !== activeModule) {
    setActiveModule(moduleFromPath);
    localStorage.setItem(ACTIVE_MODULE_KEY, moduleFromPath);
  }

  const blocks = React.useMemo(
    () => getSidebarBlocks(role, menuModules, activeModule),
    [role, menuModules, activeModule]
  );

  const selectModule = React.useCallback((id: string) => {
    setActiveModule(id);
    localStorage.setItem(ACTIVE_MODULE_KEY, id);
  }, []);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-(--header-height) justify-center gap-0 border-b border-sidebar-border p-0 px-2 group-data-[collapsible=icon]:px-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              to={home}
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
        {blocks.map((block) => (
          <React.Fragment key={block.id}>
            {block.switcher && (
              <SidebarMenu className="mt-1 border-t border-sidebar-border px-2.5 pb-1 pt-3">
                <SidebarMenuItem>
                  <WorkspaceSwitcher
                    options={block.switcher}
                    activeId={block.id}
                    onSelect={selectModule}
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            )}
            {block.groups.map((group) => (
              <NavMain
                key={`${block.id}-${group.label}`}
                label={group.label}
                items={group.items}
                collapsible={props.collapsible}
              />
            ))}
          </React.Fragment>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
