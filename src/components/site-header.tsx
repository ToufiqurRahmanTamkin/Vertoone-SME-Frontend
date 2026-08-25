import { useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { findNavItem } from "@/config/navigation";

export function SiteHeader() {
  const { pathname } = useLocation();
  const activeItem = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
        <h2 className="truncate text-sm font-semibold">{activeItem?.title ?? "Vertoone SME"}</h2>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
