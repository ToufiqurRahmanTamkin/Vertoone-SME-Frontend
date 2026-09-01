import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FieldCatalogue, FormField } from "@/types/domain/formBuilder";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Trash2 } from "lucide-react";
import { FieldIcon } from "./FieldIcon";

interface FieldLayersProps {
  fields: FormField[];
  catalogue: FieldCatalogue;
  selectedId: string;
  disabled: boolean;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
}

function LayerRow({
  field,
  typeLabel,
  icon,
  icons,
  collectsAnswer,
  selected,
  disabled,
  onSelect,
  onToggleHidden,
  onDelete,
}: {
  field: FormField;
  typeLabel: string;
  icon: string;
  icons: Record<string, string>;
  collectsAnswer: boolean;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
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
        field.hidden && "opacity-60"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground disabled:cursor-not-allowed"
        disabled={disabled}
        aria-label="Reorder question"
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
          <FieldIcon name={icon} icons={icons} className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium">
            {field.label.trim() || typeLabel}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </span>
          <span className="block truncate font-mono text-[11px] text-muted-foreground">
            {field.hidden ? "Hidden" : collectsAnswer ? field.key : typeLabel}
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
        aria-label={field.hidden ? "Show question" : "Hide question"}
      >
        {field.hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-destructive hover:text-destructive"
        disabled={disabled}
        onClick={onDelete}
        aria-label="Remove question"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

export function FieldLayers({
  fields,
  catalogue,
  selectedId,
  disabled,
  onSelect,
  onToggleHidden,
  onDelete,
}: FieldLayersProps) {
  if (fields.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
        No questions yet. Add one from the library to start the form.
      </div>
    );
  }

  return (
    <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-1.5">
        {fields.map((field) => {
          const definition = catalogue.fields.find((entry) => entry.type === field.type);

          return (
            <LayerRow
              key={field.id}
              field={field}
              typeLabel={definition?.label ?? field.type}
              icon={definition?.icon ?? "TEXT"}
              icons={catalogue.icons}
              collectsAnswer={definition?.collectsAnswer ?? false}
              selected={field.id === selectedId}
              disabled={disabled}
              onSelect={() => onSelect(field.id)}
              onToggleHidden={() => onToggleHidden(field.id)}
              onDelete={() => onDelete(field.id)}
            />
          );
        })}
      </div>
    </SortableContext>
  );
}
