import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

export interface PageHeaderProps {
  /** Page title — short noun phrase. */
  title: string;
  /** One short, concise sentence explaining the page's purpose. */
  description?: string;
  /**
   * Primary page action(s) (e.g. Create / Add / Upload).
   *
   * Placement rule: only pass `actions` here when the page has NO filter/toolbar
   * row. If the page renders filters (e.g. `DataTableToolbar`), pass the action
   * to the toolbar's `actions` prop instead so the button aligns opposite the
   * filters on the same row.
   */
  actions?: React.ReactNode;
  /** Show a back-navigation arrow before the title. */
  showBackButton?: boolean;
  className?: string;
}

/**
 * Standard page header used across the app: a title + concise description on one
 * side, with optional primary actions aligned to the opposite side.
 *
 * Do NOT add outer page padding around this component — the global layout
 * (`BaseLayout`) already provides consistent page padding on all sides.
 */
export function PageHeader({
  title,
  description,
  actions,
  showBackButton = false,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-start gap-2 min-w-0">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="space-y-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

export default PageHeader;
