import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportGroupBy, ReportRangeQuery } from "@/types/domain/report";
import { Download, Loader2, RotateCcw } from "lucide-react";
import * as React from "react";
import { PRESET_RANGES, presetRange } from "../report-period";

const GROUP_BY_OPTIONS: { label: string; value: ReportGroupBy }[] = [
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
];

interface ReportLayoutProps {
  title: string;
  description: string;
  range: ReportRangeQuery;
  onFilterChange: (name: string, value: string | number | undefined) => void;
  onReset: () => void;
  onExport?: () => void;
  isFetching?: boolean;
  showGroupBy?: boolean;
  currency?: string;
  periodLabel?: string;
  children: React.ReactNode;
}

export function ReportLayout({
  title,
  description,
  range,
  onFilterChange,
  onReset,
  onExport,
  isFetching = false,
  showGroupBy = true,
  currency,
  periodLabel,
  children,
}: ReportLayoutProps) {
  const applyPreset = (monthsBack: number) => {
    const preset = presetRange(monthsBack);
    onFilterChange("from", preset.from);
    onFilterChange("to", preset.to);
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          currency || onExport ? (
            <>
              {currency && <CurrencyNote currency={currency} />}
              {onExport && (
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={onExport}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                  ) : (
                    <Download className="mr-1.5 size-4" />
                  )}
                  Export CSV
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <DateRangePicker
          value={{ from: range.from, to: range.to }}
          onValueChange={(next) => {
            onFilterChange("from", next.from);
            onFilterChange("to", next.to);
          }}
          placeholder="All time"
          className="w-full sm:w-auto sm:min-w-[16rem]"
        />

        {showGroupBy && (
          <Select
            value={range.groupBy ?? "month"}
            onValueChange={(value) => onFilterChange("groupBy", value)}
          >
            <SelectTrigger className="w-full cursor-pointer sm:w-[8.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GROUP_BY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_RANGES.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              size="sm"
              className="h-8 cursor-pointer text-xs"
              onClick={() => applyPreset(preset.monthsBack)}
            >
              {preset.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 cursor-pointer gap-1.5 text-xs text-muted-foreground"
            onClick={onReset}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>

        {periodLabel && (
          <span className="text-xs text-muted-foreground sm:ml-auto">{periodLabel}</span>
        )}
      </div>

      {children}
    </>
  );
}
