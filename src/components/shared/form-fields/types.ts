import type { Control, FieldPath, FieldValues } from "react-hook-form";

export interface BaseProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string | React.ReactNode;
  placeholder?: string;
  description?: string;
  className?: string;
}
