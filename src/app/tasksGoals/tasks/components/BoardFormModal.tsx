import {
  FormColor,
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
import { Separator } from "@/components/ui/separator";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useCreateTaskBoardMutation, useUpdateTaskBoardMutation } from "@/redux/apis/taskApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEFAULT_TASK_BOARD_COLOR,
  DEFAULT_TASK_LIST_COLOR,
  TASK_BOARD_VISIBILITIES,
  TASK_BOARD_VISIBILITY_LABELS,
  type TaskBoardWithStats,
} from "@/types/domain/task";
import { TaskBoardSchema, type TaskBoardFormValues } from "@/validations/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LabelEditor } from "./LabelEditor";
import { ListEditor } from "./ListEditor";

interface BoardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: TaskBoardWithStats | null;
  onCreated?: (boardId: string) => void;
}

const VISIBILITY_OPTIONS = TASK_BOARD_VISIBILITIES.map((visibility) => ({
  label: TASK_BOARD_VISIBILITY_LABELS[visibility],
  value: visibility,
}));

const DEFAULT_LISTS: TaskBoardFormValues["lists"] = [
  { name: "Backlog", color: "#64748b", wipLimit: 0, isDoneList: false, isArchived: false },
  { name: "To Do", color: "#0ea5e9", wipLimit: 0, isDoneList: false, isArchived: false },
  { name: "In Progress", color: "#f59e0b", wipLimit: 0, isDoneList: false, isArchived: false },
  { name: "Review", color: "#8b5cf6", wipLimit: 0, isDoneList: false, isArchived: false },
  { name: "Done", color: "#16a34a", wipLimit: 0, isDoneList: true, isArchived: false },
];

const DEFAULT_LABELS: TaskBoardFormValues["labels"] = [
  { name: "Bug", color: "#dc2626" },
  { name: "Feature", color: "#16a34a" },
  { name: "Urgent", color: "#f97316" },
  { name: "Customer", color: "#0ea5e9" },
  { name: "Internal", color: "#8b5cf6" },
];

const emptyValues = (): TaskBoardFormValues => ({
  name: "",
  description: "",
  color: DEFAULT_TASK_BOARD_COLOR,
  visibility: "COMPANY",
  ownerId: "",
  memberIds: [],
  isArchived: false,
  lists: DEFAULT_LISTS.map((list) => ({ ...list })),
  labels: DEFAULT_LABELS.map((label) => ({ ...label })),
});

export function BoardFormModal({ open, onOpenChange, board, onCreated }: BoardFormModalProps) {
  const isEdit = Boolean(board);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const [createBoard, { isLoading: isCreating }] = useCreateTaskBoardMutation();
  const [updateBoard, { isLoading: isUpdating }] = useUpdateTaskBoardMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<TaskBoardFormValues>({
    resolver: zodResolver(TaskBoardSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      board
        ? {
            name: board.name,
            description: board.description,
            color: board.color || DEFAULT_TASK_BOARD_COLOR,
            visibility: board.visibility,
            ownerId: board.ownerId ?? "",
            memberIds: board.memberIds,
            isArchived: board.isArchived,
            lists: board.lists.map((list) => ({
              _id: list._id,
              name: list.name,
              color: list.color || DEFAULT_TASK_LIST_COLOR,
              wipLimit: list.wipLimit,
              isDoneList: list.isDoneList,
              isArchived: list.isArchived,
            })),
            labels: board.labels.map((label) => ({
              _id: label._id,
              name: label.name,
              color: label.color || DEFAULT_TASK_LIST_COLOR,
            })),
          }
        : emptyValues()
    );
  }, [open, board, form]);

  const ownerChoices = React.useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const memberChoices = React.useMemo<MultiSelectOption[]>(
    () => employeeOptions.map((employee) => ({ value: employee._id, label: employee.name })),
    [employeeOptions]
  );

  const onSubmit = async (values: TaskBoardFormValues) => {
    const body = {
      name: values.name,
      description: values.description,
      color: values.color,
      visibility: values.visibility,
      ownerId: values.ownerId || null,
      memberIds: values.memberIds,
      isArchived: values.isArchived,
      lists: values.lists.map((list) => ({
        ...(list._id ? { _id: list._id } : {}),
        name: list.name,
        color: list.color,
        wipLimit: Number(list.wipLimit || 0),
        isDoneList: list.isDoneList,
        isArchived: list.isArchived,
      })),
      labels: values.labels.map((label) => ({
        ...(label._id ? { _id: label._id } : {}),
        name: label.name,
        color: label.color,
      })),
    };

    try {
      if (board) {
        await updateBoard({ id: board._id, body }).unwrap();
        toast.success("Board updated");
      } else {
        const created = await createBoard(body).unwrap();
        toast.success("Board created");
        onCreated?.(created._id);
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the board");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit board" : "New board"}</DialogTitle>
          <DialogDescription>
            A board holds the lists your cards move through. Mark one list as the done list and
            cards dropped there are ticked off automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Board name"
                  placeholder="Product delivery"
                />

                <FormColor control={form.control} name="color" label="Colour" />

                <FormSelect
                  control={form.control}
                  name="visibility"
                  label="Who can see it"
                  options={VISIBILITY_OPTIONS}
                />

                <FormSelect
                  control={form.control}
                  name="ownerId"
                  label="Board owner"
                  placeholder="Unassigned"
                  options={ownerChoices}
                />
              </div>

              <FormMultiSelect
                control={form.control}
                name="memberIds"
                label="Board members"
                placeholder="Nobody yet"
                options={memberChoices}
                emptyText="No employees yet. Add them under Directory · Employees."
              />

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this board is for and how the team should use it"
              />

              <FormSwitch
                control={form.control}
                name="isArchived"
                label="Archived"
                description="Archived boards stay searchable but drop off the main list."
              />

              <Separator />

              <ListEditor />

              <Separator />

              <LabelEditor />
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
                {isEdit ? "Save changes" : "Create board"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
