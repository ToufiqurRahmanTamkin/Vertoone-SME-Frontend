import { FilePickerDialog } from "@/components/shared/file-picker-dialog";
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
import { useCreateLeaveRequestMutation } from "@/redux/apis/leaveRequestApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  LEAVE_DAY_PARTS,
  LEAVE_DAY_PART_LABELS,
  type LeaveAttachment,
  type LeaveBalanceRow,
  type LeaveDayPart,
} from "@/types/domain/leaveRequest";
import { Loader2, Paperclip, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface LeaveRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances: LeaveBalanceRow[];
}

export function LeaveRequestModal({ open, onOpenChange, balances }: LeaveRequestModalProps) {
  const [session, setSession] = React.useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setSession((current) => current + 1);
        onOpenChange(next);
      }}
    >
      {open && <LeaveRequestBody key={session} balances={balances} onOpenChange={onOpenChange} />}
    </Dialog>
  );
}

interface LeaveRequestBodyProps {
  balances: LeaveBalanceRow[];
  onOpenChange: (open: boolean) => void;
}

function LeaveRequestBody({ balances, onOpenChange }: LeaveRequestBodyProps) {
  const [createRequest, { isLoading: isSaving }] = useCreateLeaveRequestMutation();

  const [leaveTypeId, setLeaveTypeId] = React.useState(balances[0]?.leaveTypeId ?? "");
  const [startDate, setStartDate] = React.useState<string | null>(new Date().toISOString());
  const [endDate, setEndDate] = React.useState<string | null>(new Date().toISOString());
  const [chosenDayPart, setChosenDayPart] = React.useState<LeaveDayPart>("FULL_DAY");
  const [reason, setReason] = React.useState("");
  const [contactNumber, setContactNumber] = React.useState("");
  const [attachments, setAttachments] = React.useState<LeaveAttachment[]>([]);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const selected = balances.find((balance) => balance.leaveTypeId === leaveTypeId) ?? null;
  const dayPart: LeaveDayPart = selected?.allowHalfDay ? chosenDayPart : "FULL_DAY";

  const onSubmit = async () => {
    if (!leaveTypeId) {
      toast.error("Pick the kind of leave you need");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Give the first and last day");
      return;
    }
    if (reason.trim().length < 5) {
      toast.error("Say a little about why you need the time off");
      return;
    }

    try {
      await createRequest({
        leaveTypeId,
        startDate,
        endDate: dayPart === "FULL_DAY" ? endDate : startDate,
        dayPart,
        reason: reason.trim(),
        contactNumber: contactNumber.trim() || undefined,
        attachments,
      }).unwrap();

      toast.success("Leave requested");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send the request");
    }
  };

  return (
    <>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for time off</DialogTitle>
          <DialogDescription>
            Weekends and holidays are taken out for you, so you only spend the days you owe.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="space-y-2">
            <Label>Kind of leave</Label>
            <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick a leave type" />
              </SelectTrigger>
              <SelectContent>
                {balances.map((balance) => (
                  <SelectItem key={balance.leaveTypeId} value={balance.leaveTypeId}>
                    {balance.name} · {balance.remainingDays} left
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected && (
              <p className="text-xs text-muted-foreground">
                {selected.remainingDays} of {selected.entitledDays} day(s) left this leave year
                {selected.noticeDays > 0 && ` · needs ${selected.noticeDays} day(s) of notice`}
                {selected.requiresDocument &&
                  ` · a document is needed over ${selected.documentAfterDays} day(s)`}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>How much of the day</Label>
            <Select
              value={dayPart}
              onValueChange={(value) => setChosenDayPart(value as LeaveDayPart)}
              disabled={!selected?.allowHalfDay}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_DAY_PARTS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {LEAVE_DAY_PART_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected && !selected.allowHalfDay && (
              <p className="text-xs text-muted-foreground">
                {selected.name} has to be taken as whole days.
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First day</Label>
              <DatePicker value={startDate} onValueChange={setStartDate} dateOnly />
            </div>
            <div className="space-y-2">
              <Label>Last day</Label>
              <DatePicker
                value={dayPart === "FULL_DAY" ? endDate : startDate}
                onValueChange={setEndDate}
                dateOnly
                disabled={dayPart !== "FULL_DAY"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Attending my sister's wedding out of town."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Where we can reach you</Label>
            <Input
              value={contactNumber}
              onChange={(event) => setContactNumber(event.target.value)}
              placeholder="Optional — a number that works while you are away"
            />
          </div>

          <div className="space-y-2">
            <Label>Supporting documents</Label>
            <div className="flex flex-col gap-2">
              {attachments.map((attachment, index) => (
                <div
                  key={`${attachment.url}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="truncate">{attachment.fileName || attachment.url}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 cursor-pointer"
                    onClick={() =>
                      setAttachments((current) =>
                        current.filter((_, position) => position !== index)
                      )
                    }
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setPickerOpen(true)}
                disabled={attachments.length >= 5}
              >
                <Paperclip className="mr-2 size-4" />
                Attach a file
              </Button>
            </div>
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
          <Button type="button" className="cursor-pointer" onClick={onSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>

      <FilePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        multiple
        title="Attach to your leave request"
        description="Pick something already in your file manager, or upload it now."
        onSelect={(files) =>
          setAttachments((current) =>
            [
              ...current,
              ...files.map((file) => ({ url: file.url, fileName: file.name || file.fileName })),
            ].slice(0, 5)
          )
        }
      />
    </>
  );
}
