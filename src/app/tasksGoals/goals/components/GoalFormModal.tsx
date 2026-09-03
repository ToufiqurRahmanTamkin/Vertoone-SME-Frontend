import {
  FormColor,
  FormDate,
  FormInput,
  FormMultiSelect,
  FormSelect,
  FormSwitch,
  FormTextarea,
  type MultiSelectOption,
} from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
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

import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useCreateGoalMutation,
  useGetGoalOptionsQuery,
  useUpdateGoalMutation,
} from "@/redux/apis/goalApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { useGetTaskBoardOptionsQuery } from "@/redux/apis/taskApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEFAULT_GOAL_COLOR,
  GOAL_CATEGORIES,
  GOAL_CATEGORY_LABELS,
  GOAL_METRIC_TYPES,
  GOAL_METRIC_TYPE_LABELS,
  GOAL_PRIORITIES,
  GOAL_PRIORITY_LABELS,
  GOAL_PROGRESS_MODES,
  GOAL_PROGRESS_MODE_LABELS,
  GOAL_STATUSES,
  GOAL_STATUS_LABELS,
  type Goal,
} from "@/types/domain/goal";
import { GoalSchema, type GoalFormValues } from "@/validations/goal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { KeyResultEditor } from "./KeyResultEditor";

interface GoalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  onCreated?: (goalId: string) => void;
}

const CATEGORY_OPTIONS = GOAL_CATEGORIES.map((category) => ({
  label: GOAL_CATEGORY_LABELS[category],
  value: category,
}));

const STATUS_OPTIONS = GOAL_STATUSES.map((status) => ({
  label: GOAL_STATUS_LABELS[status],
  value: status,
}));

const PRIORITY_OPTIONS = GOAL_PRIORITIES.map((priority) => ({
  label: GOAL_PRIORITY_LABELS[priority],
  value: priority,
}));

const PROGRESS_MODE_OPTIONS = GOAL_PROGRESS_MODES.map((mode) => ({
  label: GOAL_PROGRESS_MODE_LABELS[mode],
  value: mode,
}));

const METRIC_TYPE_OPTIONS = GOAL_METRIC_TYPES.map((metricType) => ({
  label: GOAL_METRIC_TYPE_LABELS[metricType],
  value: metricType,
}));

const emptyValues = (): GoalFormValues => ({
  title: "",
  description: "",
  color: DEFAULT_GOAL_COLOR,
  category: "COMPANY",
  status: "NOT_STARTED",
  priority: "MEDIUM",
  progressMode: "AUTO",
  metricType: "PERCENT",
  unit: "",
  startValue: 0,
  targetValue: 100,
  currentValue: 0,
  keyResults: [],
  ownerId: "",
  memberIds: [],
  departmentId: "",
  parentGoalId: "",
  boardId: "",
  tagIds: [],
  startDate: "",
  dueDate: "",
  isArchived: false,
});

