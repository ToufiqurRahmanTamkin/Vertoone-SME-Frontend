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

import { useModulePermission } from "@/hooks/use-permission";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useCreateNoteMutation, useUpdateNoteMutation } from "@/redux/apis/noteApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { useGetTaskBoardOptionsQuery } from "@/redux/apis/taskApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEFAULT_NOTE_COLOR,
  NOTE_VISIBILITIES,
  NOTE_VISIBILITY_LABELS,
  type Note,
} from "@/types/domain/note";
import { NoteSchema, type NoteFormValues } from "@/validations/note";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface NoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note | null;
}

const VISIBILITY_OPTIONS = NOTE_VISIBILITIES.map((visibility) => ({
  label: NOTE_VISIBILITY_LABELS[visibility],
  value: visibility,
}));

const STEPS: StepperStep[] = [
  { id: "details", label: "Note details" },
  { id: "settings", label: "Settings" },
];

const STEP_FIELDS: readonly (keyof NoteFormValues)[][] = [
  ["title", "content", "color"],
  ["visibility", "ownerId", "sharedWithIds", "boardId", "reminderAt", "tagIds", "isPinned", "isArchived"],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) => fields.includes(field as keyof NoteFormValues));
  return index === -1 ? 0 : index;
};

const emptyValues = (): NoteFormValues => ({
  title: "",
  content: "",
  color: DEFAULT_NOTE_COLOR,
  visibility: "COMPANY",
  ownerId: "",
  sharedWithIds: [],
  tagIds: [],
  boardId: "",
  reminderAt: "",
  isPinned: false,
  isArchived: false,
});

export function NoteFormModal({ open, onOpenChange, note }: NoteFormModalProps) {
  const isEdit = Boolean(note);
  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  // A share holder has no company-wide read on these lists, so do not even ask.
  const ownsModule = useModulePermission("/company/tasks-and-goals/notes").canView;

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery(undefined, {
    skip: !ownsModule,
  });
  const { data: tagOptions = [] } = useGetTagOptionsQuery(undefined, { skip: !ownsModule });
  const { data: boardOptions = [] } = useGetTaskBoardOptionsQuery(undefined, {
    skip: !ownsModule,
  });

  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(NoteSchema),
    defaultValues: emptyValues(),
  });

  const visibility = useWatch({ control: form.control, name: "visibility" });

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setFurthestStep(0);
      return;
    }

    form.reset(
      note
        ? {
            title: note.title,
            content: note.content,
            color: note.color || DEFAULT_NOTE_COLOR,
            visibility: note.visibility,
            ownerId: note.ownerId ?? "",
            sharedWithIds: note.sharedWithIds,
            tagIds: note.tagIds,
            boardId: note.boardId ?? "",
            reminderAt: note.reminderAt ?? "",
            isPinned: note.isPinned,
            isArchived: note.isArchived,
          }
        : emptyValues()
    );
  }, [open, note, form]);

  const ownerChoices = React.useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const boardChoices = React.useMemo(
    () => [
      { label: "Not linked to a board", value: "" },
      ...boardOptions.map((board) => ({ label: board.name, value: board._id })),
    ],
    [boardOptions]
  );

  const peopleChoices = React.useMemo<MultiSelectOption[]>(
    () => employeeOptions.map((employee) => ({ value: employee._id, label: employee.name })),
    [employeeOptions]
  );

  const tagChoices = React.useMemo<MultiSelectOption[]>(
    () => tagOptions.map((tag) => ({ value: tag._id, label: tag.name, color: tag.color })),
    [tagOptions]
  );

  const onSubmit = async (values: NoteFormValues) => {
    const body = {
      title: values.title,
      content: values.content,
      color: values.color,
      visibility: values.visibility,
      ownerId: values.ownerId || null,
      sharedWithIds: values.visibility === "SHARED" ? values.sharedWithIds : [],
      tagIds: values.tagIds,
      boardId: values.boardId || null,
      reminderAt: values.reminderAt || null,
      isPinned: values.isPinned,
      isArchived: values.isArchived,
    };

    try {
      if (note) {
        await updateNote({ id: note._id, body }).unwrap();
        toast.success("Note updated");
      } else {
        await createNote(body).unwrap();
        toast.success("Note created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the note");
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
          <DialogTitle>{isEdit ? "Edit note" : "New note"}</DialogTitle>
          <DialogDescription>
            Write down what the team needs to remember. A private note stays with you; a shared one
            reaches only the people you pick.
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

              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <FormInput
                    control={form.control}
                    name="title"
                    label="Title"
                    placeholder="Supplier call — pricing agreed"
                  />
                  <FormColor control={form.control} name="color" label="Colour" />
                  <FormTextarea
                    control={form.control}
                    name="content"
                    label="Note"
                    placeholder="What was said, decided or needs doing next"
                    rows={12}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormSelect
                      control={form.control}
                      name="visibility"
                      label="Who can read it"
                      options={VISIBILITY_OPTIONS}
                    />
                    <FormSelect
                      control={form.control}
                      name="ownerId"
                      label="Owner"
                      placeholder="Unassigned"
                      options={ownerChoices}
                      searchable
                    />
                  </div>

                  {visibility === "SHARED" && (
                    <FormMultiSelect
                      control={form.control}
                      name="sharedWithIds"
                      label="Shared with"
                      placeholder="Nobody yet"
                      options={peopleChoices}
                      searchable
                      emptyText="No employees yet. Add them under Directory · Employees."
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormSelect
                      control={form.control}
                      name="boardId"
                      label="Linked board"
                      placeholder="Not linked to a board"
                      options={boardChoices}
                      searchable
                    />
                    <FormDate
                      control={form.control}
                      name="reminderAt"
                      label="Remind me at"
                      includeTime
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormSwitch
                      control={form.control}
                      name="isPinned"
                      label="Pinned"
                      description="Pinned notes sit at the top of the list."
                    />
                    <FormSwitch
                      control={form.control}
                      name="isArchived"
                      label="Archived"
                      description="Archived notes stay searchable but drop off the main list."
                    />
                  </div>
                </div>
              )}
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
                    {isEdit ? "Save changes" : "Create note"}
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
