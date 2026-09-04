import { FormDate, FormInput, FormSelect, FormTextarea } from "@/components/shared/form-fields";
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
import {
  useCreateWorkHistoryMutation,
  useUpdateWorkHistoryMutation,
} from "@/redux/apis/workHistoryApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  WORK_HISTORY_TYPES,
  WORK_HISTORY_TYPE_LABELS,
  type WorkHistoryEntry,
  type WorkHistoryPayload,
} from "@/types/domain/workHistory";
import { WorkHistorySchema, type WorkHistoryFormValues } from "@/validations/workHistory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface WorkHistoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: WorkHistoryEntry | null;
  defaultEmployeeId?: string;
}

const TYPE_OPTIONS = WORK_HISTORY_TYPES.map((value) => ({
  value,
  label: WORK_HISTORY_TYPE_LABELS[value],
}));

const emptyValues = (employeeId = ""): WorkHistoryFormValues => ({
  employeeId,
  type: "PROMOTED",
  title: "",
  effectiveDate: new Date().toISOString(),
  endDate: "",
  fromLabel: "",
  toLabel: "",
  note: "",
});

const toFormValues = (entry: WorkHistoryEntry): WorkHistoryFormValues => ({
  employeeId: entry.employeeId,
  type: entry.type,
  title: entry.title,
  effectiveDate: entry.effectiveDate,
  endDate: entry.endDate ?? "",
  fromLabel: entry.fromLabel,
  toLabel: entry.toLabel,
  note: entry.note,
});

const toPayload = (values: WorkHistoryFormValues): WorkHistoryPayload => ({
  employeeId: values.employeeId,
  type: values.type,
  title: values.title || undefined,
  effectiveDate: values.effectiveDate,
  endDate: values.endDate || null,
  fromLabel: values.fromLabel,
  toLabel: values.toLabel,
  note: values.note,
});

export function WorkHistoryFormModal({
  open,
  onOpenChange,
  entry,
  defaultEmployeeId,
}: WorkHistoryFormModalProps) {
  const isEdit = Boolean(entry);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery(undefined, { skip: !open });
  const [createEntry, { isLoading: isCreating }] = useCreateWorkHistoryMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdateWorkHistoryMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<WorkHistoryFormValues>({
    resolver: zodResolver(WorkHistorySchema),
    defaultValues: emptyValues(defaultEmployeeId),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(entry ? toFormValues(entry) : emptyValues(defaultEmployeeId));
  }, [open, entry, defaultEmployeeId, form]);

  const onSubmit = async (values: WorkHistoryFormValues) => {
    try {
      if (entry) {
        const { employeeId: _employeeId, ...body } = toPayload(values);
        await updateEntry({ id: entry._id, body }).unwrap();
        toast.success("Work history updated");
      } else {
        await createEntry(toPayload(values)).unwrap();
        toast.success("Work history entry added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the entry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit work history" : "Add to work history"}</DialogTitle>
          <DialogDescription>
            Record a posting, promotion, transfer or any other milestone in someone&apos;s time
            here.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-3 p-4 sm:p-6">
              <FormSelect
                control={form.control}
                name="employeeId"
                label="Employee"
                placeholder="Pick the employee"
                disabled={isEdit}
                searchable
                options={employeeOptions.map((option) => ({
                  value: option._id,
                  label: `${option.name}${option.employeeCode ? ` (${option.employeeCode})` : ""}`,
                }))}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Event type"
                  options={TYPE_OPTIONS}
                />
                <FormInput
                  control={form.control}
                  name="title"
                  label="Headline"
                  placeholder="Promoted to Senior Engineer"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormDate
                  control={form.control}
                  name="effectiveDate"
                  label="Effective from"
                  dateOnly
                />
                <FormDate
                  control={form.control}
                  name="endDate"
                  label="Effective to (optional)"
                  dateOnly
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="fromLabel"
                  label="Was"
                  placeholder="Engineer"
                />
                <FormInput
                  control={form.control}
                  name="toLabel"
                  label="Became"
                  placeholder="Senior Engineer"
                />
              </div>

              <FormTextarea
                control={form.control}
                name="note"
                label="Note"
                placeholder="Anything worth remembering about this change (optional)"
                rows={3}
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
