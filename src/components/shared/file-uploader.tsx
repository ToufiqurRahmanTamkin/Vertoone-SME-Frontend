import { FilePickerDialog } from "@/components/shared/file-picker-dialog";
import { ImageCropperDialog } from "@/components/shared/image-cropper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadManagedFileMutation } from "@/redux/apis/fileManagerApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { UploadFolder } from "@/types/domain/upload";
import { Crop, FolderOpen, ImageUp, Loader2, Trash2, UploadCloud } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
const DEFAULT_MAX_MB = 5;
const NON_CROPPABLE_TYPES = new Set(["image/svg+xml", "image/gif"]);

interface CropSource {
  url: string;
  name: string;
  type: string;
  isObjectUrl: boolean;
}

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
  cropAspect?: number;
  cropTitle?: string;
  cropDescription?: string;
  cropMaxWidth?: number;
}

export function FileUploader({
  value,
  onChange,
  label = "Image",
  description,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = DEFAULT_MAX_MB,
  disabled = false,
  className,
  previewClassName,
  cropAspect,
  cropTitle,
  cropDescription,
  cropMaxWidth,
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [cropSource, setCropSource] = React.useState<CropSource | null>(null);
  const [uploadFile, { isLoading: isUploading }] = useUploadManagedFileMutation();
  const busy = isUploading || disabled;

  const acceptedTypes = React.useMemo(
    () => accept.split(",").map((entry) => entry.trim()).filter(Boolean),
    [accept]
  );

  React.useEffect(() => {
    if (!cropSource?.isObjectUrl) return;
    const url = cropSource.url;
    return () => URL.revokeObjectURL(url);
  }, [cropSource]);

  const upload = async (file: File) => {
    try {
      const asset = await uploadFile({ file }).unwrap();
      onChange({ url: asset.url, publicId: asset.publicId });
      toast.success("File uploaded to your file manager");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not upload that file");
    }
  };

  const handleFile = async (file: File) => {
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      toast.error(`Unsupported file type: ${file.type || "unknown"}`);
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`That file is larger than ${maxSizeMb}MB`);
      return;
    }

    if (cropAspect && !NON_CROPPABLE_TYPES.has(file.type)) {
      setCropSource({
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        isObjectUrl: true,
      });
      return;
    }

    await upload(file);
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

  const onAdjust = () => {
    if (!value) return;
    setCropSource({ url: value, name: label || "image", type: "image/png", isObjectUrl: false });
  };

  const onCropped = (file: File) => {
    setCropSource(null);
    void upload(file);
  };

  const isWidePreview = Boolean(cropAspect && cropAspect > 1.5);

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
            onClick={() => onChange(null)}
            disabled={busy}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Remove
          </Button>
        )}
      </div>

      {value ? (
        <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
          <img
            src={value}
            alt={typeof label === "string" ? label : "Uploaded image"}
            className={cn(
              "shrink-0 rounded-md border bg-background",
              cropAspect
                ? cn("h-auto object-cover", isWidePreview ? "w-40" : "w-24")
                : "h-24 w-24 object-contain",
              previewClassName
            )}
            style={cropAspect ? { aspectRatio: String(cropAspect) } : undefined}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{value}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setPickerOpen(true)}
                disabled={busy}
              >
                <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                Browse files
              </Button>
              {cropAspect && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={onAdjust}
                  disabled={busy}
                >
                  <Crop className="mr-1.5 h-3.5 w-3.5" />
                  Reposition
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
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
              isDragging
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50 hover:bg-muted/40",
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

      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />

      <FilePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        accept={accept}
        maxSizeMb={maxSizeMb}
        title={typeof label === "string" ? `Choose ${label.toLowerCase()}` : "Choose a file"}
        onSelect={(files) => {
          const picked = files[0];
          if (picked) onChange({ url: picked.url, publicId: picked.publicId });
        }}
      />

      {cropAspect && (
        <ImageCropperDialog
          open={Boolean(cropSource)}
          src={cropSource?.url ?? null}
          aspect={cropAspect}
          fileName={cropSource?.name}
          mimeType={cropSource?.type}
          title={cropTitle ?? `Adjust ${label.toLowerCase()}`}
          description={cropDescription}
          maxOutputWidth={cropMaxWidth}
          maxOutputBytes={maxSizeMb * 1024 * 1024}
          onCancel={() => setCropSource(null)}
          onConfirm={onCropped}
        />
      )}
    </div>
  );
}
