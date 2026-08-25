import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FieldValues } from "react-hook-form";
import type { BaseProps } from "./types";

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  className,
  ...props
}: BaseProps<TFieldValues> & {
  type?: string;
  disabled?: boolean;
  [key: string]: unknown;
}) {
  const { type = "text", ...inputProps } = props;
  const isNumber = type === "number";
  // Numbers are positive everywhere in this app; a caller can still pass its
  // own min (e.g. a negative one) to opt out of the sign guard.
  const min = isNumber ? ((inputProps.min as number | string | undefined) ?? 0) : undefined;
  const blockSigns = isNumber && Number(min) >= 0;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder ?? (isNumber ? "0" : undefined)}
              {...field}
              {...inputProps}
              {...(isNumber ? { min } : {})}
              // An untouched 0 (or empty) default renders as the placeholder,
              // so users never have to delete a pre-filled 0 before typing.
              value={
                isNumber && !fieldState.isDirty && (field.value === 0 || field.value == null)
                  ? ""
                  : field.value ?? ""
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (blockSigns && (e.key === "-" || e.key === "+" || e.key.toLowerCase() === "e")) {
                  e.preventDefault();
                }
                (inputProps as { onKeyDown?: React.KeyboardEventHandler<HTMLInputElement> }).onKeyDown?.(e);
              }}
              onChange={(e) => {
                if (!isNumber) {
                  field.onChange(e.target.value);
                  return;
                }
                const v = e.target.value;
                if (v === "") {
                  field.onChange("");
                  return;
                }
                const n = Number(v);
                // A pasted negative slips past the key guard — strip the sign.
                field.onChange(blockSigns && n < 0 ? Math.abs(n) : n);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
