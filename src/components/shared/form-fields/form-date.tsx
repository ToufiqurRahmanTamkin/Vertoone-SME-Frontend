import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FieldValues } from "react-hook-form";
import type { BaseProps } from "./types";

export function FormDate<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Pick a date",
  description,
  className,
  disabled = false,
  includeTime = false,
  dateOnly = false,
  disableFuture = false,
  onDateChange,
}: BaseProps<TFieldValues> & {
  disabled?: boolean;
  includeTime?: boolean;
  disableFuture?: boolean;
  dateOnly?: boolean;
  onDateChange?: (date: Date | undefined) => void;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <DatePicker
              value={field.value}
              onValueChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
              includeTime={includeTime}
              dateOnly={dateOnly}
              disableFuture={disableFuture}
              onDateChange={onDateChange}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
