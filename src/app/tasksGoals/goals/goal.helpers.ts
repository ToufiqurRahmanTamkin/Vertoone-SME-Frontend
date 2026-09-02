import type { GoalMetricType } from "@/types/domain/goal";

export const formatMetricValue = (
  value: number,
  metricType: GoalMetricType,
  unit: string
): string => {
  const rounded = Number.isInteger(value) ? value : Number(value.toFixed(2));
  const formatted = rounded.toLocaleString();

  if (metricType === "PERCENT") return `${formatted}%`;
  if (metricType === "CURRENCY") return unit ? `${unit} ${formatted}` : formatted;
  return unit ? `${formatted} ${unit}` : formatted;
};

export const describeMetric = (
  currentValue: number,
  targetValue: number,
  metricType: GoalMetricType,
  unit: string
): string =>
  `${formatMetricValue(currentValue, metricType, unit)} of ${formatMetricValue(
    targetValue,
    metricType,
    unit
  )}`;

export const progressBarClass = (progress: number, isOverdue: boolean): string => {
  if (progress >= 100) return "bg-emerald-500";
  if (isOverdue) return "bg-red-500";
  if (progress >= 60) return "bg-blue-500";
  if (progress >= 30) return "bg-amber-500";
  return "bg-zinc-400";
};
