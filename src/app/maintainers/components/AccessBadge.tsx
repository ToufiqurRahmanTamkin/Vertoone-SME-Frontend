import { Badge } from "@/components/ui/badge";
import type { Maintainer } from "@/types/domain/maintainer";

export function AccessBadge({ maintainer }: { maintainer: Maintainer }) {
  const count = Object.values(maintainer.modulePermissions).filter(
    (permission) => permission.canView
  ).length;

  return count === 0 ? (
    <Badge variant="outline" className="text-[10px]">
      No menus
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-[10px]">
      {count} menu{count === 1 ? "" : "s"}
    </Badge>
  );
}
