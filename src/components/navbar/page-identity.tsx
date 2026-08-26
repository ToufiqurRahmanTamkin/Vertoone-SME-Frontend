import { ICON_MAP, findMenuItemByPath, getBreadcrumbTrail } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, LayoutGrid } from "lucide-react";
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

  const Icon = (lookup?.item.icon ? ICON_MAP[lookup.item.icon] : undefined) ?? LayoutGrid;
  const title = trail.length > 0 ? trail[trail.length - 1].title : "Dashboard";
  const parents = trail.slice(0, -1);
  const section = lookup?.section;

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary via-primary/90 to-primary/70 shadow-sm shadow-primary/30">
        <Icon className="size-[1.05rem] text-primary-foreground" />
      </span>

      <div className="hidden min-w-0 flex-col justify-center sm:flex">
        <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
          <ol className="flex min-w-0 items-center gap-1 text-[11px] leading-none text-muted-foreground">
            {section && parents.length === 0 && (
              <li className="truncate font-medium uppercase tracking-wide">{section}</li>
            )}
            {parents.map((entry) => (
              <li key={entry.path} className="flex min-w-0 items-center gap-1">
                {entry.isLinkable ? (
                  <Link
                    to={entry.path}
                    className="truncate transition-colors hover:text-foreground"
                  >
                    {entry.title}
                  </Link>
                ) : (
                  <span className="truncate">{entry.title}</span>
                )}
                <ChevronRight className="size-3 shrink-0 opacity-50" />
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="truncate text-[0.95rem] font-semibold leading-tight tracking-tight">
          {title}
        </h1>
      </div>
    </div>
  );
}
