import { FormSelect, FormTextarea } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRecordGoalCheckInMutation } from "@/redux/apis/goalApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { GOAL_STATUSES, GOAL_STATUS_LABELS, type Goal } from "@/types/domain/goal";
import { GoalCheckInSchema, type GoalCheckInFormValues } from "@/validations/goal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { formatMetricValue } from "../goal.helpers";

interface GoalCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

const STATUS_OPTIONS = GOAL_STATUSES.map((status) => ({
  label: GOAL_STATUS_LABELS[status],
  value: status,
}));

const valuesFor = (goal: Goal | null): GoalCheckInFormValues => ({
  note: "",
  status: goal?.status ?? "ON_TRACK",
  currentValue: goal?.metric.currentValue ?? 0,
  keyResults: (goal?.keyResults ?? []).map((keyResult) => ({
    _id: keyResult._id,
    title: keyResult.title,
    currentValue: keyResult.currentValue,
    isCompleted: keyResult.isCompleted,
  })),
});

export function GoalCheckInModal({ open, onOpenChange, goal }: GoalCheckInModalProps) {
  const [recordCheckIn, { isLoading: isSaving }] = useRecordGoalCheckInMutation();

  const form = useForm<GoalCheckInFormValues>({
    resolver: zodResolver(GoalCheckInSchema),
    defaultValues: valuesFor(goal),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(valuesFor(goal));
  }, [open, goal, form]);

  const isAuto = goal?.progressMode === "AUTO";

  const onSubmit = async (values: GoalCheckInFormValues) => {
    if (!goal) return;

    const body = {
      note: values.note,
      status: values.status,
      ...(isAuto ? {} : { currentValue: Number(values.currentValue || 0) }),
      keyResults: isAuto
        ? values.keyResults.map((keyResult) => ({
            _id: keyResult._id,
            currentValue: Number(keyResult.currentValue || 0),
            isCompleted: keyResult.isCompleted,
          }))
        : [],
    };

    try {
      await recordCheckIn({ id: goal._id, body }).unwrap();
      toast.success("Check-in recorded");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not record the check-in");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Check in on {goal?.title ?? "this goal"}</DialogTitle>
          <DialogDescription>
            Move the numbers to where they stand today and say what changed. Every check-in is kept
            so the trend stays readable.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-4">
              <FormSelect
                control={form.control}
                name="status"
                label="Where it stands"
                options={STATUS_OPTIONS}
              />

              {isAuto ? (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Key results</Label>
                  <Controller
                    control={form.control}
                    name="keyResults"
                    render={({ field }) => (
                      <div className="space-y-2">
                        {field.value.length === 0 && (
                          <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                            This goal has no key results yet.
                          </p>
                        )}
                        {field.value.map((keyResult, index) => {
                          const source = goal?.keyResults.find(
                            (candidate) => candidate._id === keyResult._id
                          );

                          return (
                            <div
                              key={keyResult._id}
                              className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{keyResult.title}</p>
                                {source && (
                                  <p className="text-xs text-muted-foreground">
                                    target{" "}
                                    {formatMetricValue(
                                      source.targetValue,
                                      source.metricType,
                                      source.unit
                                    )}
                                  </p>
                                )}
                              </div>
                              <Input
                                type="number"
                                value={keyResult.currentValue}
                                onChange={(event) =>
                                  field.onChange(
                                    field.value.map((row, position) =>
                                      position === index
                                        ? {
                                            ...row,
                                            currentValue:
                                              event.target.value === ""
                                                ? ""
                                                : Number(event.target.value),
                                          }
                                        : row
                                    )
                                  )
                                }
                                className="h-8 w-28 text-xs"
                                aria-label={`Where ${keyResult.title} stands`}
                              />
                              <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs">
                                <Checkbox
                                  checked={keyResult.isCompleted}
                                  onCheckedChange={(checked) =>
                                    field.onChange(
                                      field.value.map((row, position) =>
                                        position === index
                                          ? { ...row, isCompleted: checked === true }
                                          : row
                                      )
                                    )
                                  }
                                  className="cursor-pointer"
                                />
                                Done
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>
              ) : (
                <Controller
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="goal-current-value">Where it stands</Label>
                      <Input
                        id="goal-current-value"
                        type="number"
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === "" ? "" : Number(event.target.value)
                          )
                        }
                      />
                      {goal && (
                        <p className="text-xs text-muted-foreground">
                          Target{" "}
                          {formatMetricValue(
                            goal.metric.targetValue,
                            goal.metric.metricType,
                            goal.metric.unit
                          )}
                        </p>
                      )}
                    </div>
                  )}
                />
              )}

              <Separator />

              <FormTextarea
                control={form.control}
                name="note"
                label="What changed"
                placeholder="What moved, what is blocking it and what happens next"
                rows={4}
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !goal}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record check-in
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
