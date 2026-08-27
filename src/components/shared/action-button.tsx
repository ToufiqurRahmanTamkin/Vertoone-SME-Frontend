import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  icon: LucideIcon;
  label: string;
}

export function ActionButton({ icon: Icon, label, className, title, ...props }: ActionButtonProps) {
  return (
    <Button
      size="icon"
      aria-label={label}
      title={title ?? label}
      className={cn("shrink-0 cursor-pointer sm:w-auto sm:gap-1.5 sm:px-4", className)}
      {...props}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

export function CardActionButton({
  icon: Icon,
  label,
  className,
  title,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={label}
      title={title ?? label}
      className={cn("size-8 shrink-0 cursor-pointer", className)}
      {...props}
    >
      <Icon className="size-4" />
    </Button>
  );
}
