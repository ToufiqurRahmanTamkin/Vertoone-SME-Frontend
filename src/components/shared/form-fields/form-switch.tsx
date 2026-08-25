import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { FieldValues } from "react-hook-form";
import type { BaseProps } from "./types";

export function FormSwitch<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled = false,
}: BaseProps<TFieldValues> & {
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card/50",
            className
          )}
        >
          <div className="space-y-0.5">
            <FormLabel className="text-sm font-medium cursor-pointer" htmlFor={name}>
              {label}
            </FormLabel>
            {description && <FormDescription className="text-xs">{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
