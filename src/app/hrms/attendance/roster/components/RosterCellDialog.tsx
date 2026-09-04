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
import { formatDate } from "@/lib/date";
import {
  useDeleteRosterEntryMutation,
  useUpsertRosterEntryMutation,
} from "@/redux/apis/shiftRosterApis";
import { useGetShiftOptionsQuery } from "@/redux/apis/shiftApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ROSTER_STATUSES,
  ROSTER_STATUS_LABELS,
  type RosterGridCell,
  type RosterStatus,
} from "@/types/domain/shiftRoster";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const WEEK_OFF = "WEEK_OFF";

export interface RosterCellTarget {
  employeeId: string;
  employeeName: string;
  cell: RosterGridCell;
}

interface RosterCellDialogProps {
  target: RosterCellTarget | null;
  onOpenChange: (open: boolean) => void;
  canDelete: boolean;
}

export function RosterCellDialog({ target, onOpenChange, canDelete }: RosterCellDialogProps) {
  const open = Boolean(target);
  const { data: shifts = [] } = useGetShiftOptionsQuery(undefined, { skip: !open });
  const [upsertEntry, { isLoading: isSaving }] = useUpsertRosterEntryMutation();
  const [deleteEntry, { isLoading: isDeleting }] = useDeleteRosterEntryMutation();

  const [shiftId, setShiftId] = React.useState<string>(WEEK_OFF);
  const [status, setStatus] = React.useState<RosterStatus>("PUBLISHED");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!target) return;
    setShiftId(target.cell.isWeekOff || !target.cell.shift ? WEEK_OFF : target.cell.shift._id);
    setStatus(target.cell.status ?? "PUBLISHED");
    setNote(target.cell.note ?? "");
  }, [target]);

  const onSave = async () => {
    if (!target) return;
    try {
      await upsertEntry({
        employeeId: target.employeeId,
        date: target.cell.date,
        shiftId: shiftId === WEEK_OFF ? null : shiftId,
        isWeekOff: shiftId === WEEK_OFF,
        status,
        note,
      }).unwrap();
      toast.success("Roster updated");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the roster");
    }
  };

  const onClear = async () => {
    if (!target?.cell.entryId) return;
    try {
      await deleteEntry(target.cell.entryId).unwrap();
      toast.success("Back to the usual shift for that day");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not clear the roster entry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-md">
        <DialogHeader>
          <DialogTitle>{target?.employeeName ?? "Roster"}</DialogTitle>
          <DialogDescription>
            {target ? formatDate(target.cell.date) : ""} — set what this person works that day.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="space-y-2">
            <Label>Shift</Label>
            <Select value={shiftId} onValueChange={setShiftId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WEEK_OFF}>Day off</SelectItem>
                {shifts.map((shift) => (
                  <SelectItem key={shift._id} value={shift._id}>
                    {shift.name} · {shift.startTime}–{shift.endTime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as RosterStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROSTER_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ROSTER_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only published days count towards attendance.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Note</Label>
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              maxLength={300}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          {target?.cell.entryId && canDelete && (
            <Button
              type="button"
              variant="outline"
              className="mr-auto cursor-pointer"
              onClick={onClear}
              disabled={isDeleting || isSaving}
            >
              {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Clear
            </Button>
          )}
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
