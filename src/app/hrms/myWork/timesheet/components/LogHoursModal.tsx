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
import { useGetMyGoalsQuery } from "@/redux/apis/goalApis";
import { useGetMyTasksQuery } from "@/redux/apis/taskApis";
import {
  useLogHoursMutation,
  useUpdateTimesheetEntryMutation,
} from "@/redux/apis/timesheetApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  TIMESHEET_WORK_TYPES,
  TIMESHEET_WORK_TYPE_LABELS,
  type TimesheetEntry,
} from "@/types/domain/timesheet";
import {
  TimesheetEntrySchema,
  type TimesheetEntryFormValues,
} from "@/validations/timesheet";
import { toNumber } from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const WORK_TYPE_OPTIONS = TIMESHEET_WORK_TYPES.map((type) => ({
  value: type,
  label: TIMESHEET_WORK_TYPE_LABELS[type],
}));

const emptyValues = (date: string): TimesheetEntryFormValues => ({
  date,
  hours: 1,
  workType: "OTHER",
  taskId: "",
  goalId: "",
  activity: "",
  isBillable: false,
  note: "",
});

const toFormValues = (entry: TimesheetEntry): TimesheetEntryFormValues => ({
  date: entry.date,
  hours: entry.hours,
  workType: entry.workType,
  taskId: entry.taskId ?? "",
  goalId: entry.goalId ?? "",
  activity: entry.activity,
  isBillable: entry.isBillable,
  note: entry.note,
});

interface LogHoursModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: TimesheetEntry | null;
  defaultDate: string;
}

export function LogHoursModal({
  open,
  onOpenChange,
  entry,
  defaultDate,
}: LogHoursModalProps) {
  const [logHours, { isLoading: isCreating }] = useLogHoursMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdateTimesheetEntryMutation();

  const { data: tasks } = useGetMyTasksQuery(
    { limit: 100, isCompleted: false },
    { skip: !open }
  );
  const { data: goals } = useGetMyGoalsQuery({ limit: 100 }, { skip: !open });

  const form = useForm<TimesheetEntryFormValues>({
    resolver: zodResolver(TimesheetEntrySchema),
    defaultValues: emptyValues(defaultDate),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(entry ? toFormValues(entry) : emptyValues(defaultDate));
  }, [open, entry, defaultDate, form]);

  const taskOptions = (tasks?.data ?? []).map((task) => ({
    value: task._id,
    label: task.title,
  }));

  const goalOptions = (goals?.data ?? []).map((goal) => ({
    value: goal._id,
    label: goal.title,
  }));

  const isBusy = isCreating || isUpdating;

  const onSubmit = async (values: TimesheetEntryFormValues) => {
    const body = {
      date: values.date,
      hours: toNumber(values.hours),
      workType: values.workType,
      taskId: values.taskId || null,
      goalId: values.goalId || null,
      activity: values.activity,
      isBillable: values.isBillable,
      note: values.note,
    };

    try {
      if (entry) {
        await updateEntry({ id: entry._id, body }).unwrap();
        toast.success("Entry updated");
      } else {
        await logHours(body).unwrap();
        toast.success("Hours logged");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save those hours");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit entry" : "Log hours"}</DialogTitle>
          <DialogDescription>
            Book the time you spent and say what it went against.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormDate
                  control={form.control}
                  name="date"
                  label="Day"
                  dateOnly
                  disableFuture
                />
                <FormInput
                  control={form.control}
                  name="hours"
                  label="Hours"
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                />
              </div>

              <FormSelect
                control={form.control}
                name="workType"
                label="Kind of work"
                options={WORK_TYPE_OPTIONS}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="taskId"
                  label="Against a task"
                  placeholder="No task"
                  searchable
                  clearable
                  clearLabel="No task"
                  options={taskOptions}
                />
                <FormSelect
                  control={form.control}
                  name="goalId"
                  label="Against a goal"
                  placeholder="No goal"
                  searchable
                  clearable
                  clearLabel="No goal"
                  options={goalOptions}
                />
              </div>

              <FormInput
                control={form.control}
                name="activity"
                label="Or describe it yourself"
                placeholder="Client call, code review, onboarding…"
                maxLength={200}
              />

              <FormSwitch
                control={form.control}
                name="isBillable"
                label="Billable"
                description="Turn on if this time gets charged to a client."
              />

              <FormTextarea
                control={form.control}
                name="note"
                label="Note"
                rows={3}
                maxLength={500}
                placeholder="Anything worth remembering about this time"
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isBusy}>
                {isBusy && <Loader2 className="size-4 animate-spin" />}
                {entry ? "Save changes" : "Log hours"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
