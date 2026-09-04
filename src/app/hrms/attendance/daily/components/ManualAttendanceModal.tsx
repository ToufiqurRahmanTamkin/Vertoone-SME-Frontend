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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  useUpdateAttendanceMutation,
  useUpsertAttendanceMutation,
} from "@/redux/apis/attendanceApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_LABELS,
  type Attendance,
  type AttendanceStatus,
  type ManualSessionPayload,
} from "@/types/domain/attendance";
import { Loader2, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface ManualAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance?: Attendance | null;
}

interface SessionDraft {
  clockInAt: string;
  clockOutAt: string;
}

const toLocalInput = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const fromLocalInput = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

export function ManualAttendanceModal({
  open,
  onOpenChange,
  attendance,
}: ManualAttendanceModalProps) {
  const isEdit = Boolean(attendance);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery(undefined, { skip: !open });
  const [upsertAttendance, { isLoading: isCreating }] = useUpsertAttendanceMutation();
  const [updateAttendance, { isLoading: isUpdating }] = useUpdateAttendanceMutation();
  const isSaving = isCreating || isUpdating;

  const [employeeId, setEmployeeId] = React.useState("");
  const [date, setDate] = React.useState<string>(new Date().toISOString());
  const [status, setStatus] = React.useState<AttendanceStatus | "AUTO">("AUTO");
  const [note, setNote] = React.useState("");
  const [sessions, setSessions] = React.useState<SessionDraft[]>([]);

  React.useEffect(() => {
    if (!open) return;

    if (attendance) {
      setEmployeeId(attendance.employeeId);
      setDate(attendance.date);
      setStatus(attendance.status);
      setNote(attendance.note);
      setSessions(
        attendance.sessions.map((session) => ({
          clockInAt: toLocalInput(session.clockInAt),
          clockOutAt: toLocalInput(session.clockOutAt),
        }))
      );
      return;
    }

    setEmployeeId("");
    setDate(new Date().toISOString());
    setStatus("AUTO");
    setNote("");
    setSessions([{ clockInAt: "", clockOutAt: "" }]);
  }, [open, attendance]);

  const updateSession = (index: number, patch: Partial<SessionDraft>) =>
    setSessions((current) =>
      current.map((session, position) =>
        position === index ? { ...session, ...patch } : session
      )
    );

  const onSave = async () => {
    const payloadSessions: ManualSessionPayload[] = sessions
      .filter((session) => session.clockInAt)
      .map((session) => ({
        clockInAt: fromLocalInput(session.clockInAt) as string,
        clockOutAt: fromLocalInput(session.clockOutAt),
      }));

    try {
      if (attendance) {
        await updateAttendance({
          id: attendance._id,
          body: {
            sessions: payloadSessions,
            status: status === "AUTO" ? undefined : status,
            note,
          },
        }).unwrap();
        toast.success("Attendance updated");
      } else {
        if (!employeeId) {
          toast.error("Pick an employee first");
          return;
        }
        await upsertAttendance({
          employeeId,
          date,
          sessions: payloadSessions,
          status: status === "AUTO" ? undefined : status,
          note,
        }).unwrap();
        toast.success("Attendance recorded");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the attendance record");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit ${attendance?.employee?.name ?? "attendance"}` : "Record attendance"}
          </DialogTitle>
          <DialogDescription>
            Enter the punches by hand. Status, lateness and overtime are worked out from them
            unless you override the status.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId} disabled={isEdit}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick the employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeOptions.map((option) => (
                    <SelectItem key={option._id} value={option._id}>
                      {option.name}
                      {option.employeeCode ? ` (${option.employeeCode})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                value={date}
                onValueChange={(value) => setDate(value ?? new Date().toISOString())}
                dateOnly
                disabled={isEdit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Punches</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() =>
                  setSessions((current) => [...current, { clockInAt: "", clockOutAt: "" }])
                }
              >
                <Plus className="size-4" />
                Add punch
              </Button>
            </div>

            <div className="space-y-2">
              {sessions.length === 0 && (
                <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                  No punches. Saving like this marks the day absent.
                </p>
              )}
              {sessions.map((session, index) => (
                <div key={index} className="flex flex-wrap items-end gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Clock in</Label>
                    <Input
                      type="datetime-local"
                      value={session.clockInAt}
                      onChange={(event) =>
                        updateSession(index, { clockInAt: event.target.value })
                      }
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Clock out</Label>
                    <Input
                      type="datetime-local"
                      value={session.clockOutAt}
                      onChange={(event) =>
                        updateSession(index, { clockOutAt: event.target.value })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 cursor-pointer"
                    aria-label="Remove punch"
                    onClick={() =>
                      setSessions((current) =>
                        current.filter((_, position) => position !== index)
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as AttendanceStatus | "AUTO")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTO">Work it out from the punches</SelectItem>
                {ATTENDANCE_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ATTENDANCE_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Why this was entered by hand (optional)"
              rows={2}
            />
          </div>
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
          <Button type="button" className="cursor-pointer" onClick={onSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Record attendance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
