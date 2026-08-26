import { useQueryFilters } from "@/hooks/use-query-filters";
import type { ReportGroupBy, ReportRangeQuery } from "@/types/domain/report";
import * as React from "react";

export const useReportRange = (): {
  range: ReportRangeQuery;
  setFilter: (name: string, value: string | number | undefined) => void;
  clearFilters: () => void;
} => {
  const { filters, setFilter, clearFilters } = useQueryFilters();

  const range = React.useMemo<ReportRangeQuery>(
    () => ({
      from: (filters.from as string) || undefined,
      to: (filters.to as string) || undefined,
      groupBy: ((filters.groupBy as ReportGroupBy) || "month") as ReportGroupBy,
    }),
    [filters.from, filters.to, filters.groupBy]
  );

  return { range, setFilter, clearFilters };
};
