import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/**
 * Thin react-hook-form wrappers around the shadcn primitives. They exist so
 * every form in the app renders labels, descriptions and validation messages
 * identically without repeating the FormField render-prop dance.
 */
interface BaseFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormInput<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
  type = "text",
}: BaseFieldProps<TValues> & { type?: React.HTMLInputTypeAttribute }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              // A number input must hand RHF a number, not the string the DOM
              // gives us, or zod's number schema rejects every keystroke.
              value={field.value ?? ""}
              onChange={(event) =>
                field.onChange(
                  type === "number"
                    ? event.target.value === ""
                      ? undefined
                      : Number(event.target.value)
                    : event.target.value
                )
              }
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function FormPassword<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
}: BaseFieldProps<TValues>) {
  const [visible, setVisible] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={visible ? "text" : "password"}
                placeholder={placeholder}
                disabled={disabled}
                className="pr-10"
                value={field.value ?? ""}
              />
              <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label={visible ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function FormTextarea<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
  rows = 4,
}: BaseFieldProps<TValues> & { rows?: number }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              {...field}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
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

export interface SelectOption {
  label: string;
  value: string;
}

export function FormSelect<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Select an option",
  disabled,
  className,
  options,
}: BaseFieldProps<TValues> & { options: SelectOption[] }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            onValueChange={field.onChange}
            value={field.value ?? ""}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function FormSwitch<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
}: BaseFieldProps<TValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={`flex flex-row items-center justify-between gap-4 rounded-lg border p-3 ${className ?? ""}`}
        >
          <div className="space-y-0.5">
            {label && <FormLabel className="cursor-pointer">{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
