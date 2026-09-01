import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MAX_TASK_CHECKLISTS, MAX_TASK_CHECKLIST_ITEMS } from "@/types/domain/task";
import type { TaskChecklistFormValues } from "@/validations/task";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import * as React from "react";

interface ChecklistEditorProps {
  value: TaskChecklistFormValues[];
  onChange: (next: TaskChecklistFormValues[]) => void;
}

const progressOf = (checklist: TaskChecklistFormValues): number => {
  if (checklist.items.length === 0) return 0;
  const checked = checklist.items.filter((item) => item.isChecked).length;
  return Math.round((checked / checklist.items.length) * 100);
};

export function ChecklistEditor({ value, onChange }: ChecklistEditorProps) {
  const [newItemTitles, setNewItemTitles] = React.useState<Record<number, string>>({});

  const patch = (index: number, next: Partial<TaskChecklistFormValues>) => {
    onChange(value.map((row, position) => (position === index ? { ...row, ...next } : row)));
  };

  const addChecklist = () => {
    onChange([...value, { title: "Checklist", items: [] }]);
  };

  const removeChecklist = (index: number) => {
    onChange(value.filter((_, position) => position !== index));
  };

  const addItem = (index: number) => {
    const title = (newItemTitles[index] ?? "").trim();
    if (!title) return;

    patch(index, {
      items: [...value[index].items, { title, isChecked: false, dueAt: "" }],
    });
    setNewItemTitles((current) => ({ ...current, [index]: "" }));
  };

  const toggleItem = (index: number, itemIndex: number) => {
    patch(index, {
      items: value[index].items.map((item, position) =>
        position === itemIndex ? { ...item, isChecked: !item.isChecked } : item
      ),
    });
  };

  const renameItem = (index: number, itemIndex: number, title: string) => {
    patch(index, {
      items: value[index].items.map((item, position) =>
        position === itemIndex ? { ...item, title } : item
      ),
    });
  };

  const removeItem = (index: number, itemIndex: number) => {
    patch(index, {
      items: value[index].items.filter((_, position) => position !== itemIndex),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <ListChecks className="size-4 text-muted-foreground" aria-hidden />
          Checklists
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 cursor-pointer gap-1.5 text-xs"
          disabled={value.length >= MAX_TASK_CHECKLISTS}
          onClick={addChecklist}
        >
          <Plus className="size-3.5" />
          Add checklist
        </Button>
      </div>

      {value.length === 0 && (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
          No checklists yet. Break the work into steps you can tick off.
        </p>
      )}

      {value.map((checklist, index) => (
        <div key={checklist._id ?? `checklist-${index}`} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Input
              value={checklist.title}
              onChange={(event) => patch(index, { title: event.target.value })}
              placeholder="Checklist title"
              className="h-8 flex-1"
              maxLength={120}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove checklist ${index + 1}`}
              className="size-8 shrink-0 cursor-pointer text-destructive hover:text-destructive"
              onClick={() => removeChecklist(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {checklist.items.length > 0 && (
            <div className="flex items-center gap-2">
              <Progress value={progressOf(checklist)} className="h-1.5 flex-1" />
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {checklist.items.filter((item) => item.isChecked).length}/{checklist.items.length}
              </span>
            </div>
          )}

          <ul className="space-y-1">
            {checklist.items.map((item, itemIndex) => (
              <li key={item._id ?? `item-${itemIndex}`} className="flex items-center gap-2">
                <Checkbox
                  checked={item.isChecked}
                  onCheckedChange={() => toggleItem(index, itemIndex)}
                  aria-label={`Tick ${item.title}`}
                  className="shrink-0 cursor-pointer"
                />
                <Input
                  value={item.title}
                  onChange={(event) => renameItem(index, itemIndex, event.target.value)}
                  className="h-7 flex-1 text-sm"
                  maxLength={200}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${item.title}`}
                  className="size-7 shrink-0 cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => removeItem(index, itemIndex)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Input
              value={newItemTitles[index] ?? ""}
              onChange={(event) =>
                setNewItemTitles((current) => ({ ...current, [index]: event.target.value }))
              }
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                addItem(index);
              }}
              placeholder="Add an item and press Enter"
              className="h-7 flex-1 text-sm"
              maxLength={200}
              disabled={checklist.items.length >= MAX_TASK_CHECKLIST_ITEMS}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 shrink-0 cursor-pointer text-xs"
              disabled={checklist.items.length >= MAX_TASK_CHECKLIST_ITEMS}
              onClick={() => addItem(index)}
            >
              Add
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
