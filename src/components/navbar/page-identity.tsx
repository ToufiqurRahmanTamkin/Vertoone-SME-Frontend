import { findMenuItemByPath, getBreadcrumbTrail } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import * as React from "react";
import { Link, useLocation } from "react-router-dom";

export function PageIdentity({ className }: { className?: string }) {
  const location = useLocation();

  const trail = React.useMemo(
    () => getBreadcrumbTrail(location.pathname),
    [location.pathname]
  );

  const lookup = React.useMemo(
    () => findMenuItemByPath(location.pathname),
    [location.pathname]
  );

  const current = trail.length > 0 ? trail[trail.length - 1].title : "Dashboard";
  const parents = trail.slice(0, -1);
  const section = lookup?.section;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("hidden sm:flex min-w-0 items-center text-sm", className)}
    >
      <ol className="flex min-w-0 items-center gap-1.5">
        {section && (
          <li className="hidden shrink-0 items-center gap-1.5 lg:flex">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
              {section}
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40" />
          </li>
        )}

        {parents.map((entry) => (
          <li key={entry.path} className="hidden min-w-0 items-center gap-1.5 md:flex">
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
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40" />
          </li>
        ))}

        <li className="min-w-0">
          <span
            aria-current="page"
            className="block truncate font-semibold tracking-tight text-foreground"
          >
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
