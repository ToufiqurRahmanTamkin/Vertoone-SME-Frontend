import { ModeToggle } from "@/components/mode-toggle";
import { ConnectionStatus } from "@/components/navbar/connection-status";
import { GlobalSearch } from "@/components/navbar/global-search";
import { HeaderBreadcrumbs } from "@/components/navbar/header-breadcrumbs";
import { InstallAppButton } from "@/components/navbar/install-app-button";
import { NotificationBell } from "@/components/navbar/notification-bell";
import ProfileDropdown from "@/components/profile-dropdown";
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { APP_NAME, BRAND_MARK } from "@/config/branding";
import { getBreadcrumbTrail } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { type RootState } from "@/redux/store";
import * as React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

function HeaderBrand() {
  return (
    <Link
      to="/dashboard"
      aria-label={`${APP_NAME} — go to dashboard`}
      className="flex shrink-0 items-center rounded-lg p-1 transition-colors hover:bg-accent md:hidden"
    >
      <img src={BRAND_MARK} alt={APP_NAME} className="size-6 shrink-0 object-contain" />
    </Link>
  );
}

export function SiteHeader() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false);
  const { headerTransparency } = useSelector((state: RootState) => state.settings);
  const location = useLocation();

  const currentPageTitle = React.useMemo(() => {
    const trail = getBreadcrumbTrail(location.pathname);
    return trail.length > 0 ? trail[trail.length - 1].title : "";
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        headerTransparency
          ? "bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
          : "bg-background"
      )}
    >
      <div className="flex w-full items-center gap-2 px-3 lg:gap-3 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SidebarTrigger className="size-9 shrink-0 cursor-pointer rounded-full" />

          <Separator orientation="vertical" className="hidden shrink-0 data-[orientation=vertical]:h-5 md:block" decorative />

          <HeaderBrand />

          <HeaderBreadcrumbs className="hidden md:block" />

          <span className="truncate text-sm font-semibold md:hidden">{currentPageTitle}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <GlobalSearch />

          <ConnectionStatus />

          <div className="flex items-center gap-0.5 rounded-full border bg-muted/30 p-0.5">
            <InstallAppButton />
            <NotificationBell />
            <ThemeCustomizerTrigger
              variant="ghost"
              className="size-9 cursor-pointer rounded-full [&>svg]:size-[1.15rem]"
              onClick={() => setThemeCustomizerOpen(true)}
            />
            <ModeToggle variant="ghost" className="size-9 rounded-full" />
          </div>

          <ThemeCustomizer open={themeCustomizerOpen} onOpenChange={setThemeCustomizerOpen} />

          <Separator orientation="vertical" className="hidden shrink-0 data-[orientation=vertical]:h-6 sm:block" decorative />

          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
