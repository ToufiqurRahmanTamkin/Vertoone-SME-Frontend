import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import type { WorkspaceOption } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

export const WorkspaceSwitcher = React.memo(function WorkspaceSwitcher({
  options,
  activeId,
  onSelect,
}: {
  options: WorkspaceOption[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const navigate = useNavigate();
  const { setOpenMobile, isMobile } = useSidebar();
  const active = options.find((option) => option.id === activeId) ?? options[0];

  if (!active) return null;

  const ActiveIcon = active.icon;

  const trigger = (
    <SidebarMenuButton
      size="lg"
      className={cn(
        "h-11 gap-2.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5",
        options.length > 1 &&
          "cursor-pointer hover:bg-primary/15 data-[state=open]:bg-primary/15"
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <ActiveIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
        <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-sidebar-foreground/55">
          Module
        </span>
        <span className="block truncate text-[13px] font-semibold leading-tight text-sidebar-foreground">
          {active.label}
        </span>
      </span>
      {options.length > 1 && (
        <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/45 group-data-[collapsible=icon]:hidden" />
      )}
    </SidebarMenuButton>
  );

  if (options.length === 1) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        className="w-64"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch module
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.id}
            className="cursor-pointer items-start gap-2.5 py-2"
            onSelect={() => {
              onSelect(option.id);
              navigate(option.landingPath);
              if (isMobile) setOpenMobile(false);
            }}
          >
            <span
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                option.id === active.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <option.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium">{option.label}</span>
                {option.id === active.id && <Check className="size-3.5 text-primary" />}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                {option.description}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
