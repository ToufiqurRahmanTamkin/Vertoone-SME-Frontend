import { FormInput } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_TASK_LIST_COLOR, MAX_TASK_LABELS } from "@/types/domain/task";
import type { TaskBoardFormValues } from "@/validations/task";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

export function LabelEditor() {
  const form = useFormContext<TaskBoardFormValues>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "labels" });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          Labels
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Colour-coded tags for the cards on this board
          </span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 cursor-pointer gap-1.5 text-xs"
          disabled={fields.length >= MAX_TASK_LABELS}
          onClick={() => append({ name: "", color: DEFAULT_TASK_LIST_COLOR })}
        >
          <Plus className="size-3.5" />
          Add label
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
          No labels yet. Add a few so cards can be grouped at a glance.
        </p>
      )}

      <div className="grid gap-1.5 sm:grid-cols-2 [&_[data-slot=form-item]]:gap-1 [&_[data-slot=form-label]]:text-xs [&_[data-slot=form-label]]:font-medium [&_[data-slot=form-label]]:text-muted-foreground [&_input]:h-8">
        {fields.map((field, index) => {
          const color = form.watch(`labels.${index}.color`);

          return (
            <div key={field.id} className="flex items-end gap-1.5 rounded-lg border bg-card p-2">
              <FormInput
                control={form.control}
                name={`labels.${index}.name`}
                label="Label"
                placeholder="Blocked"
                className="flex-1"
              />

              <div className="grid w-10 shrink-0 content-start gap-1">
                <label
                  className="text-xs leading-none font-medium text-muted-foreground"
                  htmlFor={`label-color-${index}`}
                >
                  Colour
                </label>
                <Input
                  id={`label-color-${index}`}
                  type="color"
                  className="h-8 w-full cursor-pointer p-1"
                  value={/^#[0-9a-f]{6}$/i.test(color ?? "") ? color : DEFAULT_TASK_LIST_COLOR}
                  onChange={(event) =>
                    form.setValue(`labels.${index}.color`, event.target.value.toLowerCase(), {
                      shouldDirty: true,
                    })
                  }
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove label ${index + 1}`}
                className="size-8 shrink-0 cursor-pointer text-destructive hover:text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
