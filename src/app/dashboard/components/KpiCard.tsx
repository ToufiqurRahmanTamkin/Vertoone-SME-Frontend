import { percentLabel, trendOf } from "@/app/dashboard/dashboard-format";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Stat,
  StatDescription,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@/components/ui/stat";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

export type KpiColor = "default" | "success" | "info" | "warning" | "error";

export interface KpiCardProps {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  color?: KpiColor;
  changePercent?: number;
  changeLabel?: string;
  isLoading?: boolean;
}

export function KpiCard({
  label,
  value,
  description,
  icon: Icon,
  color = "default",
  changePercent,
  changeLabel,
  isLoading = false,
}: KpiCardProps) {
  const trend = changePercent === undefined ? undefined : trendOf(changePercent);

  return (
    <Stat>
      <StatLabel>{label}</StatLabel>
      {isLoading ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <StatValue className="truncate">{value}</StatValue>
      )}
      <StatIndicator variant="icon" color={color}>
        <Icon />
      </StatIndicator>
      {!isLoading && changePercent !== undefined && (
        <StatTrend trend={trend}>
          {trend === "down" ? <TrendingDown /> : <TrendingUp />}
          {percentLabel(changePercent)}
          <span className="font-normal text-muted-foreground">
            {changeLabel ?? "vs last month"}
          </span>
        </StatTrend>
      )}
      {!isLoading && description && <StatDescription>{description}</StatDescription>}
    </Stat>
  );
}
