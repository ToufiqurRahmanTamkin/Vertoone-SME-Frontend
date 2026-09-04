import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Switch } from "@/components/ui/switch";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetShiftOptionsQuery } from "@/redux/apis/shiftApis";
import { useGenerateRosterMutation } from "@/redux/apis/shiftRosterApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { WEEKDAY_SHORT_LABELS } from "@/types/domain/employeeShift";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface GenerateRosterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFrom: string;
  defaultTo: string;
}

const toggle = (values: string[], value: string): string[] =>
  values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

export function GenerateRosterDialog({
  open,
  onOpenChange,
  defaultFrom,
  defaultTo,
}: GenerateRosterDialogProps) {
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery(undefined, { skip: !open });
  const { data: shifts = [] } = useGetShiftOptionsQuery(undefined, { skip: !open });
  const [generateRoster, { isLoading: isSaving }] = useGenerateRosterMutation();

  const [employeeIds, setEmployeeIds] = React.useState<string[]>([]);
  const [shiftIds, setShiftIds] = React.useState<string[]>([]);
  const [from, setFrom] = React.useState(defaultFrom);
  const [to, setTo] = React.useState(defaultTo);
  const [daysPerShift, setDaysPerShift] = React.useState("7");
  const [weekOffDays, setWeekOffDays] = React.useState<number[]>([]);
  const [publish, setPublish] = React.useState(true);
  const [overwrite, setOverwrite] = React.useState(false);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setEmployeeIds([]);
    setShiftIds([]);
    setFrom(defaultFrom);
    setTo(defaultTo);
    setDaysPerShift("7");
    setWeekOffDays([]);
    setPublish(true);
    setOverwrite(false);
    setSearch("");
  }, [open, defaultFrom, defaultTo]);

  const visibleEmployees = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return employeeOptions;
    return employeeOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(needle) ||
        (option.employeeCode ?? "").toLowerCase().includes(needle)
    );
  }, [employeeOptions, search]);

  const onGenerate = async () => {
    if (employeeIds.length === 0) {
      toast.error("Pick at least one employee");
      return;
    }
    if (shiftIds.length === 0) {
      toast.error("Pick at least one shift to rotate through");
      return;
    }

    try {
      const result = await generateRoster({
        employeeIds,
        shiftIds,
        from,
        to,
        daysPerShift: Number(daysPerShift) || 7,
        weekOffDays,
        status: publish ? "PUBLISHED" : "DRAFT",
        overwrite,
      }).unwrap();

      toast.success(
        `${result.created} day${result.created === 1 ? "" : "s"} planned`,
        {
          description: `${result.updated} updated · ${result.skipped} left alone`,
        }
      );
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not generate the roster");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generate a roster</DialogTitle>
          <DialogDescription>
            Rotate the chosen people through the chosen shifts across a range of dates.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>From</Label>
              <DatePicker
                value={from}
                onValueChange={(value) => setFrom(value ?? defaultFrom)}
                dateOnly
              />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <DatePicker
                value={to}
                onValueChange={(value) => setTo(value ?? defaultTo)}
                dateOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Shifts to rotate through</Label>
            <div className="flex flex-wrap gap-2">
              {shifts.map((shift) => {
                const picked = shiftIds.includes(shift._id);
                return (
                  <button
                    key={shift._id}
                    type="button"
                    onClick={() => setShiftIds((current) => toggle(current, shift._id))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      picked
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {shift.name} · {shift.startTime}–{shift.endTime}
                  </button>
                );
              })}
              {shifts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Create a shift first under HRMS settings.
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Order matters — people start on different shifts so the rota staggers.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Days on each shift</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={daysPerShift}
                onChange={(event) => setDaysPerShift(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Days off every week</Label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_SHORT_LABELS.map((label, day) => {
                  const picked = weekOffDays.includes(day);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        setWeekOffDays((current) =>
                          current.includes(day)
                            ? current.filter((entry) => entry !== day)
                            : [...current, day]
                        )
                      }
                      className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        picked
                          ? "border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Employees</Label>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search people..."
            />
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-2">
              {visibleEmployees.map((option) => (
                <label
                  key={option._id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted"
                >
                  <Checkbox
                    checked={employeeIds.includes(option._id)}
                    onCheckedChange={() =>
                      setEmployeeIds((current) => toggle(current, option._id))
                    }
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{option.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {option.employeeCode}
                  </span>
                </label>
              ))}
              {visibleEmployees.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nobody matches that search.
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {employeeIds.length} selected
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Publish straight away</p>
                <p className="text-xs text-muted-foreground">
                  Published days drive attendance. Drafts are just a plan.
                </p>
              </div>
              <Switch checked={publish} onCheckedChange={setPublish} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Replace days already planned</p>
                <p className="text-xs text-muted-foreground">
                  Off by default, so existing entries are left alone.
                </p>
              </div>
              <Switch checked={overwrite} onCheckedChange={setOverwrite} />
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
          <Button
            type="button"
            className="cursor-pointer"
            onClick={onGenerate}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Generate roster
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
