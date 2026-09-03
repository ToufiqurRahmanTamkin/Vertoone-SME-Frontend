"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import { Fragment, type ReactNode, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination.tsx";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
  }
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  mobileCard?: (row: TData) => ReactNode;
  expandableContent?: (row: TData) => ReactNode;
  getRowId?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  fixedLayout?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  onLimitChange,
  mobileCard,
  expandableContent,
  getRowId,
  onRowClick,
  fixedLayout = false,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const showPagination = pagination && pagination.total > 10 && onPageChange && onLimitChange;

  return (
    <div className="space-y-4">
      <div className={mobileCard ? "hidden md:block" : undefined}>
        <div className="overflow-x-auto rounded-xl border">
          <table
            data-slot="table"
            className={cn("w-full caption-bottom text-sm", fixedLayout && "table-fixed")}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn("bg-background", header.column.columnDef.meta?.headerClassName)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={`loading-${rowIndex}`}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={`loading-${rowIndex}-${colIndex}`}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const rowId = getRowId ? getRowId(row.original) : row.id;
                  const isExpanded = expandableContent && expandedRows.has(rowId);
                  return (
                    <Fragment key={row.id}>
                      <TableRow
                        className={
                          expandableContent || onRowClick
                            ? "cursor-pointer hover:bg-muted/50"
                            : undefined
                        }
                        data-state={row.getIsSelected() && "selected"}
                        onClick={() => {
                          if (expandableContent) toggleRow(rowId);
                          onRowClick?.(row.original);
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cell.column.columnDef.meta?.cellClassName}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={columns.length} className="py-3">
                            {expandableContent(row.original)}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </div>

      {mobileCard && (
        <div className="md:hidden space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-xl border p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : data.length > 0 ? (
            data.map((row, i) => <div key={i}>{mobileCard(row)}</div>)
          ) : (
            <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
              No results.
            </div>
          )}
        </div>
      )}

      {showPagination && (
        <DataTablePagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          pages={pagination.pages}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}
