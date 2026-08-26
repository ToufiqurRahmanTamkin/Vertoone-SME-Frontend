import { ModeToggle } from "@/components/mode-toggle";
import { ConnectionStatus } from "@/components/navbar/connection-status";
import { GlobalSearch } from "@/components/navbar/global-search";
import { InstallAppButton } from "@/components/navbar/install-app-button";
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
        "sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-border after:to-transparent",
        headerTransparency
          ? "bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
          : "bg-background"
      )}
    >
      <div className="flex w-full items-center gap-2 px-3 lg:gap-3 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SidebarTrigger className="size-9 shrink-0 cursor-pointer rounded-xl transition-all hover:bg-accent active:scale-95" />

          <PageIdentity className="flex-1" />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">
          <GlobalSearch />

          <PendingApprovals />

          <ConnectionStatus />

          <div className="flex items-center gap-0.5 rounded-full border bg-muted/40 p-0.5 shadow-sm">
            <InstallAppButton />
            <NotificationBell />
            <ThemeCustomizerTrigger
              variant="ghost"
              className="hidden size-9 cursor-pointer rounded-full transition-transform active:scale-90 sm:inline-flex [&>svg]:size-[1.15rem]"
              onClick={() => setThemeCustomizerOpen(true)}
            />
            <ModeToggle
              variant="ghost"
              className="size-9 rounded-full transition-transform active:scale-90"
            />
          </div>

          <ThemeCustomizer open={themeCustomizerOpen} onOpenChange={setThemeCustomizerOpen} />

          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
