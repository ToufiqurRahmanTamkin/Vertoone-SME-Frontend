import { FormInput, FormSelect } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_STAGE_COLOR,
  MAX_PIPELINE_STAGES,
  PIPELINE_STAGE_TYPE_LABELS,
  PIPELINE_STAGE_TYPES,
} from "@/types/domain/pipeline";
import type { PipelineFormValues } from "@/validations/pipeline";
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
import { useFieldArray, useFormContext, type UseFieldArrayReturn } from "react-hook-form";

const TYPE_OPTIONS = PIPELINE_STAGE_TYPES.map((type) => ({
  label: PIPELINE_STAGE_TYPE_LABELS[type],
  value: type,
}));

const FIELD_GRID = "grid flex-1 grid-cols-2 gap-2 sm:grid-cols-[1fr_2.5rem_7.5rem_4.5rem_5.5rem]";

interface StageRowProps {
  id: string;
  index: number;
  canRemove: boolean;
  onRemove: (index: number) => void;
}

function StageRow({ id, index, canRemove, onRemove }: StageRowProps) {
  const form = useFormContext<PipelineFormValues>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const color = form.watch(`stages.${index}.color`);

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
        aria-label={`Reorder stage ${index + 1}`}
        className="shrink-0 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className={FIELD_GRID}>
        <FormInput
          control={form.control}
          name={`stages.${index}.name`}
          label="Stage"
          placeholder="Qualified"
        />

        <div className="grid min-w-0 content-start gap-1">
          <label
            className="text-xs leading-none font-medium text-muted-foreground"
            htmlFor={`stage-color-${index}`}
          >
            Colour
          </label>
          <Input
            id={`stage-color-${index}`}
            type="color"
            className="h-8 w-full cursor-pointer p-1"
            value={/^#[0-9a-f]{6}$/i.test(color ?? "") ? color : DEFAULT_STAGE_COLOR}
            onChange={(event) =>
              form.setValue(`stages.${index}.color`, event.target.value.toLowerCase(), {
                shouldDirty: true,
              })
            }
          />
        </div>

        <FormSelect
          control={form.control}
          name={`stages.${index}.type`}
          label="Type"
          options={TYPE_OPTIONS}
        />

        <FormInput
          control={form.control}
          name={`stages.${index}.probability`}
          label="Win %"
          type="number"
          placeholder="50"
        />

        <FormInput
          control={form.control}
          name={`stages.${index}.rottingDays`}
          label="Stale (d)"
          type="number"
          placeholder="0"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove stage ${index + 1}`}
        className="size-7 shrink-0 cursor-pointer text-destructive hover:text-destructive"
        disabled={!canRemove}
        onClick={() => onRemove(index)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function StageEditor() {
  const form = useFormContext<PipelineFormValues>();
  const { fields, append, remove, move }: UseFieldArrayReturn<PipelineFormValues, "stages"> =
    useFieldArray({ control: form.control, name: "stages" });

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

  const stageError = form.formState.errors.stages?.message;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          Stages
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Drag to reorder · left to right
          </span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 cursor-pointer gap-1.5 text-xs"
          disabled={fields.length >= MAX_PIPELINE_STAGES}
          onClick={() =>
            append({
              name: "",
              color: DEFAULT_STAGE_COLOR,
              probability: 0,
              type: "OPEN",
              rottingDays: 0,
            })
          }
        >
          <Plus className="size-3.5" />
          Add stage
        </Button>
      </div>

      {stageError && <p className="text-sm text-destructive">{stageError}</p>}

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
              <StageRow
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
