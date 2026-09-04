import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initialsOf } from "@/types/domain/community";

interface MemberAvatarProps {
  name: string;
  avatarUrl?: string;
  className?: string;
}

export function MemberAvatar({ name, avatarUrl, className }: MemberAvatarProps) {
  return (
    <Avatar className={cn("size-8 shrink-0", className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
      <AvatarFallback className="text-[10px] font-semibold">
        {initialsOf(name) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
