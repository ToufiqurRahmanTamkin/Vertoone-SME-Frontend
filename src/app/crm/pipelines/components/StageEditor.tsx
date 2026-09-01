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
        "rounded-lg border bg-card p-3",
        isDragging && "opacity-60 ring-2 ring-primary/30"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={`Reorder stage ${index + 1}`}
          className="mt-7 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FormInput
            control={form.control}
            name={`stages.${index}.name`}
            label="Stage"
            placeholder="Qualified"
            className="lg:col-span-2"
          />

          <div className="space-y-2">
            <label
              className="text-sm leading-none font-medium"
              htmlFor={`stage-color-${index}`}
            >
              Colour
            </label>
            <Input
              id={`stage-color-${index}`}
              type="color"
              className="h-9 w-full cursor-pointer p-1"
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
            label="Stale after (days)"
            type="number"
            placeholder="0"
            className="lg:col-span-2"
          />

          <FormInput
            control={form.control}
            name={`stages.${index}.description`}
            label="What happens here"
            placeholder="Budget confirmed and a decision maker identified"
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remove stage ${index + 1}`}
          className="mt-6 size-8 shrink-0 cursor-pointer text-destructive hover:text-destructive"
          disabled={!canRemove}
          onClick={() => onRemove(index)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Stages</p>
          <p className="text-xs text-muted-foreground">
            Drag to reorder. Contacts move left to right through these stages.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer gap-1.5"
          disabled={fields.length >= MAX_PIPELINE_STAGES}
          onClick={() =>
            append({
              name: "",
              color: DEFAULT_STAGE_COLOR,
              description: "",
              probability: 0,
              type: "OPEN",
              rottingDays: 0,
            })
          }
        >
          <Plus className="size-4" />
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
          <div className="space-y-2">
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
