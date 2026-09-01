import { cn } from "@/lib/utils";
import type { EmailBlockCatalogue, EmailBlockDefinition } from "@/types/domain/emailBuilder";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Plus } from "lucide-react";
import { EmailBlockIcon } from "./EmailBlockIcon";
import { groupDefinitions } from "../emailBuilder.utils";

export const PALETTE_PREFIX = "email-palette:";

interface EmailBlockPaletteProps {
  catalogue: EmailBlockCatalogue;
  disabled: boolean;
  onAdd: (definition: EmailBlockDefinition) => void;
}

function PaletteItem({
  definition,
  icons,
  disabled,
  onAdd,
}: {
  definition: EmailBlockDefinition;
  icons: Record<string, string>;
  disabled: boolean;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${PALETTE_PREFIX}${definition.type}`,
    data: { definition },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group flex items-center gap-2 rounded-lg border bg-card p-2 transition-colors",
        isDragging ? "opacity-40" : "hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground disabled:cursor-not-allowed"
        disabled={disabled}
        aria-label={`Drag ${definition.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
        <EmailBlockIcon name={definition.icon} icons={icons} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{definition.label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{definition.description}</p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        aria-label={`Add ${definition.label}`}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function EmailBlockPalette({ catalogue, disabled, onAdd }: EmailBlockPaletteProps) {
  const groups = groupDefinitions(catalogue.blocks);

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground">
        Drag a block onto the outline, or use the plus to drop it at the end.
      </p>

      {groups.map((group) => (
        <div key={group.group} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {group.group}
          </p>
          <div className="space-y-1.5">
            {group.blocks.map((definition) => (
              <PaletteItem
                key={definition.type}
                definition={definition}
                icons={catalogue.icons}
                disabled={disabled}
                onAdd={() => onAdd(definition)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
