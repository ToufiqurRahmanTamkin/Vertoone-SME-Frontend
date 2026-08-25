import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { FieldValues } from "react-hook-form";
import type { BaseProps } from "./types";

export function FormTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  className,
  showCharCount = true,
  disabled = false,
  ...props
}: BaseProps<TFieldValues> & {
  showCharCount?: boolean;
  disabled?: boolean;
  [key: string]: unknown;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-center justify-between">
            <FormLabel>{label}</FormLabel>
            {showCharCount && (
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {String(field.value || "").length} characters
              </span>
            )}
          </div>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="resize-none min-h-25"
              disabled={disabled}
              {...field}
              {...props}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
