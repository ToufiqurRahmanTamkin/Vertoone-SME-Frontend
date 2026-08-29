import { ModeToggle } from "@/components/mode-toggle";
import { CompanyDetails } from "@/components/navbar/company-details";
import { ConnectionStatus } from "@/components/navbar/connection-status";
import { GlobalSearch } from "@/components/navbar/global-search";
import { InstallAppButton } from "@/components/navbar/install-app-button";
import { NAV_ICON_BUTTON, NAV_SEPARATOR } from "@/components/navbar/navbar-styles";
import { NotificationBell } from "@/components/navbar/notification-bell";
import { PageIdentity } from "@/components/navbar/page-identity";
import { PendingApprovals } from "@/components/navbar/pending-approvals";
import ProfileDropdown from "@/components/profile-dropdown";
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { type RootState } from "@/redux/store";
import * as React from "react";
import { useSelector } from "react-redux";

export function SiteHeader() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false);
  const { headerTransparency } = useSelector((state: RootState) => state.settings);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center border-b border-border/70",
        headerTransparency
          ? "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
          : "bg-background"
      )}
    >
      <div className="flex w-full items-center gap-2 px-2 sm:px-3 lg:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SidebarTrigger className={NAV_ICON_BUTTON} />
          <span className={cn(NAV_SEPARATOR, "hidden sm:block")} aria-hidden="true" />
          <PageIdentity className="flex-1" />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <PendingApprovals />
          <ConnectionStatus />

          <GlobalSearch />

          <InstallAppButton />
          <CompanyDetails />
          <NotificationBell />
          <ThemeCustomizerTrigger
            variant="ghost"
            className={cn(NAV_ICON_BUTTON, "hidden sm:inline-flex")}
            onClick={() => setThemeCustomizerOpen(true)}
          />
          <ModeToggle variant="ghost" className={NAV_ICON_BUTTON} />

          <span className={NAV_SEPARATOR} aria-hidden="true" />

          <ProfileDropdown />

          <ThemeCustomizer open={themeCustomizerOpen} onOpenChange={setThemeCustomizerOpen} />
        </div>
      </div>
    </header>
  );
}
