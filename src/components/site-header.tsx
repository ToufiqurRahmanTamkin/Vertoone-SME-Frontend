import { ModeToggle } from "@/components/mode-toggle";
import ProfileDropdown from "@/components/profile-dropdown";
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { APP_NAME, BRAND_MARK } from "@/config/branding";
import { cn } from "@/lib/utils";
import { type RootState } from "@/redux/store";
import * as React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function HeaderBrand() {
  return (
    <Link
      to="/dashboard"
      aria-label={`${APP_NAME} — go to dashboard`}
      className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-accent"
    >
      <img src={BRAND_MARK} alt="" className="size-5 shrink-0 object-contain" />
      <span className="truncate text-sm font-bold leading-none">{APP_NAME}</span>
    </Link>
  );
}

export function SiteHeader() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false);
  const { headerTransparency } = useSelector((state: RootState) => state.settings);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        headerTransparency ? "bg-background/60 backdrop-blur" : "bg-background"
      )}
    >
      <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <HeaderBrand />
        <div className="ml-auto flex items-center gap-2">
          <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
          <ThemeCustomizer open={themeCustomizerOpen} onOpenChange={setThemeCustomizerOpen} />
          <ModeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
