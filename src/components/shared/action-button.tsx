import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  icon: LucideIcon;
  label: string;
}

/**
 * A toolbar's primary action. A phone has no room for a label beside the search
 * box and the filter trigger, so it collapses to a square icon and keeps the
 * wording as its accessible name. The label returns from `sm` up, which is the
 * same width at which the toolbar stops using its mobile filter drawer.
 */
export function ActionButton({ icon: Icon, label, className, title, ...props }: ActionButtonProps) {
  return (
    <Button
      size="icon"
      aria-label={label}
      // Icon-only on a phone, so it always needs a tooltip; a caller's own
      // title (e.g. "plan limit reached") takes over when it has one to give.
      title={title ?? label}
      className={cn("shrink-0 cursor-pointer sm:w-auto sm:gap-1.5 sm:px-4", className)}
      {...props}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

/**
 * A per-record action inside a mobile card. These cards only render below `md`,
 * so the button is icon-only at every width it is ever seen at.
 */
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
