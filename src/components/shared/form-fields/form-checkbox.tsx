import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { FieldValues } from "react-hook-form";
import type { BaseProps } from "./types";

export function FormCheckbox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  checkboxClassName,
  disabled = false,
}: BaseProps<TFieldValues> & {
  disabled?: boolean;
  /** Override the checkbox box styling (e.g. a brand-accent checked colour). */
  checkboxClassName?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-start space-x-2">
            <FormControl className="flex h-5 w-5 items-center justify-center">
              <Checkbox
                id={name}
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                className={checkboxClassName}
              />
            </FormControl>
            <label htmlFor={name} className="text-sm">
              {label}
            </label>
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
