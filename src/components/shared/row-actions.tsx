import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";

export interface RowAction {
  key: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  disabled?: boolean;
  separated?: boolean;
  variant?: "default" | "destructive";
  className?: string;
}

interface RowActionsProps {
  label: string;
  actions: (RowAction | false | null | undefined)[];
  className?: string;
}

export function RowActions({ label, actions, className }: RowActionsProps) {
  const items = actions.filter((action): action is RowAction => Boolean(action));
  if (items.length === 0) return null;

  return (
    <div className={cn("flex items-center justify-end", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label={label}
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52"
          onClick={(event) => event.stopPropagation()}
        >
          {items.map((action) => (
            <React.Fragment key={action.key}>
              {action.separated && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className={cn("cursor-pointer", action.className)}
                variant={action.variant ?? "default"}
                disabled={action.disabled}
                onClick={action.onSelect}
              >
                <action.icon />
                {action.label}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
