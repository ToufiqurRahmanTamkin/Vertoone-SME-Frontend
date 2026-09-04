import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { useClockInMutation, useClockOutMutation } from "@/redux/apis/attendanceApis";
import {
  ATTENDANCE_STATUS_COLORS,
  formatClock,
  formatMinutes,
  type TodayStatus,
} from "@/types/domain/attendance";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const minutesSince = (since: string, now: number): number =>
  Math.max(0, Math.round((now - new Date(since).getTime()) / 60000));

interface ClockCardProps {
  today?: TodayStatus;
  isLoading?: boolean;
  compact?: boolean;
}

export function ClockCard({ today, isLoading, compact = false }: ClockCardProps) {
  const [clockIn, { isLoading: isClockingIn }] = useClockInMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();
  const [note, setNote] = React.useState("");
  const [now, setNow] = React.useState(() => Date.now());

  const isOpen = Boolean(today?.isClockedIn);

  React.useEffect(() => {
    if (!isOpen) return;
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  const liveMinutes = today
    ? today.workedMinutes + (isOpen ? minutesSince(today.serverTime, now) : 0)
    : 0;

  const punch = async (direction: "IN" | "OUT") => {
    try {
      const body = { note: note.trim() || undefined, source: "WEB" as const };
      if (direction === "IN") {
        await clockIn(body).unwrap();
        toast.success("Clocked in");
      } else {
        await clockOut(body).unwrap();
        toast.success("Clocked out");
      }
      setNote("");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(
        err?.data?.message ||
          (direction === "IN" ? "Could not clock you in" : "Could not clock you out")
      );
    }
  };

  if (isLoading || !today) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  const isBusy = isClockingIn || isClockingOut;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">
              {today.scheduleKind === "HOLIDAY"
                ? today.holidayName || "Holiday"
                : today.scheduleKind === "WEEK_OFF"
                  ? "Day off"
                  : today.shiftName || "No shift set"}
            </p>
            <StatusBadge
              color={ATTENDANCE_STATUS_COLORS[today.status] ?? "muted"}
              label={today.statusLabel}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {today.scheduleKind === "SHIFT" && today.shiftStartTime
              ? `${today.shiftStartTime} – ${today.shiftEndTime}`
              : "Nothing scheduled"}
            {today.timezone && ` · ${today.timezone}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">{formatMinutes(liveMinutes)}</p>
          <p className="text-xs text-muted-foreground">logged today</p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/20 p-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">First in</dt>
          <dd className="font-medium tabular-nums">{formatClock(today.firstClockInAt)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Last out</dt>
          <dd className="font-medium tabular-nums">{formatClock(today.lastClockOutAt)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Late by</dt>
          <dd className="font-medium tabular-nums">
            {today.lateMinutes > 0 ? formatMinutes(today.lateMinutes) : "—"}
          </dd>
        </div>
      </dl>

      {!compact && (
        <Input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={isOpen ? "Note for clocking out (optional)" : "Note for clocking in (optional)"}
          maxLength={300}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          className="flex-1 cursor-pointer"
          disabled={!today.canClockIn || isBusy}
          onClick={() => punch("IN")}
        >
          {isClockingIn ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          Clock in
        </Button>
        <Button
          variant="outline"
          className="flex-1 cursor-pointer"
          disabled={!today.canClockOut || isBusy}
          onClick={() => punch("OUT")}
        >
          {isClockingOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          Clock out
        </Button>
      </div>

      {today.blockedReason && (
        <p className="text-xs text-muted-foreground">{today.blockedReason}</p>
      )}

      {today.sessions.length > 0 && !compact && (
        <div className="divide-y rounded-lg border text-sm">
          {today.sessions.map((session, index) => (
            <div
              key={`${session.clockInAt}-${index}`}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <span className="tabular-nums">
                {formatClock(session.clockInAt)} → {formatClock(session.clockOutAt)}
              </span>
              <span className="text-xs text-muted-foreground">
                {session.isOpen ? "In progress" : formatMinutes(session.minutes)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
