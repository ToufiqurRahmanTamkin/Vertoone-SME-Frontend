import { FilePickerDialog } from "@/components/shared/file-picker-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadManagedFileMutation } from "@/redux/apis/fileManagerApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { formatFileSize, type DocumentFile } from "@/types/domain/document";
import type { UploadFolder } from "@/types/domain/upload";
import { FileText, FolderOpen, Loader2, Trash2, UploadCloud } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const DEFAULT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.zip,.txt,.csv,.md,.png,.jpg,.jpeg,.webp";

const LIBRARY_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/rtf",
  "application/zip",
  "text/plain",
  "text/csv",
  "text/markdown",
  "image/*",
].join(",");

const DEFAULT_MAX_MB = 25;

interface DocumentUploaderProps {
  value: DocumentFile | null;
  onChange: (file: DocumentFile | null) => void;
  folder?: UploadFolder;
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
}

export function DocumentUploader({
  value,
  onChange,
  label = "File",
  description = "PDF, Word, Excel, PowerPoint, text, CSV, zip or an image.",
  accept = DEFAULT_ACCEPT,
  maxSizeMb = DEFAULT_MAX_MB,
  disabled = false,
  className,
}: DocumentUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [uploadFile, { isLoading }] = useUploadManagedFileMutation();
  const busy = isLoading || disabled;

  const upload = async (file: File) => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`That file is larger than ${maxSizeMb} MB`);
      return;
    }

    try {
      const asset = await uploadFile({ file }).unwrap();
      onChange({
        url: asset.url,
        publicId: asset.publicId,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        extension: asset.extension,
        fileSize: asset.fileSize,
      });
      toast.success("File uploaded to your file manager");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not upload that file");
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (busy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-sm font-medium">{label}</p>

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/40">
            <FileText className="size-5 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.fileName}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono uppercase">{value.extension}</span>
              {" · "}
              {formatFileSize(value.fileSize)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 cursor-pointer text-destructive hover:text-destructive"
            aria-label="Remove the file"
            disabled={busy}
            onClick={() => onChange(null)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            role="button"
            tabIndex={0}
            aria-label="Choose a file to upload"
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !busy && inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (!busy) inputRef.current?.click();
              }
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center transition",
              isDragging ? "border-primary bg-primary/5" : "hover:bg-muted/40",
              busy && "pointer-events-none opacity-60"
            )}
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <UploadCloud className="size-5 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">
              {isLoading ? "Uploading..." : "Drop a file here, or click to choose one"}
            </p>
            <p className="text-xs text-muted-foreground">
              {description} Up to {maxSizeMb} MB.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full cursor-pointer"
            onClick={() => setPickerOpen(true)}
            disabled={busy}
          >
            <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
            Choose from your file manager
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />

      <FilePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        accept={LIBRARY_MIME_TYPES}
        maxSizeMb={maxSizeMb}
        title="Choose a file"
        onSelect={(files) => {
          const picked = files[0];
          if (!picked) return;
          onChange({
            url: picked.url,
            publicId: picked.publicId,
            fileName: picked.fileName,
            mimeType: picked.mimeType,
            extension: picked.extension,
            fileSize: picked.fileSize,
          });
        }}
      />
    </div>
  );
}
