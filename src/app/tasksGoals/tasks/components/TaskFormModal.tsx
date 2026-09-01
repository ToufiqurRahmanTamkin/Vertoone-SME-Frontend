import {
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
import { Form, FormLabel } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useCreateTaskMutation, useUpdateTaskMutation } from "@/redux/apis/taskApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskAssigneeOption,
  type TaskBoardViewBoard,
  type TaskList,
} from "@/types/domain/task";
import { TaskSchema, type TaskFormValues } from "@/validations/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AssigneePicker } from "./AssigneePicker";
import { ChecklistEditor } from "./ChecklistEditor";

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: TaskBoardViewBoard;
  lists: TaskList[];
  task?: Task | null;
  defaultListId?: string;
}

const PRIORITY_OPTIONS = TASK_PRIORITIES.map((priority) => ({
  label: TASK_PRIORITY_LABELS[priority],
  value: priority,
}));

export function TaskFormModal({
  open,
  onOpenChange,
  board,
  lists,
  task,
  defaultListId,
}: TaskFormModalProps) {
  const isEdit = Boolean(task);

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const isSaving = isCreating || isUpdating;

  const emptyValues = React.useCallback(
    (): TaskFormValues => ({
      boardId: board._id,
      listId: defaultListId ?? lists.find((list) => !list.isArchived)?._id ?? "",
      title: "",
      description: "",
      priority: "MEDIUM",
      labelIds: [],
      assignees: [],
      checklists: [],
      coverColor: "",
      startDate: "",
      dueAt: "",
      reminderAt: "",
      isCompleted: false,
    }),
    [board._id, defaultListId, lists]
  );

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(TaskSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      task
        ? {
            boardId: task.boardId,
            listId: task.listId,
            title: task.title,
            description: task.description,
            priority: task.priority,
            labelIds: task.labelIds,
            assignees: task.assignees.map((assignee) => ({
              kind: assignee.kind,
              refId: assignee.refId,
            })),
            checklists: task.checklists.map((checklist) => ({
              _id: checklist._id,
              title: checklist.title,
              items: checklist.items.map((item) => ({
                _id: item._id,
                title: item.title,
                isChecked: item.isChecked,
                dueAt: item.dueAt ?? "",
              })),
            })),
            coverColor: task.coverColor,
            startDate: task.startDate ?? "",
            dueAt: task.dueAt ?? "",
            reminderAt: task.reminderAt ?? "",
            isCompleted: task.isCompleted,
          }
        : emptyValues()
    );
  }, [open, task, form, emptyValues]);

  const listChoices = React.useMemo(
    () =>
      lists.map((list) => ({
        label: list.isArchived ? `${list.name} (archived)` : list.name,
        value: list._id,
      })),
    [lists]
  );

  const labelChoices = React.useMemo<MultiSelectOption[]>(
    () => board.labels.map((label) => ({ value: label._id, label: label.name, color: label.color })),
    [board.labels]
  );

  const resolvedAssignees = React.useMemo<TaskAssigneeOption[]>(
    () =>
      (task?.assignees ?? []).map((assignee) => ({
        kind: assignee.kind,
        refId: assignee.refId,
        name: assignee.name,
        subtitle: assignee.subtitle,
      })),
    [task]
  );

  const onSubmit = async (values: TaskFormValues) => {
    const shared = {
      title: values.title,
      description: values.description,
      priority: values.priority,
      labelIds: values.labelIds,
      assignees: values.assignees,
      checklists: values.checklists.map((checklist) => ({
        ...(checklist._id ? { _id: checklist._id } : {}),
        title: checklist.title,
        items: checklist.items.map((item) => ({
          ...(item._id ? { _id: item._id } : {}),
          title: item.title,
          isChecked: item.isChecked,
          dueAt: item.dueAt || null,
        })),
      })),
      coverColor: values.coverColor,
      startDate: values.startDate || null,
      dueAt: values.dueAt || null,
      reminderAt: values.reminderAt || null,
      isCompleted: values.isCompleted,
    };

    try {
      if (task) {
        await updateTask({ id: task._id, body: shared }).unwrap();
        toast.success("Card updated");
      } else {
        await createTask({
          ...shared,
          boardId: board._id,
          listId: values.listId || undefined,
        }).unwrap();
        toast.success("Card added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the card");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit card" : "New card"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the work, who is on it and when it is due."
              : `Add a card to "${board.name}" and assign it to whoever needs to act.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-4">
              <FormInput
                control={form.control}
                name="title"
                label="Card title"
                placeholder="Draft the renewal quote"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {!isEdit && (
                  <FormSelect
                    control={form.control}
                    name="listId"
                    label="List"
                    options={listChoices}
                  />
                )}

                <FormSelect
                  control={form.control}
                  name="priority"
                  label="Priority"
                  options={PRIORITY_OPTIONS}
                />

                <FormDate
                  control={form.control}
                  name="startDate"
                  label="Start date"
                  dateOnly
                />

                <FormDate control={form.control} name="dueAt" label="Due" includeTime />

                <FormDate
                  control={form.control}
                  name="reminderAt"
                  label="Remind at"
                  includeTime
                />

                <FormInput
                  control={form.control}
                  name="coverColor"
                  label="Cover colour"
                  placeholder="#0ea5e9"
                  description="Optional hex colour shown as a strip on the card."
                />
              </div>

              <FormMultiSelect
                control={form.control}
                name="labelIds"
                label="Labels"
                placeholder="No labels"
                options={labelChoices}
                emptyText="This board has no labels yet. Add them by editing the board."
              />

              <div className="space-y-2">
                <FormLabel>Assigned to</FormLabel>
                <Controller
                  control={form.control}
                  name="assignees"
                  render={({ field }) => (
                    <AssigneePicker
                      value={field.value}
                      onChange={field.onChange}
                      resolved={resolvedAssignees}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Assign employees, portal users, leads or contacts — anyone the work touches.
                </p>
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What needs doing, and what done looks like"
              />

              <FormSwitch
                control={form.control}
                name="isCompleted"
                label="Done"
                description="Moving a card into a done list ticks this automatically."
              />

              <Separator />

              <Controller
                control={form.control}
                name="checklists"
                render={({ field }) => (
                  <ChecklistEditor value={field.value} onChange={field.onChange} />
                )}
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
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add card"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
