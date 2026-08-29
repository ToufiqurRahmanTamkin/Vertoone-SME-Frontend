import {
  IMPORT_COLUMNS,
  buildImportPreview,
  type ImportPreview,
  type NamedOption,
} from "@/app/hrms/people/employees/employee-import";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadCsv } from "@/lib/csv";
import { readSheetFile } from "@/lib/sheet";
import { cn } from "@/lib/utils";
import { useBulkCreateEmployeesMutation } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { BulkEmployeeResult } from "@/types/domain/employee";
import {
  CircleAlert,
  CircleCheck,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface EmployeeImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: NamedOption[];
  designations: NamedOption[];
}

const TEMPLATE_COLUMNS = IMPORT_COLUMNS.map((column) => ({
  key: column.header,
  label: column.required ? `${column.header} *` : column.header,
}));


export function EmployeeImportModal({
  open,
  onOpenChange,
  departments,
  designations,
}: EmployeeImportModalProps) {
  const [fileName, setFileName] = React.useState("");
  const [preview, setPreview] = React.useState<ImportPreview | null>(null);
  const [parseError, setParseError] = React.useState("");
  const [isParsing, setIsParsing] = React.useState(false);
  const [result, setResult] = React.useState<BulkEmployeeResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [bulkCreate, { isLoading }] = useBulkCreateEmployeesMutation();

  const reset = () => {
    setFileName("");
    setPreview(null);
    setParseError("");
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const downloadTemplate = () => {
    downloadCsv("employee-import-template", [], TEMPLATE_COLUMNS);
    toast.success("Template downloaded. Fill in one row per employee and upload it back.");
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setIsParsing(true);
    setParseError("");
    setResult(null);
    setFileName(file.name);

    try {
      const sheet = await readSheetFile(file);

      if (sheet.rows.length === 0) {
        setPreview(null);
        setParseError("That file has no data rows under the header");
        return;
      }

      setPreview(buildImportPreview(sheet.headers, sheet.rows, departments, designations));
    } catch (error: unknown) {
      setPreview(null);
      setParseError(error instanceof Error ? error.message : "Could not read that file");
    } finally {
      setIsParsing(false);
    }
  };

  const runImport = async () => {
    if (!preview || preview.ready.length === 0) return;

    try {
      const payloads = preview.ready.flatMap((row) => (row.payload ? [row.payload] : []));
      const outcome = await bulkCreate(payloads).unwrap();
      setResult(outcome);

      if (outcome.created > 0) {
        toast.success(`${outcome.created} employee${outcome.created === 1 ? "" : "s"} imported`);
      }
      if (outcome.failed > 0) {
        toast.error(`${outcome.failed} row${outcome.failed === 1 ? "" : "s"} could not be imported`);
      }
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "The import could not be completed");
    }
  };

  const readyCount = preview?.ready.length ?? 0;
  const rejectedCount = preview?.rejected.length ?? 0;
  const failedRows = result?.rows.filter((row) => row.error !== null) ?? [];

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import employees</DialogTitle>
          <DialogDescription>
            Upload a filled-in .xlsx or .csv sheet. Every row is checked here before anything is
            saved.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Start from the template</p>
              <p className="text-xs text-muted-foreground">
                Columns marked * are required. Departments and designations are matched by name and
                must already exist.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 cursor-pointer gap-2"
              onClick={downloadTemplate}
            >
              <Download className="size-4" />
              Download template
            </Button>
          </div>

          <details className="rounded-lg border">
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium">
              What each column expects
            </summary>
            <div className="max-h-56 overflow-auto border-t">
              <table className="w-full text-xs">
                <tbody>
                  {IMPORT_COLUMNS.map((column) => (
                    <tr key={column.header} className="border-b last:border-b-0">
                      <td className="w-1/3 px-3 py-1.5 font-medium">
                        {column.header}
                        {column.required && <span className="text-destructive"> *</span>}
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground">
                        {column.hint || "Optional free text"}
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground">{column.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          {!result && (
            <div>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv,text/csv"
                className="hidden"
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isParsing}
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-accent/40 disabled:cursor-wait"
              >
                {isParsing ? (
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                ) : (
                  <FileSpreadsheet className="size-6 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {fileName || "Choose a .xlsx or .csv file"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {fileName ? "Click to pick a different file" : "Up to 500 rows at a time"}
                </span>
              </button>
            </div>
          )}

          {parseError && (
            <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              {parseError}
            </p>
          )}

          {preview && preview.missingHeaders.length > 0 && (
            <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                These required columns are missing: {preview.missingHeaders.join(", ")}. Download
                the template and copy your data into it.
              </span>
            </p>
          )}

          {preview && preview.missingHeaders.length === 0 && !result && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <CircleCheck className="size-3" />
                  {readyCount} ready to import
                </Badge>
                {rejectedCount > 0 && (
                  <Badge variant="outline" className="gap-1.5 border-destructive/40 text-destructive">
                    <CircleAlert className="size-3" />
                    {rejectedCount} need fixing
                  </Badge>
                )}
              </div>

              <div className="max-h-64 overflow-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Row</th>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row) => (
                      <tr key={row.line} className="border-t align-top">
                        <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.line}</td>
                        <td className="px-3 py-2">{row.name || "—"}</td>
                        <td className="px-3 py-2 break-all text-muted-foreground">
                          {row.email || "—"}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2",
                            row.payload ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                          )}
                        >
                          {row.payload ? "Ready" : row.errors.join(". ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rejectedCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Rows that need fixing are skipped. Correct them in your sheet and import the file
                  again — already-imported people are rejected as duplicates, so nothing doubles up.
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <CircleCheck className="size-3" />
                  {result.created} imported
                </Badge>
                {result.failed > 0 && (
                  <Badge variant="outline" className="gap-1.5 border-destructive/40 text-destructive">
                    <X className="size-3" />
                    {result.failed} rejected
                  </Badge>
                )}
              </div>

              {failedRows.length > 0 && (
                <div className="max-h-64 space-y-2 overflow-auto rounded-lg border p-3">
                  {failedRows.map((row) => (
                    <p key={`${row.row}-${row.email}`} className="text-sm">
                      <span className="font-medium">{row.name || row.email}</span>
                      <span className="text-destructive"> — {row.error}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" className="cursor-pointer" onClick={() => close(false)}>
            {result ? "Done" : "Cancel"}
          </Button>
          {!result && (
            <Button
              type="button"
              className="cursor-pointer gap-2"
              onClick={runImport}
              disabled={readyCount === 0 || isLoading}
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {isLoading ? "Importing..." : `Import ${readyCount || ""} employees`.trim()}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
