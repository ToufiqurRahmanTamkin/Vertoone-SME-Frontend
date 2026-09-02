import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GOAL_METRIC_TYPES,
  GOAL_METRIC_TYPE_LABELS,
  MAX_GOAL_KEY_RESULTS,
  type GoalMetricType,
} from "@/types/domain/goal";
import type { GoalKeyResultFormValues } from "@/validations/goal";
import { Plus, Target, Trash2 } from "lucide-react";

interface KeyResultEditorProps {
  value: GoalKeyResultFormValues[];
  onChange: (next: GoalKeyResultFormValues[]) => void;
  ownerChoices: { label: string; value: string }[];
}

const toNumber = (value: number | ""): number => (value === "" ? 0 : Number(value));

const progressOf = (keyResult: GoalKeyResultFormValues): number => {
  if (keyResult.isCompleted) return 100;

  const start = toNumber(keyResult.startValue);
  const target = toNumber(keyResult.targetValue);
  const current = toNumber(keyResult.currentValue);
  const span = target - start;

  if (span === 0) return current >= target ? 100 : 0;
  return Math.min(100, Math.max(0, Math.round(((current - start) / span) * 100)));
};

const emptyKeyResult = (): GoalKeyResultFormValues => ({
  title: "",
  metricType: "PERCENT",
  unit: "",
  startValue: 0,
  targetValue: 100,
  currentValue: 0,
  weight: 1,
  ownerId: "",
  dueDate: "",
  isCompleted: false,
});

export function KeyResultEditor({ value, onChange, ownerChoices }: KeyResultEditorProps) {
  const patch = (index: number, next: Partial<GoalKeyResultFormValues>) => {
    onChange(value.map((row, position) => (position === index ? { ...row, ...next } : row)));
  };

  const totalWeight = value.reduce((sum, keyResult) => sum + toNumber(keyResult.weight), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Target className="size-4 text-muted-foreground" aria-hidden />
          Key results
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 cursor-pointer gap-1.5 text-xs"
          disabled={value.length >= MAX_GOAL_KEY_RESULTS}
          onClick={() => onChange([...value, emptyKeyResult()])}
        >
          <Plus className="size-3.5" />
          Add key result
        </Button>
      </div>

      {value.length === 0 && (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
          No key results yet. Add the measurable outcomes that say whether this goal was met.
        </p>
      )}

      {value.map((keyResult, index) => (
        <div key={keyResult._id ?? `key-result-${index}`} className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Input
              value={keyResult.title}
              onChange={(event) => patch(index, { title: event.target.value })}
              placeholder="Cut average delivery time to 2 days"
              className="h-8 flex-1"
              maxLength={200}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove key result ${index + 1}`}
              className="size-8 shrink-0 cursor-pointer text-destructive hover:text-destructive"
              onClick={() => onChange(value.filter((_, position) => position !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Measured as</Label>
              <Select
                value={keyResult.metricType}
                onValueChange={(next) => patch(index, { metricType: next as GoalMetricType })}
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_METRIC_TYPES.map((metricType) => (
                    <SelectItem key={metricType} value={metricType}>
                      {GOAL_METRIC_TYPE_LABELS[metricType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Starts at</Label>
              <Input
                type="number"
                value={keyResult.startValue}
                onChange={(event) =>
                  patch(index, {
                    startValue: event.target.value === "" ? "" : Number(event.target.value),
                  })
                }
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Target</Label>
              <Input
                type="number"
                value={keyResult.targetValue}
                onChange={(event) =>
                  patch(index, {
                    targetValue: event.target.value === "" ? "" : Number(event.target.value),
                  })
                }
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Where it stands</Label>
              <Input
                type="number"
                value={keyResult.currentValue}
                onChange={(event) =>
                  patch(index, {
                    currentValue: event.target.value === "" ? "" : Number(event.target.value),
                  })
                }
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Unit</Label>
              <Input
                value={keyResult.unit}
                onChange={(event) => patch(index, { unit: event.target.value })}
                placeholder="days, orders, BDT"
                className="h-8 text-xs"
                maxLength={20}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Weight</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={keyResult.weight}
                onChange={(event) =>
                  patch(index, {
                    weight: event.target.value === "" ? "" : Number(event.target.value),
                  })
                }
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Owner</Label>
              <Select
                value={keyResult.ownerId || "__none"}
                onValueChange={(next) =>
                  patch(index, { ownerId: next === "__none" ? "" : next })
                }
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Unassigned</SelectItem>
                  {ownerChoices
                    .filter((choice) => choice.value)
                    .map((choice) => (
                      <SelectItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Progress value={progressOf(keyResult)} className="h-1.5 flex-1" />
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {progressOf(keyResult)}%
            </span>
            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs">
              <Checkbox
                checked={keyResult.isCompleted}
                onCheckedChange={(checked) => patch(index, { isCompleted: checked === true })}
                className="cursor-pointer"
              />
              Done
            </label>
          </div>
        </div>
      ))}

      {value.length > 1 && (
        <p className="text-xs text-muted-foreground">
          Progress rolls up by weight — these {value.length} key results share {totalWeight} points.
        </p>
      )}
    </div>
  );
}
