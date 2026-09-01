import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EmailBlock, EmailBlockCatalogue } from "@/types/domain/emailBuilder";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Trash2 } from "lucide-react";
import { EmailBlockIcon } from "./EmailBlockIcon";
import { titleCase } from "../emailBuilder.utils";

interface EmailBlockLayersProps {
  blocks: EmailBlock[];
  catalogue: EmailBlockCatalogue;
  selectedId: string;
  disabled: boolean;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
}

function LayerRow({
  block,
  label,
  icon,
  icons,
  selected,
  disabled,
  onSelect,
  onToggleHidden,
  onDelete,
}: {
  block: EmailBlock;
  label: string;
  icon: string;
  icons: Record<string, string>;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card p-2 transition-colors",
        selected ? "border-primary ring-1 ring-primary/40" : "hover:bg-muted/50",
        isDragging && "opacity-50",
        block.hidden && "opacity-60"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground disabled:cursor-not-allowed"
        disabled={disabled}
        aria-label="Reorder block"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
          <EmailBlockIcon name={icon} icons={icons} className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium">{label}</span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {block.hidden ? "Hidden" : titleCase(block.layout.background)}
          </span>
        </span>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        disabled={disabled}
        onClick={onToggleHidden}
        aria-label={block.hidden ? "Show block" : "Hide block"}
      >
        {block.hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-destructive hover:text-destructive"
        disabled={disabled}
        onClick={onDelete}
        aria-label="Remove block"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

export function EmailBlockLayers({
  blocks,
  catalogue,
  selectedId,
  disabled,
  onSelect,
  onToggleHidden,
  onDelete,
}: EmailBlockLayersProps) {
  if (blocks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
        No blocks yet. Drag one in from the Blocks tab to start your email.
      </div>
    );
  }

  return (
    <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-1.5">
        {blocks.map((block) => {
          const definition = catalogue.blocks.find((entry) => entry.type === block.type);

          return (
            <LayerRow
              key={block.id}
              block={block}
              label={definition?.label ?? block.type}
              icon={definition?.icon ?? "TEXT"}
              icons={catalogue.icons}
              selected={block.id === selectedId}
              disabled={disabled}
              onSelect={() => onSelect(block.id)}
              onToggleHidden={() => onToggleHidden(block.id)}
              onDelete={() => onDelete(block.id)}
            />
          );
        })}
      </div>
    </SortableContext>
  );
}
