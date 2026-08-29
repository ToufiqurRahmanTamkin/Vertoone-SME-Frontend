"use client";

import { useSidebar } from "@/components/ui/sidebar";
import {
  sidebarCollapsibleOptions,
  sidebarSideOptions,
  sidebarVariants,
} from "@/config/theme-customizer-constants";
import { useSidebarConfig } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { OptionCard, PanelSection } from "./panel-section";

const RAIL_LINES = (
  <span className="flex flex-col gap-1 p-1">
    <span className="block h-0.5 w-full rounded-full bg-foreground/50" />
    <span className="block h-0.5 w-3/4 rounded-full bg-foreground/40" />
    <span className="block h-0.5 w-2/3 rounded-full bg-foreground/30" />
    <span className="block h-0.5 w-3/4 rounded-full bg-foreground/20" />
  </span>
);

const ICON_RAIL = (
  <span className="flex flex-col items-center gap-1 p-1">
    <span className="block size-1.5 rounded-[2px] bg-foreground/50" />
    <span className="block size-1.5 rounded-[2px] bg-foreground/40" />
    <span className="block size-1.5 rounded-[2px] bg-foreground/30" />
  </span>
);

const Canvas = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "m-1 block flex-1 rounded-sm border border-dashed border-muted-foreground/25 bg-background/60",
      className
    )}
  />
);

export function LayoutTab() {
  const { config: sidebarConfig, updateConfig: updateSidebarConfig } = useSidebarConfig();
  const { toggleSidebar, state: sidebarState } = useSidebar();

  const handleSidebarVariantSelect = (variant: "sidebar" | "floating" | "inset") => {
    updateSidebarConfig({ variant });
  };

  const handleSidebarCollapsibleSelect = (collapsible: "offcanvas" | "icon" | "none") => {
    updateSidebarConfig({ collapsible });

    if (collapsible === "icon" && sidebarState === "expanded") {
      toggleSidebar();
    }
  };

  const handleSidebarSideSelect = (side: "left" | "right") => {
    updateSidebarConfig({ side });
  };

  const activeVariant = sidebarVariants.find((item) => item.value === sidebarConfig.variant);
  const activeCollapsible = sidebarCollapsibleOptions.find(
    (item) => item.value === sidebarConfig.collapsible
  );

  return (
    <div className="space-y-6">
      <PanelSection title="Sidebar style" hint={activeVariant?.description}>
        <div className="grid grid-cols-3 gap-2">
          {sidebarVariants.map((variant) => (
            <OptionCard
              key={variant.value}
              label={variant.name}
              isSelected={sidebarConfig.variant === variant.value}
              onSelect={() => handleSidebarVariantSelect(variant.value)}
            >
              <span
                className={cn(
                  "flex h-full w-full",
                  variant.value === "inset" ? "bg-muted" : "bg-background"
                )}
              >
                <span
                  className={cn(
                    "block w-5 shrink-0 bg-muted",
                    variant.value === "floating" && "m-1 rounded-sm border border-border",
                    variant.value === "inset" && "my-1 ml-1 rounded-sm bg-muted/80",
                    variant.value === "sidebar" && "border-r border-border"
                  )}
                >
                  {RAIL_LINES}
                </span>
                <Canvas className={variant.value === "inset" ? "bg-background" : undefined} />
              </span>
            </OptionCard>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Collapse behaviour" hint={activeCollapsible?.description}>
        <div className="grid grid-cols-3 gap-2">
          {sidebarCollapsibleOptions.map((option) => (
            <OptionCard
              key={option.value}
              label={option.name}
              isSelected={sidebarConfig.collapsible === option.value}
              onSelect={() => handleSidebarCollapsibleSelect(option.value)}
            >
              <span className="flex h-full w-full bg-background">
                {option.value === "offcanvas" ? (
                  <span className="flex flex-1 items-center gap-1 pl-1.5">
                    <span className="flex flex-col gap-0.5">
                      <span className="block h-0.5 w-2.5 rounded-full bg-foreground/50" />
                      <span className="block h-0.5 w-2.5 rounded-full bg-foreground/50" />
                      <span className="block h-0.5 w-2.5 rounded-full bg-foreground/50" />
                    </span>
                    <Canvas />
                  </span>
                ) : option.value === "icon" ? (
                  <>
                    <span className="block w-4 shrink-0 border-r border-border bg-muted">
                      {ICON_RAIL}
                    </span>
                    <Canvas />
                  </>
                ) : (
                  <>
                    <span className="block w-5 shrink-0 border-r border-border bg-muted">
                      {RAIL_LINES}
                    </span>
                    <Canvas />
                  </>
                )}
              </span>
            </OptionCard>
          ))}
        </div>
      </PanelSection>

      <PanelSection
        title="Sidebar position"
        hint={
          sidebarConfig.side === "left"
            ? "Navigation sits on the left, the customizer opens on the right."
            : "Navigation sits on the right, the customizer opens on the left."
        }
      >
        <div className="grid grid-cols-2 gap-2">
          {sidebarSideOptions.map((side) => (
            <OptionCard
              key={side.value}
              label={side.name}
              isSelected={sidebarConfig.side === side.value}
              onSelect={() => handleSidebarSideSelect(side.value)}
            >
              <span
                className={cn(
                  "flex h-full w-full bg-background",
                  side.value === "right" && "flex-row-reverse"
                )}
              >
                <span
                  className={cn(
                    "block w-5 shrink-0 bg-muted",
                    side.value === "left" ? "border-r border-border" : "border-l border-border"
                  )}
                >
                  {RAIL_LINES}
                </span>
                <Canvas />
              </span>
            </OptionCard>
          ))}
        </div>
      </PanelSection>
    </div>
  );
}
