import { formatDate } from "@/lib/date";
import type { ReportGroupBy } from "@/types/domain/report";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatPeriodLabel = (period: string, groupBy: ReportGroupBy): string => {
  if (groupBy === "month") {
    const [year, month] = period.split("-");
    const index = Number(month) - 1;
    return `${MONTH_LABELS[index] ?? month} ${String(year).slice(2)}`;
  }

  if (groupBy === "week") {
    const [year, week] = period.split("-");
    return `${week} ${String(year).slice(2)}`;
  }

  const [, month, day] = period.split("-");
  const index = Number(month) - 1;
  return `${day} ${MONTH_LABELS[index] ?? month}`;
};

export const PRESET_RANGES: { label: string; monthsBack: number }[] = [
  { label: "Last 3 months", monthsBack: 2 },
  { label: "Last 6 months", monthsBack: 5 },
  { label: "Last 12 months", monthsBack: 11 },
];

const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

export const presetRange = (monthsBack: number): { from: string; to: string } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  return { from: toIsoDate(start), to: toIsoDate(now) };
};

export const describePeriod = (from?: string, to?: string): string =>
  from || to ? `${formatDate(from)} — ${formatDate(to)}` : "";
