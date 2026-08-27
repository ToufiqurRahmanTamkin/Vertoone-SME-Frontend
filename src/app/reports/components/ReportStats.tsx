import { Skeleton } from "@/components/ui/skeleton";
import {
  Stat,
  StatDescription,
  StatGrid,
  StatIndicator,
  StatLabel,
  StatValue,
} from "@/components/ui/stat";
import type { LucideIcon } from "lucide-react";

export interface ReportStatItem {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  color?: "default" | "success" | "info" | "warning" | "error";
}

interface ReportStatsProps {
  items: ReportStatItem[];
  isLoading?: boolean;
}

export function ReportStats({ items, isLoading = false }: ReportStatsProps) {
  return (
    <StatGrid className="xl:grid-cols-4">
      {items.map((item) => (
        <Stat key={item.label}>
          <StatLabel>{item.label}</StatLabel>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <StatValue className="truncate">{item.value}</StatValue>
          )}
          <StatIndicator variant="icon" color={item.color ?? "default"}>
            <item.icon />
          </StatIndicator>
          {!isLoading && item.description && <StatDescription>{item.description}</StatDescription>}
        </Stat>
      ))}
    </StatGrid>
  );
}
