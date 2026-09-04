import { FileUploader } from "@/components/shared/file-uploader";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { UploadFolder } from "@/types/domain/upload";
import type { FieldValues } from "react-hook-form";
import type { BaseProps } from "./types";

export function FormImage<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  folder,
  accept,
  maxSizeMb,
  disabled = false,
  cropAspect,
  previewClassName,
}: BaseProps<TFieldValues> & {
  folder?: UploadFolder;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  cropAspect?: number;
  previewClassName?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2", className)}>
          <FileUploader
            value={typeof field.value === "string" && field.value ? field.value : undefined}
            onChange={(asset) => field.onChange(asset?.url ?? "")}
            label={typeof label === "string" ? label : undefined}
            description={description}
            folder={folder}
            accept={accept}
            maxSizeMb={maxSizeMb}
            disabled={disabled}
            cropAspect={cropAspect}
            previewClassName={previewClassName}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
