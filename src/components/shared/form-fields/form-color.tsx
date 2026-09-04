import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FieldValues } from "react-hook-form";
import type { BaseProps } from "./types";

export const COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#18181b",
] as const;

const normalize = (value: string): string => value.trim().toLowerCase();

export function FormColor<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled = false,
}: BaseProps<TFieldValues> & { disabled?: boolean }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = normalize(String(field.value ?? ""));

        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                className="h-9 w-12 shrink-0 cursor-pointer p-1 [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-sm [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm"
                value={/^#[0-9a-f]{6}$/.test(value) ? value : "#6366f1"}
                disabled={disabled}
                onChange={(event) => field.onChange(normalize(event.target.value))}
                tabIndex={-1}
              />
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="#6366f1"
                  maxLength={7}
                  disabled={disabled}
                  onChange={(event) => field.onChange(normalize(event.target.value))}
                />
              </FormControl>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-label={`Use ${preset}`}
                  aria-pressed={value === preset}
                  disabled={disabled}
                  onClick={() => field.onChange(preset)}
                  className={cn(
                    "h-6 w-6 cursor-pointer rounded-full border transition",
                    value === preset
                      ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                      : "hover:scale-110"
                  )}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
