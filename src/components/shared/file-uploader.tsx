import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { useDeleteUploadMutation, useUploadImageMutation } from "@/redux/apis/uploadApis";
import type { UploadFolder, UploadedAsset } from "@/types/domain/upload";
import { ImageUp, Loader2, Trash2, UploadCloud } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
const DEFAULT_MAX_MB = 5;

export interface FileUploaderProps {
  value?: string;
  publicId?: string;
  onChange: (asset: { url: string; publicId: string } | null) => void;
  folder?: UploadFolder;
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
  previewClassName?: string;
}

export function FileUploader({
  value,
  publicId,
  onChange,
  folder = "general",
  label = "Image",
  description,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = DEFAULT_MAX_MB,
  disabled = false,
  className,
  previewClassName,
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [deleteUpload, { isLoading: isDeleting }] = useDeleteUploadMutation();
  const busy = isUploading || isDeleting || disabled;

  const acceptedTypes = React.useMemo(
    () => accept.split(",").map((entry) => entry.trim()).filter(Boolean),
    [accept]
  );

  const handleFile = async (file: File) => {
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      toast.error(`Unsupported file type: ${file.type || "unknown"}`);
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`That file is larger than ${maxSizeMb}MB`);
      return;
    }

    try {
      const asset: UploadedAsset = await uploadImage({ file, folder }).unwrap();
      onChange({ url: asset.url, publicId: asset.publicId });
      toast.success("File uploaded");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not upload that file");
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleFile(file);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (busy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const onRemove = async () => {
    if (publicId) {
      await deleteUpload(publicId)
        .unwrap()
        .catch(() => undefined);
    }
    onChange(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 cursor-pointer text-destructive hover:text-destructive"
            onClick={() => void onRemove()}
            disabled={busy}
          >
            {isDeleting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Remove
          </Button>
        )}
      </div>

      {value ? (
        <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
          <img
            src={value}
            alt={typeof label === "string" ? label : "Uploaded image"}
            className={cn("h-24 w-24 rounded-md border bg-background object-contain", previewClassName)}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{value}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 cursor-pointer"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {isUploading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImageUp className="mr-1.5 h-3.5 w-3.5" />
              )}
              Replace
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (!busy) inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
            isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/40",
            busy && "pointer-events-none opacity-60"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-muted-foreground">Up to {maxSizeMb}MB</p>
        </div>
      )}

      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
