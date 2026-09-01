import { FormInput, FormSwitch } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DEFAULT_TASK_LIST_COLOR, MAX_TASK_LISTS } from "@/types/domain/task";
import type { TaskBoardFormValues } from "@/validations/task";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

const FIELD_GRID = "grid flex-1 items-end grid-cols-2 gap-2 sm:grid-cols-[1fr_2.5rem_4rem_auto_auto]";

interface ListRowProps {
  id: string;
  index: number;
  canRemove: boolean;
  onRemove: (index: number) => void;
}

function ListRow({ id, index, canRemove, onRemove }: ListRowProps) {
  const form = useFormContext<TaskBoardFormValues>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const color = form.watch(`lists.${index}.color`);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border bg-card px-2 py-1.5",
        isDragging && "opacity-60 ring-2 ring-primary/30"
      )}
    >
      <button
        type="button"
        aria-label={`Reorder list ${index + 1}`}
        className="shrink-0 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className={FIELD_GRID}>
        <FormInput
          control={form.control}
          name={`lists.${index}.name`}
          label="List"
          placeholder="In Progress"
        />

        <div className="grid min-w-0 content-start gap-1">
          <label
            className="text-xs leading-none font-medium text-muted-foreground"
            htmlFor={`list-color-${index}`}
          >
            Colour
          </label>
          <Input
            id={`list-color-${index}`}
            type="color"
            className="h-8 w-full cursor-pointer p-1"
            value={/^#[0-9a-f]{6}$/i.test(color ?? "") ? color : DEFAULT_TASK_LIST_COLOR}
            onChange={(event) =>
              form.setValue(`lists.${index}.color`, event.target.value.toLowerCase(), {
                shouldDirty: true,
              })
            }
          />
        </div>

        <FormInput
          control={form.control}
          name={`lists.${index}.wipLimit`}
          label="Max"
          type="number"
          placeholder="0"
        />

        <FormSwitch control={form.control} name={`lists.${index}.isDoneList`} label="Done list" className="h-8 px-2 py-1" />

        <FormSwitch control={form.control} name={`lists.${index}.isArchived`} label="Archived" className="h-8 px-2 py-1" />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove list ${index + 1}`}
        className="size-7 shrink-0 cursor-pointer text-destructive hover:text-destructive"
        disabled={!canRemove}
        onClick={() => onRemove(index)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function ListEditor() {
  const form = useFormContext<TaskBoardFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "lists",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = fields.findIndex((field) => field.id === active.id);
    const to = fields.findIndex((field) => field.id === over.id);
    if (from < 0 || to < 0) return;

    move(from, to);
  };

  const listError = form.formState.errors.lists?.message;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          Lists
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Drag to reorder · left to right
          </span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 cursor-pointer gap-1.5 text-xs"
          disabled={fields.length >= MAX_TASK_LISTS}
          onClick={() =>
            append({
              name: "",
              color: DEFAULT_TASK_LIST_COLOR,
              wipLimit: 0,
              isDoneList: false,
              isArchived: false,
            })
          }
        >
          <Plus className="size-3.5" />
          Add list
        </Button>
      </div>

      {listError && <p className="text-sm text-destructive">{listError}</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5 [&_[data-slot=form-item]]:gap-1 [&_[data-slot=form-label]]:text-xs [&_[data-slot=form-label]]:font-medium [&_[data-slot=form-label]]:text-muted-foreground [&_input]:h-8 [&_button[role=combobox]]:h-8">
            {fields.map((field, index) => (
              <ListRow
                key={field.id}
                id={field.id}
                index={index}
                canRemove={fields.length > 1}
                onRemove={remove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
