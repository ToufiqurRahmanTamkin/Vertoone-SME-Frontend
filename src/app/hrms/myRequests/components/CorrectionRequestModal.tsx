import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { useCreateAttendanceCorrectionMutation } from "@/redux/apis/attendanceCorrectionApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CORRECTION_TYPES,
  CORRECTION_TYPE_LABELS,
  type CorrectionType,
} from "@/types/domain/attendanceCorrection";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface CorrectionRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const dateOnly = (value: string): string => new Date(value).toISOString().slice(0, 10);

const combine = (date: string, time: string): string | null =>
  time ? new Date(`${dateOnly(date)}T${time}`).toISOString() : null;

export function CorrectionRequestModal({ open, onOpenChange }: CorrectionRequestModalProps) {
  const [createCorrection, { isLoading: isSaving }] = useCreateAttendanceCorrectionMutation();

  const [date, setDate] = React.useState(new Date().toISOString());
  const [type, setType] = React.useState<CorrectionType>("MISSED_CLOCK_IN");
  const [clockInTime, setClockInTime] = React.useState("");
  const [clockOutTime, setClockOutTime] = React.useState("");
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setDate(new Date().toISOString());
    setType("MISSED_CLOCK_IN");
    setClockInTime("");
    setClockOutTime("");
    setReason("");
  }, [open]);

  const onSubmit = async () => {
    const requestedClockInAt = combine(date, clockInTime);
    const requestedClockOutAt = combine(date, clockOutTime);

    if (!requestedClockInAt && !requestedClockOutAt) {
      toast.error("Give the clock-in time, the clock-out time, or both");
      return;
    }
    if (reason.trim().length < 5) {
      toast.error("Say a little about why this needs fixing");
      return;
    }

    try {
      await createCorrection({
        date,
        type,
        requestedClockInAt,
        requestedClockOutAt,
        reason: reason.trim(),
      }).unwrap();
      toast.success("Correction requested");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not submit the request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ask for a correction</DialogTitle>
          <DialogDescription>
            Tell HR what the punches should have been. They apply once it is approved.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="space-y-2">
            <Label>Day to fix</Label>
            <DatePicker
              value={date}
              onValueChange={(value) => setDate(value ?? new Date().toISOString())}
              dateOnly
              disableFuture
            />
          </div>

          <div className="space-y-2">
            <Label>What went wrong</Label>
            <Select value={type} onValueChange={(value) => setType(value as CorrectionType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CORRECTION_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {CORRECTION_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Clocked in at</Label>
              <Input
                type="time"
                value={clockInTime}
                onChange={(event) => setClockInTime(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Clocked out at</Label>
              <Input
                type="time"
                value={clockOutTime}
                onChange={(event) => setClockOutTime(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="I was on site and forgot to punch out."
              rows={3}
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
          <Button
            type="button"
            className="cursor-pointer"
            onClick={onSubmit}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
