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
import { Stepper, type StepperStep } from "@/components/ui/stepper";
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
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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

const STEPS: StepperStep[] = [
  { id: "basics", label: "Basics" },
  { id: "lists", label: "Lists" },
  { id: "labels", label: "Labels" },
];

const STEP_FIELDS: readonly (keyof TaskBoardFormValues)[][] = [
  ["name", "color", "visibility", "ownerId", "memberIds", "description", "isArchived"],
  ["lists"],
  ["labels"],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) => fields.includes(field as keyof TaskBoardFormValues));
  return index === -1 ? 0 : index;
};

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
  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const [createBoard, { isLoading: isCreating }] = useCreateTaskBoardMutation();
  const [updateBoard, { isLoading: isUpdating }] = useUpdateTaskBoardMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<TaskBoardFormValues>({
    resolver: zodResolver(TaskBoardSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setFurthestStep(0);
      return;
    }

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

  const goToStep = (next: number) => {
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = fields.length === 0 || (await form.trigger(fields, { shouldFocus: true }));
    if (!isValid) return;
    goToStep(Math.min(step + 1, LAST_STEP));
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstStep = Object.keys(errors).map(stepOf).sort((a, b) => a - b)[0];
    if (firstStep !== undefined) setStep(firstStep);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < LAST_STEP) {
      void goNext();
      return;
    }
    void form.handleSubmit(onSubmit, onInvalid)(event);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit board" : "New board"}</DialogTitle>
          <DialogDescription>
            A board holds the lists your cards move through. Mark one list as the done list and
            cards dropped there are ticked off automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
            <DialogBody className="space-y-6">
              <Stepper
                steps={STEPS}
                current={step}
                reachable={furthestStep}
                onStepSelect={setStep}
              />

              <div className={step === 0 ? "flex flex-col gap-3" : "hidden"}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Board name"
                    placeholder="Product delivery"
                  />

                  <FormSelect
                    control={form.control}
                    name="visibility"
                    label="Who can see it"
                    options={VISIBILITY_OPTIONS}
                  />
                </div>

                <FormColor control={form.control} name="color" label="Colour" />

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormMultiSelect
                    control={form.control}
                    name="memberIds"
                    label="Board members"
                    placeholder="Nobody yet"
                    options={memberChoices}
                    emptyText="No employees yet. Add them under Directory · Employees."
                  />

                  <FormSelect
                    control={form.control}
                    name="ownerId"
                    label="Board owner"
                    placeholder="Unassigned"
                    options={ownerChoices}
                  />
                </div>

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
              </div>

              <div className={step === 1 ? "flex flex-col gap-3" : "hidden"}>
                <p className="text-sm text-muted-foreground">
                  A board holds the lists your cards move through. Mark one list as the done list and
                  cards dropped there are ticked off automatically.
                </p>
                <ListEditor />
              </div>

              <div className={step === 2 ? "flex flex-col gap-3" : "hidden"}>
                <LabelEditor />
              </div>
            </DialogBody>

            <DialogFooter className="sm:justify-between">
              <span className="hidden text-xs text-muted-foreground sm:block">
                Step {step + 1} of {STEPS.length}
              </span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
                  disabled={isSaving}
                >
                  {step === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>
                {step < LAST_STEP ? (
                  <Button key="wizard-next" type="button" onClick={() => void goNext()}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button key="wizard-submit" type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Save changes" : "Create board"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
