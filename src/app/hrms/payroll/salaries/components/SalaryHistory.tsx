import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SALARY_CHANGE_LABELS } from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useGetEmployeeSalaryHistoryQuery } from "@/redux/apis/employeeSalaryApis";
import type { EmployeeSalaryRecord } from "@/types/domain/employeeSalary";
import { ChevronLeft, ChevronRight, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import * as React from "react";

const PAGE_SIZE = 5;

interface SalaryHistoryProps {
  employeeId: string;
  canDelete: boolean;
  onDelete: (record: EmployeeSalaryRecord) => void;
}

const changeTone = (record: EmployeeSalaryRecord): string => {
  if (record.changeType === "INCREMENT") return "text-emerald-600 dark:text-emerald-400";
  if (record.changeType === "DECREMENT") return "text-destructive";
  return "text-muted-foreground";
};

export function SalaryHistory({ employeeId, canDelete, onDelete }: SalaryHistoryProps) {
  const [page, setPage] = React.useState(1);

  const { data, isFetching } = useGetEmployeeSalaryHistoryQuery({
    employeeId,
    page,
    limit: PAGE_SIZE,
  });

  const records = data?.data ?? [];
  const meta = data?.meta;

  if (isFetching && records.length === 0) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
        No salary has been recorded for this employee yet.
      </p>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Effective from</th>
              <th className="px-3 py-2 text-left font-medium">Amount</th>
              <th className="px-3 py-2 text-left font-medium">Change</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Note</th>
              {canDelete && <th className="w-10 px-3 py-2" />}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record._id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatDate(record.effectiveFrom)}
                </td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  {formatAmount(record.amount, record.currency)}
                </td>
                <td className={cn("px-3 py-2 whitespace-nowrap", changeTone(record))}>
                  {record.changeAmount === null ? (
                    "—"
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      {record.changeAmount > 0 && <TrendingUp className="size-3.5" />}
                      {record.changeAmount < 0 && <TrendingDown className="size-3.5" />}
                      {formatAmount(Math.abs(record.changeAmount), record.currency)}
                      {record.changePercent !== null && (
                        <span className="text-xs">
                          ({record.changePercent > 0 ? "+" : ""}
                          {record.changePercent}%)
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="font-normal">
                    {SALARY_CHANGE_LABELS[record.changeType]}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{record.note || "—"}</td>
                {canDelete && (
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 cursor-pointer text-muted-foreground hover:text-destructive"
                      aria-label="Remove this record"
                      onClick={() => onDelete(record)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} revisions
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7 cursor-pointer"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((current) => current - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7 cursor-pointer"
              disabled={page >= meta.totalPages || isFetching}
              onClick={() => setPage((current) => current + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
