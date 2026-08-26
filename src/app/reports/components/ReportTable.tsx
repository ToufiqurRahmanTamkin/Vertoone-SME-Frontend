import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface ReportColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  className?: string;
  render: (row: T) => ReactNode;
  csv: (row: T) => string | number;
}

interface ReportTableProps<T> {
  columns: ReportColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  getRowId: (row: T) => string;
  emptyMessage?: string;
  footer?: ReactNode;
}

export function ReportTable<T>({
  columns,
  rows,
  isLoading = false,
  getRowId,
  emptyMessage = "No data for this period.",
  footer,
}: ReportTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "bg-background whitespace-nowrap",
                  column.align === "right" && "text-right",
                  column.className
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap",
                      column.align === "right" && "text-right tabular-nums"
                    )}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {footer && !isLoading && rows.length > 0 && <TableFooter>{footer}</TableFooter>}
      </Table>
    </div>
  );
}
