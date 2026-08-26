import type { ReportColumn } from "./components/ReportTable";

export const reportCsvColumns = <T,>(columns: ReportColumn<T>[]) =>
  columns.map((column) => ({ key: column.key, label: column.label }));

export const toCsvRows = <T,>(rows: T[], columns: ReportColumn<T>[]) =>
  rows.map((row) =>
    columns.reduce<Record<string, string | number>>((acc, column) => {
      acc[column.key] = column.csv(row);
      return acc;
    }, {})
  );
