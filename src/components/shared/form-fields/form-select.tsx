import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import type { BaseProps } from "./types";

export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Select option",
  description,
  options,
  className,
  disabled = false,
  onValueChange,
  searchable,
  clearable = false,
  clearLabel = "Clear selection",
  emptyText = "No results found.",
  labelAction,
}: BaseProps<TFieldValues> & {
  options: { label: string; value: string }[];
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  searchable?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  emptyText?: string;
  labelAction?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const showSearch = searchable ?? options.length > 10;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("min-w-0", className)}>
          <div className="flex min-w-0 items-center gap-1">
            <FormLabel className="min-w-0">{label}</FormLabel>
            {labelAction}
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  <span className="min-w-0 truncate">
                    {field.value
                      ? options.find((option) => option.value === field.value)?.label
                      : placeholder}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                {showSearch && (
                  <CommandInput placeholder={`Search ${String(label).toLowerCase()}...`} />
                )}
                <CommandList>
                  <CommandEmpty>{emptyText}</CommandEmpty>
                  <CommandGroup>
                    {clearable && field.value && (
                      <CommandItem
                        value={clearLabel}
                        className="text-muted-foreground"
                        onSelect={() => {
                          field.onChange("");
                          onValueChange?.("");
                          setOpen(false);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        {clearLabel}
                      </CommandItem>
                    )}
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        className={cn(field.value === option.value && "bg-primary/10")}
                        onSelect={() => {
                          field.onChange(option.value);
                          onValueChange?.(option.value);
                          setOpen(false);
                        }}
                      >
                        {option.label}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            field.value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
