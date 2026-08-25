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
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import type { FieldValues } from "react-hook-form";
import PhoneInputWithCountry, {
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
import type { BaseProps } from "./types";

/**
 * Regional-indicator emoji for an ISO country code — "BD" → 🇧🇩. Avoids pulling
 * a flag-sprite dependency in just for the picker.
 */
const flagEmoji = (code: string): string =>
  code
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

interface CountryOption {
  value?: Country;
  label: string;
  divider?: boolean;
}

interface CountrySelectProps {
  value?: Country;
  onChange: (country?: Country) => void;
  options: CountryOption[];
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * The country half of the phone control. `react-phone-number-input` owns the
 * value and hands us the option list; this only renders it in the app's own
 * popover/command styling instead of a bare <select>.
 */
function CountrySelect({ value, onChange, options, disabled, readOnly }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectable = React.useMemo(
    () => options.filter((option) => !option.divider && option.value),
    [options]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled || readOnly}>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-label="Select country calling code"
          aria-expanded={open}
          disabled={disabled || readOnly}
          className="h-9 shrink-0 gap-1 px-2 font-normal"
        >
          <span className="text-base leading-none">{value ? flagEmoji(value) : "🌐"}</span>
          <span className="text-sm tabular-nums">
            {value ? `+${getCountryCallingCode(value)}` : ""}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {selectable.map((option) => {
                const country = option.value as Country;
                const dial = `+${getCountryCallingCode(country)}`;
                return (
                  <CommandItem
                    // Searchable by name, ISO code and dial code.
                    value={`${option.label} ${country} ${dial}`}
                    key={country}
                    className={cn(value === country && "bg-primary/10")}
                    onSelect={() => {
                      onChange(country);
                      setOpen(false);
                    }}
                  >
                    <span className="text-base leading-none">{flagEmoji(country)}</span>
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {dial}
                    </span>
                    <Check
                      className={cn(
                        "ml-1 h-4 w-4 shrink-0",
                        value === country ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const PhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>((props, ref) => <Input {...props} ref={ref} className={cn("h-9", props.className)} />);
PhoneNumberInput.displayName = "PhoneNumberInput";

export function FormPhone<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "1711 223344",
  description,
  className,
  disabled = false,
  defaultCountry = "BD",
}: BaseProps<TFieldValues> & {
  disabled?: boolean;
  /** Country selected before the user picks one. Vertoone is BD-based. */
  defaultCountry?: Country;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <PhoneInputWithCountry
              // Stored as E.164 ("+8801711223344"), so the dial code travels
              // with the number and the backend needs no country column.
              international
              countryCallingCodeEditable={false}
              addInternationalOption={false}
              defaultCountry={defaultCountry}
              value={field.value ?? undefined}
              // An emptied input yields `undefined`; persist "" so the field
              // clears rather than being omitted from the payload.
              onChange={(value) => field.onChange(value ?? "")}
              onBlur={field.onBlur}
              disabled={disabled}
              countrySelectComponent={CountrySelect}
              inputComponent={PhoneNumberInput}
              placeholder={placeholder}
              className="flex items-center gap-2"
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
