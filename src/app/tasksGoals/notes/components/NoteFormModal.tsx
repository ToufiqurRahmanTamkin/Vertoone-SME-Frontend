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
import { Loader2 } from "lucide-react";
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

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery();
  const { data: boardOptions = [] } = useGetTaskBoardOptionsQuery();

  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(NoteSchema),
    defaultValues: emptyValues(),
  });

  const visibility = useWatch({ control: form.control, name: "visibility" });

  React.useEffect(() => {
    if (!open) return;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit note" : "New note"}</DialogTitle>
          <DialogDescription>
            Write down what the team needs to remember. A private note stays with you; a shared one
            reaches only the people you pick.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-0 p-4 sm:p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Note Content */}
                <div className="flex flex-col gap-3">
                  <FormInput
                    control={form.control}
                    name="title"
                    label="Title"
                    placeholder="Supplier call — pricing agreed"
                  />

                  <FormColor control={form.control} name="color" label="Colour" />

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

                  <FormTextarea
                    control={form.control}
                    name="content"
                    label="Note"
                    placeholder="What was said, decided or needs doing next"
                    rows={12}
                  />
                </div>

                {/* Right Column: Meta & Settings */}
                <div className="flex flex-col gap-3">

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

                  <div className="flex flex-col gap-3">
                    <FormSelect
                      control={form.control}
                      name="boardId"
                      label="Linked board"
                      placeholder="Not linked to a board"
                      options={boardChoices}
                      searchable
                      description="Keeps the note next to the work it belongs to."
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

                  <div className="mt-2 flex flex-col gap-3">
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
                {isEdit ? "Save changes" : "Create note"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
