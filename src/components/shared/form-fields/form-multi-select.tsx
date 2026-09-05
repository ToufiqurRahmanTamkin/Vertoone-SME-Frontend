import { Badge } from "@/components/ui/badge";
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

export interface MultiSelectOption {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}

export function FormMultiSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Select options",
  description,
  options,
  className,
  disabled = false,
  searchable,
  emptyText = "No results found.",
  maxVisible = 6,
  labelAction,
}: BaseProps<TFieldValues> & {
  options: MultiSelectOption[];
  disabled?: boolean;
  searchable?: boolean;
  emptyText?: string;
  maxVisible?: number;
  labelAction?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const showSearch = searchable ?? options.length > 8;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = Array.isArray(field.value) ? field.value : [];
        const selectedOptions = selected
          .map((value) => options.find((option) => option.value === value))
          .filter((option): option is MultiSelectOption => Boolean(option));

        const toggle = (value: string) => {
          const next = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value];
          field.onChange(next);
        };

        return (
          <FormItem className={cn("min-w-0", className)}>
            <div className="flex min-w-0 items-center gap-1">
              <FormLabel className="min-w-0">{label}</FormLabel>
              {labelAction}
            </div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild disabled={disabled}>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "h-auto min-h-9 w-full justify-between gap-2 py-1.5 font-normal",
                      selected.length === 0 && "text-muted-foreground"
                    )}
                    disabled={disabled}
                  >
                    <span className="flex min-w-0 flex-wrap items-center gap-1">
                      {selectedOptions.length === 0 && <span>{placeholder}</span>}
                      {selectedOptions.slice(0, maxVisible).map((option) => (
                        <Badge
                          key={option.value}
                          variant="secondary"
                          className="max-w-[12rem] gap-1 text-[11px]"
                          style={
                            option.color
                              ? {
                                  backgroundColor: `${option.color}1a`,
                                  color: option.color,
                                }
                              : undefined
                          }
                        >
                          <span className="truncate">{option.label}</span>
                          <span
                            role="button"
                            tabIndex={-1}
                            aria-label={`Remove ${option.label}`}
                            className="cursor-pointer opacity-60 hover:opacity-100"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              toggle(option.value);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </Badge>
                      ))}
                      {selectedOptions.length > maxVisible && (
                        <span className="text-xs text-muted-foreground">
                          +{selectedOptions.length - maxVisible} more
                        </span>
                      )}
                    </span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
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
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={`${option.label} ${option.hint ?? ""}`}
                          className={cn(selected.includes(option.value) && "bg-primary/10")}
                          onSelect={() => toggle(option.value)}
                        >
                          {option.color && (
                            <span
                              className="mr-1 h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: option.color }}
                              aria-hidden
                            />
                          )}
                          <span className="min-w-0 flex-1 truncate">{option.label}</span>
                          {option.hint && (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {option.hint}
                            </span>
                          )}
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0",
                              selected.includes(option.value) ? "opacity-100" : "opacity-0"
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
        );
      }}
    />
  );
}
