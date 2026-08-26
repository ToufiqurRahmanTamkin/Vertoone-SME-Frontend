import { getBreadcrumbTrail } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import * as React from "react";
import { Link, useLocation } from "react-router-dom";

export function HeaderBreadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  const trail = React.useMemo(
    () => getBreadcrumbTrail(location.pathname),
    [location.pathname]
  );

  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1 text-sm">
        {trail.map((entry) => (
          <li key={entry.path} className="flex min-w-0 items-center gap-1">
            {entry.isCurrent ? (
              <span aria-current="page" className="truncate font-semibold text-foreground">
                {entry.title}
              </span>
            ) : (
              <>
                {entry.isLinkable ? (
                  <Link
                    to={entry.path}
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {entry.title}
                  </Link>
                ) : (
                  <span className="truncate text-muted-foreground">{entry.title}</span>
                )}
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
