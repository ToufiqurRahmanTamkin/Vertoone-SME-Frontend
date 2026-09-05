import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

interface QuickCreateButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function QuickCreateButton({
  label,
  onClick,
  disabled = false,
  className,
}: QuickCreateButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "size-6 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <Settings className="size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
