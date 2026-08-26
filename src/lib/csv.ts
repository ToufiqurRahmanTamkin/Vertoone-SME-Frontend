export interface CsvColumn<T> {
  key: keyof T & string;
  label: string;
}

const escapeCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = <T extends Record<string, unknown>>(
  rows: T[],
  columns: CsvColumn<T>[]
): string =>
  [
    columns.map((column) => escapeCell(column.label)).join(","),
    ...rows.map((row) => columns.map((column) => escapeCell(row[column.key])).join(",")),
  ].join("\n");

export const downloadCsv = <T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
): void => {
  const blob = new Blob([`\uFEFF${toCsv(rows, columns)}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