export function GoalFormModal({ open, onOpenChange, goal, onCreated }: GoalFormModalProps) {
  const isEdit = Boolean(goal);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: departmentOptions = [] } = useGetDepartmentOptionsQuery();
  const { data: boardOptions = [] } = useGetTaskBoardOptionsQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery();
  const { data: goalOptions = [] } = useGetGoalOptionsQuery(
    goal ? { excludeId: goal._id } : undefined
  );

  const [createGoal, { isLoading: isCreating }] = useCreateGoalMutation();
  const [updateGoal, { isLoading: isUpdating }] = useUpdateGoalMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(GoalSchema),
    defaultValues: emptyValues(),
  });

  const progressMode = useWatch({ control: form.control, name: "progressMode" });

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      goal
        ? {
            title: goal.title,
            description: goal.description,
            color: goal.color || DEFAULT_GOAL_COLOR,
            category: goal.category,
            status: goal.status,
            priority: goal.priority,
            progressMode: goal.progressMode,
            metricType: goal.metric.metricType,
            unit: goal.metric.unit,
            startValue: goal.metric.startValue,
            targetValue: goal.metric.targetValue,
            currentValue: goal.metric.currentValue,
            keyResults: goal.keyResults.map((keyResult) => ({
              _id: keyResult._id,
              title: keyResult.title,
              metricType: keyResult.metricType,
              unit: keyResult.unit,
              startValue: keyResult.startValue,
              targetValue: keyResult.targetValue,
              currentValue: keyResult.currentValue,
              weight: keyResult.weight,
              ownerId: keyResult.ownerId ?? "",
              dueDate: keyResult.dueDate ?? "",
              isCompleted: keyResult.isCompleted,
            })),
            ownerId: goal.ownerId ?? "",
            memberIds: goal.memberIds,
            departmentId: goal.departmentId ?? "",
            parentGoalId: goal.parentGoalId ?? "",
            boardId: goal.boardId ?? "",
            tagIds: goal.tagIds,
            startDate: goal.startDate ?? "",
            dueDate: goal.dueDate ?? "",
            isArchived: goal.isArchived,
          }
        : emptyValues()
    );
  }, [open, goal, form]);

  const ownerChoices = React.useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const departmentChoices = React.useMemo(
    () => [
      { label: "No department", value: "" },
      ...departmentOptions.map((department) => ({
        label: department.name,
        value: department._id,
      })),
    ],
    [departmentOptions]
  );

  const boardChoices = React.useMemo(
    () => [
      { label: "Not linked to a board", value: "" },
      ...boardOptions.map((board) => ({ label: board.name, value: board._id })),
    ],
    [boardOptions]
  );

  const parentChoices = React.useMemo(
    () => [
      { label: "Stands on its own", value: "" },
      ...goalOptions.map((option) => ({
        label: `${option.code} · ${option.title}`,
        value: option._id,
      })),
    ],
    [goalOptions]
  );

  const memberChoices = React.useMemo<MultiSelectOption[]>(
    () => employeeOptions.map((employee) => ({ value: employee._id, label: employee.name })),
    [employeeOptions]
  );

  const tagChoices = React.useMemo<MultiSelectOption[]>(
    () => tagOptions.map((tag) => ({ value: tag._id, label: tag.name, color: tag.color })),
    [tagOptions]
  );

  const onSubmit = async (values: GoalFormValues) => {
    const body = {
      title: values.title,
      description: values.description,
      color: values.color,
      category: values.category,
      status: values.status,
      priority: values.priority,
      progressMode: values.progressMode,
      metricType: values.metricType,
      unit: values.unit,
      startValue: Number(values.startValue || 0),
      targetValue: Number(values.targetValue || 0),
      currentValue: Number(values.currentValue || 0),
      keyResults: values.keyResults.map((keyResult) => ({
        ...(keyResult._id ? { _id: keyResult._id } : {}),
        title: keyResult.title,
        metricType: keyResult.metricType,
        unit: keyResult.unit,
        startValue: Number(keyResult.startValue || 0),
        targetValue: Number(keyResult.targetValue || 0),
        currentValue: Number(keyResult.currentValue || 0),
        weight: Number(keyResult.weight || 1),
        ownerId: keyResult.ownerId || null,
        dueDate: keyResult.dueDate || null,
        isCompleted: keyResult.isCompleted,
      })),
      ownerId: values.ownerId || null,
      memberIds: values.memberIds,
      departmentId: values.departmentId || null,
      parentGoalId: values.parentGoalId || null,
      boardId: values.boardId || null,
      tagIds: values.tagIds,
      startDate: values.startDate || null,
      dueDate: values.dueDate || null,
      isArchived: values.isArchived,
    };

    try {
      if (goal) {
        await updateGoal({ id: goal._id, body }).unwrap();
        toast.success("Goal updated");
      } else {
        const created = await createGoal(body).unwrap();
        toast.success("Goal created");
        onCreated?.(created._id);
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the goal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "New goal"}</DialogTitle>
          <DialogDescription>
            State the outcome you are after and how you will know it was reached. Progress either
            rolls up from key results or tracks one number you update yourself.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-0 p-4 sm:p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Basic Details */}
                <div className="flex flex-col gap-3">
                  <FormInput
                    control={form.control}
                    name="title"
                    label="Goal"
                    placeholder="Grow repeat orders to a third of revenue"
                  />

                  <FormColor control={form.control} name="color" label="Colour" />

                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="What success looks like"
                    placeholder="Why this matters and what changes once it is met"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormSelect
                      control={form.control}
                      name="category"
                      label="Level"
                      options={CATEGORY_OPTIONS}
                    />
                    <FormSelect
                      control={form.control}
                      name="status"
                      label="Status"
                      options={STATUS_OPTIONS}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormSelect
                      control={form.control}
                      name="priority"
                      label="Priority"
                      options={PRIORITY_OPTIONS}
                    />
                    <FormDate control={form.control} name="startDate" label="Starts" dateOnly />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormDate control={form.control} name="dueDate" label="Due by" dateOnly />
                  </div>

                  <FormSwitch
                    control={form.control}
                    name="isArchived"
                    label="Archived"
                    description="Archived goals stay searchable but drop off the main list."
                  />
                </div>

                {/* Right Column: Progress & Organization */}
                <div className="flex flex-col gap-3">
                  <FormSelect
                    control={form.control}
                    name="progressMode"
                    label="How progress is measured"
                    options={PROGRESS_MODE_OPTIONS}
                  />

                  {progressMode === "MANUAL" ? (
                    <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/20 p-3 shadow-sm">
                      <FormSelect
                        control={form.control}
                        name="metricType"
                        label="Measured as"
                        options={METRIC_TYPE_OPTIONS}
                      />
                      <FormInput
                        control={form.control}
                        name="unit"
                        label="Unit"
                        placeholder="orders, days, BDT"
                      />
                      <FormInput
                        control={form.control}
                        name="startValue"
                        label="Starts at"
                        type="number"
                      />
                      <FormInput
                        control={form.control}
                        name="targetValue"
                        label="Target"
                        type="number"
                      />
                      <FormInput
                        control={form.control}
                        name="currentValue"
                        label="Where it stands"
                        type="number"
                        className="col-span-2"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 rounded-md border bg-muted/20 p-3 shadow-sm">
                      <Controller
                        control={form.control}
                        name="keyResults"
                        render={({ field }) => (
                          <KeyResultEditor
                            value={field.value}
                            onChange={field.onChange}
                            ownerChoices={ownerChoices}
                          />
                        )}
                      />
                      {form.formState.errors.keyResults?.message && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.keyResults.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-1 grid grid-cols-2 gap-3">
                    <FormSelect
                      control={form.control}
                      name="ownerId"
                      label="Accountable for it"
                      placeholder="Unassigned"
                      options={ownerChoices}
                      searchable
                    />
                    <FormSelect
                      control={form.control}
                      name="departmentId"
                      label="Department"
                      placeholder="No department"
                      options={departmentChoices}
                      searchable
                    />
                  </div>

                  <FormMultiSelect
                    control={form.control}
                    name="memberIds"
                    label="Working on it"
                    placeholder="Nobody yet"
                    options={memberChoices}
                    searchable
                    emptyText="No employees yet. Add them under Directory · Employees."
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormSelect
                      control={form.control}
                      name="parentGoalId"
                      label="Rolls up into"
                      placeholder="Stands on its own"
                      options={parentChoices}
                      searchable
                    />
                    <FormSelect
                      control={form.control}
                      name="boardId"
                      label="Work happens on"
                      placeholder="Not linked to a board"
                      options={boardChoices}
                      searchable
                    />
                  </div>

                  <FormMultiSelect
                    control={form.control}
                    name="tagIds"
                    label="Tags"
                    placeholder="No tags"
                    options={tagChoices}
                    searchable
                    emptyText="No tags yet. Add them under Customers · Tags."
                  />
                </div>
              </div>
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
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
