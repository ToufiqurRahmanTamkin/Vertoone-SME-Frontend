import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";
import { useGetRosterBoardQuery, usePublishRosterMutation } from "@/redux/apis/shiftRosterApis";
import { useGetRosterSummaryQuery } from "@/redux/apis/shiftRosterApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { RosterGridCell } from "@/types/domain/shiftRoster";
import { CalendarDays, Send, Sparkles } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { GenerateRosterDialog } from "./components/GenerateRosterDialog";
import { RosterCellDialog, type RosterCellTarget } from "./components/RosterCellDialog";

const isoDaysFromToday = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const columnLabel = (value: string): { day: string; weekday: string } => {
  const date = new Date(value);
  return {
    day: String(date.getUTCDate()),
    weekday: date.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" }),
  };
};

function Cell({
  cell,
  onSelect,
  canEdit,
}: {
  cell: RosterGridCell;
  onSelect: () => void;
  canEdit: boolean;
}) {
  const isPlanned = cell.entryId !== null;
  const isDraft = cell.status === "DRAFT";

  return (
    <button
      type="button"
      onClick={canEdit ? onSelect : undefined}
      title={
        cell.shift
          ? `${cell.shift.name} ${cell.shift.startTime}–${cell.shift.endTime}`
          : cell.note || "Day off"
      }
      className={cn(
        "flex h-12 w-full flex-col items-center justify-center rounded-md border px-1 text-[10px] font-semibold leading-tight transition-colors",
        cell.shift ? "" : "bg-muted/50 text-muted-foreground",
        isDraft && "border-dashed",
        !isPlanned && "border-transparent opacity-70",
        canEdit ? "cursor-pointer hover:brightness-105" : "cursor-default"
      )}
      style={
        cell.shift
          ? { backgroundColor: `${cell.shift.color}1f`, color: cell.shift.color, borderColor: `${cell.shift.color}55` }
          : undefined
      }
    >
      <span className="w-full truncate text-center">
        {cell.shift ? cell.shift.code || cell.shift.name : "Off"}
      </span>
      {cell.shift && (
        <span className="w-full truncate text-center opacity-80">{cell.shift.startTime}</span>
      )}
    </button>
  );
}

export default function RosterPage() {
  const access = useModulePermission("/hrms/attendance/roster");

  const [from, setFrom] = React.useState(() => isoDaysFromToday(0));
  const [to, setTo] = React.useState(() => isoDaysFromToday(13));
  const [search, setSearch] = React.useState("");
  const [generateOpen, setGenerateOpen] = React.useState(false);
  const [target, setTarget] = React.useState<RosterCellTarget | null>(null);

  const { data: grid, isLoading, isFetching } = useGetRosterBoardQuery({
    from,
    to,
    search: search.trim() || undefined,
  });
  const { data: summary } = useGetRosterSummaryQuery({ from, to });
  const [publishRoster, { isLoading: isPublishing }] = usePublishRosterMutation();

  const onPublish = async () => {
    try {
      const result = await publishRoster({ from, to }).unwrap();
      toast.success(
        result.published > 0
          ? `${result.published} day${result.published === 1 ? "" : "s"} published`
          : "Nothing was waiting to be published"
      );
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not publish the roster");
    }
  };

  const days = grid?.days ?? [];
  const rows = grid?.rows ?? [];

  return (
    <>
      <PageHeader
        title="Roster planning"
        description="Plan who works which shift, day by day. Published days drive attendance; drafts are just a plan."
        actions={
          access.canEdit && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={onPublish}
              disabled={isPublishing || (summary?.draft ?? 0) === 0}
              title={
                (summary?.draft ?? 0) === 0
                  ? "Nothing is waiting to be published in this range"
                  : undefined
              }
            >
              <Send className="size-4" />
              Publish drafts
            </Button>
          )
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Days planned</StatLabel>
          <StatValue>{summary?.planned ?? 0}</StatValue>
          <StatDescription>Across {summary?.employeesCovered ?? 0} people</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Published</StatLabel>
          <StatValue>{summary?.published ?? 0}</StatValue>
          <StatDescription>These count towards attendance</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Still draft</StatLabel>
          <StatValue>{summary?.draft ?? 0}</StatValue>
          <StatDescription>Waiting to be published</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Days off planned</StatLabel>
          <StatValue>{summary?.weekOffs ?? 0}</StatValue>
          <StatDescription>Explicit rest days in the rota</StatDescription>
        </Stat>
      </StatGrid>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">From</Label>
          <DatePicker
            value={from}
            onValueChange={(value) => setFrom(value ?? isoDaysFromToday(0))}
            dateOnly
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">To</Label>
          <DatePicker
            value={to}
            onValueChange={(value) => setTo(value ?? isoDaysFromToday(13))}
            dateOnly
            className="w-40"
          />
        </div>
        <div className="min-w-48 flex-1 space-y-1.5">
          <Label className="text-xs text-muted-foreground">Search</Label>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people..."
          />
        </div>
        {access.canCreate && (
          <ActionButton
            icon={Sparkles}
            label="Generate roster"
            onClick={() => setGenerateOpen(true)}
          />
        )}
      </div>

      <SectionCard
        icon={CalendarDays}
        title="The rota"
        description="Faded cells follow the employee's usual shift. Click a cell to override it."
        contentClassName="p-0 md:p-0"
      >
        {isLoading ? (
          <div className="space-y-2 p-5 md:p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No active employees match this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 p-4">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-card px-2 text-left text-xs font-medium text-muted-foreground">
                    Employee
                  </th>
                  {days.map((day) => {
                    const { day: dayNumber, weekday } = columnLabel(day);
                    return (
                      <th key={day} className="min-w-16 px-1 text-xs font-medium">
                        <span className="block text-muted-foreground">{weekday}</span>
                        <span className="block tabular-nums">{dayNumber}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.employeeId}>
                    <th className="sticky left-0 z-10 min-w-40 max-w-52 bg-card px-2 text-left">
                      <span className="block truncate text-sm font-medium">
                        {row.employee.name}
                      </span>
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {row.employee.employeeCode}
                      </span>
                    </th>
                    {row.cells.map((cell) => (
                      <td key={cell.date} className="min-w-16">
                        <Cell
                          cell={cell}
                          canEdit={access.canCreate || access.canEdit}
                          onSelect={() =>
                            setTarget({
                              employeeId: row.employeeId,
                              employeeName: row.employee.name,
                              cell,
                            })
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {isFetching && !isLoading && (
          <p className="px-5 pb-4 text-xs text-muted-foreground md:px-6">Refreshing…</p>
        )}
      </SectionCard>

      <GenerateRosterDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        defaultFrom={from}
        defaultTo={to}
      />

      <RosterCellDialog
        target={target}
        onOpenChange={(open) => !open && setTarget(null)}
        canDelete={access.canDelete}
      />
    </>
  );
}
