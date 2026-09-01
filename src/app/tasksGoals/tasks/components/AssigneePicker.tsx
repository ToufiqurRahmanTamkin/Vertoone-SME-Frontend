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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useGetTaskAssigneeOptionsQuery } from "@/redux/apis/taskApis";
import {
  TASK_ASSIGNEE_KIND_LABELS,
  TASK_ASSIGNEE_KINDS,
  type TaskAssigneeKind,
  type TaskAssigneeOption,
} from "@/types/domain/task";
import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";

export interface AssigneeValue {
  kind: TaskAssigneeKind;
  refId: string;
}

const keyOf = (assignee: AssigneeValue): string => `${assignee.kind}:${assignee.refId}`;

interface AssigneePickerProps {
  value: AssigneeValue[];
  onChange: (next: AssigneeValue[]) => void;
  resolved?: TaskAssigneeOption[];
  disabled?: boolean;
  className?: string;
}

const NO_RESOLVED: TaskAssigneeOption[] = [];

export function AssigneePicker({
  value,
  onChange,
  resolved = NO_RESOLVED,
  disabled,
  className,
}: AssigneePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: options = [], isFetching } = useGetTaskAssigneeOptionsQuery({
    search: debouncedSearch || undefined,
  });

  const selectedKeys = React.useMemo(() => new Set(value.map(keyOf)), [value]);

  const [picked, setPicked] = React.useState<TaskAssigneeOption[]>([]);

  const known = React.useMemo(() => {
    const map = new Map<string, TaskAssigneeOption>();
    resolved.forEach((option) => map.set(keyOf(option), option));
    picked.forEach((option) => map.set(keyOf(option), option));
    options.forEach((option) => map.set(keyOf(option), option));
    return map;
  }, [resolved, picked, options]);

  const grouped = React.useMemo(() => {
    const byKind = new Map<TaskAssigneeKind, TaskAssigneeOption[]>();
    options.forEach((option) => {
      const bucket = byKind.get(option.kind) ?? [];
      bucket.push(option);
      byKind.set(option.kind, bucket);
    });
    return TASK_ASSIGNEE_KINDS.map((kind) => ({ kind, rows: byKind.get(kind) ?? [] })).filter(
      (group) => group.rows.length > 0
    );
  }, [options]);

  const toggle = (option: TaskAssigneeOption) => {
    const key = keyOf(option);

    if (selectedKeys.has(key)) {
      onChange(value.filter((assignee) => keyOf(assignee) !== key));
      return;
    }

    setPicked((current) =>
      current.some((row) => keyOf(row) === key) ? current : [...current, option]
    );
    onChange([...value, { kind: option.kind, refId: option.refId }]);
  };

  const remove = (assignee: AssigneeValue) => {
    onChange(value.filter((row) => keyOf(row) !== keyOf(assignee)));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full cursor-pointer justify-between font-normal"
          >
            {value.length > 0
              ? `${value.length} assigned`
              : "Assign employees, users, leads or contacts"}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(28rem,90vw)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search people..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isFetching ? "Searching..." : "Nobody matches that search."}
              </CommandEmpty>
              {grouped.map((group) => (
                <CommandGroup key={group.kind} heading={TASK_ASSIGNEE_KIND_LABELS[group.kind]}>
                  {group.rows.map((option) => {
                    const isSelected = selectedKeys.has(keyOf(option));

                    return (
                      <CommandItem
                        key={keyOf(option)}
                        value={keyOf(option)}
                        onSelect={() => toggle(option)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{option.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {option.subtitle}
                          </span>
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((assignee) => {
            const option = known.get(keyOf(assignee));

            return (
              <Badge key={keyOf(assignee)} variant="secondary" className="gap-1 pr-1">
                <span className="truncate">
                  {option?.name ?? TASK_ASSIGNEE_KIND_LABELS[assignee.kind]}
                </span>
                <span className="text-[10px] uppercase text-muted-foreground">
                  {TASK_ASSIGNEE_KIND_LABELS[assignee.kind]}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    aria-label={`Remove ${option?.name ?? "assignee"}`}
                    className="cursor-pointer rounded-full p-0.5 hover:bg-muted"
                    onClick={() => remove(assignee)}
                  >
                    <X className="size-3" />
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
