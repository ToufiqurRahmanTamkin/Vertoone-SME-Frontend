import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ICON_MAP, findMenuItemByPath } from "@/config/navigation";
import { Compass, Hammer } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function ModulePlaceholderPage() {
  const { pathname } = useLocation();

  const view = useMemo(() => {
    const match = findMenuItemByPath(pathname);
    const section = match?.section ?? "Workspace";
    return {
      title: match?.item.title ?? "Module",
      section,
      parentTitle: match?.parentTitle,
      description:
        match?.item.description ??
        `Part of the ${section} module. The screen is reserved and not connected yet.`,
      icon: (match && ICON_MAP[match.item.icon]) ?? Compass,
    };
  }, [pathname]);

  return (
    <>
      <PageHeader
        title={view.title}
        description={view.description}
        actions={
          <Badge variant="secondary" className="px-2.5 py-1">
            <Hammer className="size-3" />
            UI only
          </Badge>
        }
      />

      <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl border bg-background text-muted-foreground shadow-sm">
          <view.icon className="size-6" />
        </span>
        <div className="space-y-1.5">
          <p className="text-base font-semibold">
            {view.parentTitle ? `${view.section} · ${view.parentTitle}` : view.section}
          </p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            This screen is a placeholder while the menu structure is being finalised. Once the
            module is confirmed, its table, filters and forms are built here.
          </p>
        </div>

        <div className="w-full max-w-3xl space-y-2 pt-2 text-left">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      </div>
    </>
  );
}
