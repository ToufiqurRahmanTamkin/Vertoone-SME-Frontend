import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilePickerDialog } from "@/components/shared/file-picker-dialog";
import { useUploadManagedFileMutation } from "@/redux/apis/fileManagerApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { FolderOpen, ImageUp, Loader2, Trash2, UserRound } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE_MB = 5;

export interface AvatarUploaderProps {
  value?: string | null;
  publicId?: string | null;
  fallback?: string;
  disabled?: boolean;
  onChange: (asset: { url: string; publicId: string } | null) => Promise<void> | void;
  className?: string;
}

export function AvatarUploader({
  value,
  fallback,
  disabled = false,
  onChange,
  className,
}: AvatarUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [uploadFile, { isLoading: isUploading }] = useUploadManagedFileMutation();
  const busy = isUploading || disabled;

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Pick a PNG, JPG or WEBP image");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`That image is larger than ${MAX_SIZE_MB}MB`);
      return;
    }

    try {
      const asset = await uploadFile({ file }).unwrap();
      await onChange({ url: asset.url, publicId: asset.publicId });
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not upload that image");
    }
  };

  const handleRemove = async () => {
    try {
      await onChange(null);
    } catch {
      toast.error("Could not remove the photo");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-dashed p-5 text-center transition-colors sm:flex-row sm:items-center sm:text-left",
        isDragging && "border-primary bg-primary/5",
        busy && "opacity-70",
        className
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!busy) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (busy) return;
        const file = event.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
    >
      <button
        type="button"
        aria-label={value ? "Replace profile photo" : "Upload profile photo"}
        onClick={() => !busy && inputRef.current?.click()}
        disabled={busy}
        className="group relative shrink-0 cursor-pointer rounded-full focus-visible:outline-none"
      >
        <Avatar className="border-background ring-border size-24 border-4 shadow-sm ring-1">
          {value ? <AvatarImage src={value} alt="Profile photo" className="object-cover" /> : null}
          <AvatarFallback className="from-primary via-primary/80 to-primary/60 text-primary-foreground bg-linear-to-br text-xl font-bold">
            {fallback || <UserRound className="size-8" />}
          </AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImageUp className="size-5" />
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium">Profile photo</p>
          <p className="text-muted-foreground text-xs">
            PNG, JPG or WEBP up to {MAX_SIZE_MB}MB. A square image looks best.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {isUploading ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <ImageUp className="mr-1.5 size-3.5" />
            )}
            {value ? "Replace" : "Upload photo"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setPickerOpen(true)}
            disabled={busy}
          >
            <FolderOpen className="mr-1.5 size-3.5" />
            Browse files
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive cursor-pointer"
              onClick={() => void handleRemove()}
              disabled={busy}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleFile(file);
        }}
      />

      <FilePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        accept={ACCEPTED_TYPES.join(",")}
        maxSizeMb={MAX_SIZE_MB}
        title="Choose a profile photo"
        onSelect={(files) => {
          const picked = files[0];
          if (picked) void onChange({ url: picked.url, publicId: picked.publicId });
        }}
      />
    </div>
  );
}

export default AvatarUploader;
