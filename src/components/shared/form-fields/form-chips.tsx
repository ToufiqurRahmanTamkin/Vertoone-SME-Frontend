import { Badge } from "@/components/ui/badge";
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
import { X } from "lucide-react";
import * as React from "react";
import type { FieldValues } from "react-hook-form";
import type { BaseProps } from "./types";

export function FormChips<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Type and press Enter",
  description,
  className,
  disabled = false,
  max = 25,
  maxLength = 60,
}: BaseProps<TFieldValues> & {
  disabled?: boolean;
  max?: number;
  maxLength?: number;
}) {
  const [draft, setDraft] = React.useState("");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const values: string[] = Array.isArray(field.value) ? field.value : [];

        const add = (raw: string) => {
          const entry = raw.trim().slice(0, maxLength);
          if (!entry || values.length >= max) return;
          if (values.some((value) => value.toLowerCase() === entry.toLowerCase())) {
            setDraft("");
            return;
          }
          field.onChange([...values, entry]);
          setDraft("");
        };

        const remove = (entry: string) =>
          field.onChange(values.filter((value) => value !== entry));

        const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add(draft);
            return;
          }
          if (event.key === "Backspace" && !draft && values.length > 0) {
            remove(values[values.length - 1]);
          }
        };

        return (
          <FormItem className={cn("space-y-2", className)}>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <FormControl>
              <Input
                id={name}
                value={draft}
                disabled={disabled || values.length >= max}
                placeholder={values.length >= max ? `Up to ${max} entries` : placeholder}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={() => add(draft)}
              />
            </FormControl>

            {values.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {values.map((entry) => (
                  <Badge key={entry} variant="secondary" className="gap-1 py-1 text-xs">
                    {entry}
                    <button
                      type="button"
                      className="cursor-pointer"
                      aria-label={`Remove ${entry}`}
                      disabled={disabled}
                      onClick={() => remove(entry)}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {description && <FormDescription className="text-xs">{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
