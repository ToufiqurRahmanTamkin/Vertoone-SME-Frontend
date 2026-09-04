import { cn } from "@/lib/utils";
import { initialsOf } from "@/types/domain/community";

interface GroupAvatarProps {
  name: string;
  color: string;
  logoUrl?: string;
  className?: string;
}

export function GroupAvatar({ name, color, logoUrl, className }: GroupAvatarProps) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cover bg-center text-xs font-semibold text-white",
        className
      )}
      style={{
        backgroundColor: color,
        backgroundImage: logoUrl ? `url(${logoUrl})` : undefined,
      }}
      aria-hidden={logoUrl ? undefined : true}
    >
      {logoUrl ? "" : initialsOf(name)}
    </span>
  );
}
