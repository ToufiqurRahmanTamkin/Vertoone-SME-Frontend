import { Checkbox } from "@/components/ui/checkbox";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetAppModulesQuery } from "@/redux/apis/appModuleApis";
import { Boxes } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";

interface PlanModulesFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  className?: string;
}

export function PlanModulesField<TFieldValues extends FieldValues>({
  control,
  name,
  className,
}: PlanModulesFieldProps<TFieldValues>) {
  const { data, isLoading } = useGetAppModulesQuery({ limit: 100, isActive: true as never });
  const modules = data?.data ?? [];

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = Array.isArray(field.value) ? field.value : [];
        const toggle = (id: string) =>
          field.onChange(
            selected.includes(id) ? selected.filter((entry) => entry !== id) : [...selected, id]
          );

        return (
          <FormItem className={className}>
            <div className="flex items-center justify-between">
              <FormLabel>Modules</FormLabel>
              {selected.length > 0 && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {selected.length} selected
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
              </div>
            ) : modules.length === 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-4 text-xs text-muted-foreground">
                <Boxes className="h-4 w-4 shrink-0" />
                No active modules yet. Create them under Modules first.
              </div>
            ) : (
              <div className="grid max-h-44 gap-1.5 overflow-y-auto rounded-md border p-2 sm:grid-cols-2">
                {modules.map((entry) => {
                  const checked = selected.includes(entry._id);
                  return (
                    <label
                      key={entry._id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        checked ? "bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(entry._id)}
                        aria-label={entry.name}
                      />
                      {entry.icon && (
                        <img src={entry.icon} alt="" className="h-4 w-4 shrink-0 object-contain" />
                      )}
                      <span className="min-w-0 truncate">{entry.name}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <FormDescription>
              Everyone who buys this plan is granted these modules.
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
