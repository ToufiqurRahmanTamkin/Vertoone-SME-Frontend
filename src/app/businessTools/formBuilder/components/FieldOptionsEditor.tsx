import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormFieldOption } from "@/types/domain/formBuilder";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import * as React from "react";

interface FieldOptionsEditorProps {
  options: FormFieldOption[];
  disabled: boolean;
  max: number;
  onChange: (options: FormFieldOption[]) => void;
}

export function FieldOptionsEditor({
  options,
  disabled,
  max,
  onChange,
}: FieldOptionsEditorProps) {
  const [bulk, setBulk] = React.useState(false);

  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= options.length) return;

    const next = [...options];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const rename = (index: number, label: string) => {
    onChange(options.map((entry, at) => (at === index ? { value: label, label } : entry)));
  };

  const bulkText = options.map((entry) => entry.label).join("\n");

  const applyBulk = (text: string) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, max);

    const seen = new Set<string>();

    onChange(
      lines
        .filter((line) => {
          if (seen.has(line)) return false;
          seen.add(line);
          return true;
        })
        .map((line) => ({ value: line, label: line }))
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium text-muted-foreground">Options</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-[11px]"
          onClick={() => setBulk((current) => !current)}
        >
          {bulk ? "One at a time" : "Paste a list"}
        </Button>
      </div>

      {bulk ? (
        <>
          <textarea
            className="min-h-40 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            value={bulkText}
            disabled={disabled}
            onChange={(event) => applyBulk(event.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            One option per line. Duplicates and blank lines are dropped.
          </p>
        </>
      ) : (
        <>
          <div className="space-y-1.5">
            {options.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <Input
                  value={entry.label}
                  maxLength={120}
                  disabled={disabled}
                  placeholder={`Option ${index + 1}`}
                  onChange={(event) => rename(index, event.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  disabled={disabled || index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="Move option up"
                >
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  disabled={disabled || index === options.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="Move option down"
                >
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-destructive hover:text-destructive"
                  disabled={disabled}
                  onClick={() => onChange(options.filter((_, at) => at !== index))}
                  aria-label="Remove option"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={disabled || options.length >= max}
            onClick={() =>
              onChange([
                ...options,
                { value: `Option ${options.length + 1}`, label: `Option ${options.length + 1}` },
              ])
            }
          >
            <Plus className="mr-2 size-4" />
            Add option
          </Button>
        </>
      )}
    </div>
  );
}
