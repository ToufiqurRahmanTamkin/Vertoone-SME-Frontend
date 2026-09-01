import {
  FormDate,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
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
import {
  useCreatePipelineActivityMutation,
  useUpdatePipelineActivityMutation,
} from "@/redux/apis/pipelineApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PIPELINE_ACTIVITY_MANUAL_TYPES,
  PIPELINE_ACTIVITY_OUTCOME_LABELS,
  PIPELINE_ACTIVITY_OUTCOMES,
  PIPELINE_ACTIVITY_TYPE_LABELS,
  type PipelineActivity,
} from "@/types/domain/pipeline";
import { PipelineActivitySchema, type PipelineActivityFormValues } from "@/validations/pipeline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface ActivityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  entryId: string;
  contactId: string | null;
  activity?: PipelineActivity | null;
}

const TYPE_OPTIONS = PIPELINE_ACTIVITY_MANUAL_TYPES.map((type) => ({
  label: PIPELINE_ACTIVITY_TYPE_LABELS[type],
  value: type,
}));

const OUTCOME_OPTIONS = PIPELINE_ACTIVITY_OUTCOMES.map((outcome) => ({
  label: PIPELINE_ACTIVITY_OUTCOME_LABELS[outcome],
  value: outcome,
}));

const emptyValues = (): PipelineActivityFormValues => ({
  type: "CALL",
  subject: "",
  body: "",
  location: "",
  occurredAt: new Date().toISOString(),
  durationMinutes: 0,
  dueAt: "",
  isCompleted: true,
  outcome: "NONE",
  performedById: "",
  isPinned: false,
});

export function ActivityFormModal({
  open,
  onOpenChange,
  pipelineId,
  entryId,
  contactId,
  activity,
}: ActivityFormModalProps) {
  const isEdit = Boolean(activity);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const [createActivity, { isLoading: isCreating }] = useCreatePipelineActivityMutation();
  const [updateActivity, { isLoading: isUpdating }] = useUpdatePipelineActivityMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<PipelineActivityFormValues>({
    resolver: zodResolver(PipelineActivitySchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      activity
        ? {
            type: activity.type as PipelineActivityFormValues["type"],
            subject: activity.subject,
            body: activity.body,
            location: activity.location,
            occurredAt: activity.occurredAt,
            durationMinutes: activity.durationMinutes,
            dueAt: activity.dueAt ?? "",
            isCompleted: activity.isCompleted,
            outcome: activity.outcome,
            performedById: activity.performedById ?? "",
            isPinned: activity.isPinned,
          }
        : emptyValues()
    );
  }, [open, activity, form]);

  const performerChoices = React.useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const type = useWatch({ control: form.control, name: "type" });
  const isCompleted = useWatch({ control: form.control, name: "isCompleted" });

  const onSubmit = async (values: PipelineActivityFormValues) => {
    try {
      const body = {
        type: values.type,
        subject: values.subject,
        body: values.body,
        location: values.location,
        occurredAt: values.occurredAt,
        durationMinutes: Number(values.durationMinutes || 0),
        dueAt: values.dueAt || null,
        isCompleted: values.isCompleted,
        outcome: values.outcome,
        performedById: values.performedById || null,
        isPinned: values.isPinned,
      };

      if (activity) {
        await updateActivity({ id: activity._id, body }).unwrap();
        toast.success("Activity updated");
      } else {
        await createActivity({ ...body, pipelineId, entryId, contactId }).unwrap();
        toast.success("Activity logged");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the activity");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit activity" : "Log an activity"}</DialogTitle>
          <DialogDescription>
            Record exactly when it happened. Open activities need a due date and time so they show
            up as follow-ups.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Activity"
                  options={TYPE_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="outcome"
                  label="Outcome"
                  options={OUTCOME_OPTIONS}
                />

                <FormInput
                  control={form.control}
                  name="subject"
                  label="Subject"
                  placeholder="Called about the renewal quote"
                  className="sm:col-span-2"
                />

                <FormDate
                  control={form.control}
                  name="occurredAt"
                  label="Happened at"
                  includeTime
                  description="Date and exact time of the activity."
                />

                <FormInput
                  control={form.control}
                  name="durationMinutes"
                  label="Duration (minutes)"
                  type="number"
                  placeholder="15"
                />

                <FormSelect
                  control={form.control}
                  name="performedById"
                  label="Done by"
                  placeholder="Unassigned"
                  options={performerChoices}
                />

                {(type === "MEETING" || type === "VISIT") && (
                  <FormInput
                    control={form.control}
                    name="location"
                    label="Location"
                    placeholder="Their office, Gulshan 2"
                  />
                )}
              </div>

              <FormTextarea
                control={form.control}
                name="body"
                label="Details"
                placeholder="What was discussed and what happens next"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormSwitch
                  control={form.control}
                  name="isCompleted"
                  label="Already done"
                  description="Turn off to schedule this as a follow-up."
                />
                <FormSwitch
                  control={form.control}
                  name="isPinned"
                  label="Pin to top"
                  description="Keeps this at the top of the timeline."
                />
              </div>

              {!isCompleted && (
                <FormDate
                  control={form.control}
                  name="dueAt"
                  label="Due at"
                  includeTime
                  description="When this follow-up needs to happen."
                />
              )}
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
                {isEdit ? "Save changes" : "Log activity"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
