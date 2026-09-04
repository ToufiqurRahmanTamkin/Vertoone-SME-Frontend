import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRY_OPTIONS } from "@/constant/locale";
import {
  useGetCountryHolidaysQuery,
  useImportCountryHolidaysMutation,
} from "@/redux/apis/holidayApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  HOLIDAY_TYPE_LABELS,
  type CountryHolidaySuggestion,
} from "@/types/domain/holiday";
import { Bot, CalendarDays, Loader2, Sparkles } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface ImportCountryHolidaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
}

const formatDay = (value: string): string =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

export function ImportCountryHolidaysDialog({
  open,
  onOpenChange,
  year,
}: ImportCountryHolidaysDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <ImportBody key={year} onOpenChange={onOpenChange} year={year} />}
    </Dialog>
  );
}

function ImportBody({
  onOpenChange,
  year,
}: {
  onOpenChange: (open: boolean) => void;
  year: number;
}) {
  const [country, setCountry] = React.useState("");
  const [picked, setPicked] = React.useState<Record<string, boolean>>({});
  const [touched, setTouched] = React.useState(false);

  const { data, isFetching, error } = useGetCountryHolidaysQuery({
    year,
    country: country || undefined,
  });

  const [importHolidays, { isLoading: isImporting }] = useImportCountryHolidaysMutation();

  const suggestions = React.useMemo(() => data?.suggestions ?? [], [data]);

  const isSelected = (entry: CountryHolidaySuggestion): boolean =>
    touched ? Boolean(picked[entry.date + entry.name]) : !entry.alreadyAdded;

  const toggle = (entry: CountryHolidaySuggestion) => {
    const key = entry.date + entry.name;
    const base = touched
      ? picked
      : Object.fromEntries(
          suggestions.map((row) => [row.date + row.name, !row.alreadyAdded])
        );
    setTouched(true);
    setPicked({ ...base, [key]: !base[key] });
  };

  const setAll = (value: boolean) => {
    setTouched(true);
    setPicked(
      Object.fromEntries(
        suggestions.map((row) => [row.date + row.name, value && !row.alreadyAdded])
      )
    );
  };

  const chosen = suggestions.filter((entry) => isSelected(entry) && !entry.alreadyAdded);

  const onSubmit = async () => {
    if (chosen.length === 0) return;
    try {
      const created = await importHolidays({
        year,
        country: data?.countryCode,
        holidays: chosen.map((entry) => ({
          name: entry.name,
          description: entry.description,
          date: entry.date,
          endDate: entry.endDate,
          type: entry.type,
          isRecurringYearly: entry.isRecurringYearly,
          isOptional: entry.isOptional,
        })),
      }).unwrap();

      toast.success(
        created.length > 0
          ? `${created.length} holiday${created.length === 1 ? "" : "s"} added`
          : "Those holidays were already on the calendar"
      );
      onOpenChange(false);
    } catch (importError: unknown) {
      const err = importError as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not import those holidays");
    }
  };

  const message = (error as ApiErrorResponse | undefined)?.data?.message;

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Import {year} holidays</DialogTitle>
        <DialogDescription>
          The public holidays observed in your country that year. Untick anything your company
          does not close for.
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label>Country</Label>
            <Select
              value={country || data?.countryCode || ""}
              onValueChange={(value) => {
                setCountry(value);
                setTouched(false);
                setPicked({});
              }}
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Your company country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data && (
            <Badge variant="secondary" className="gap-1.5 self-start sm:self-end sm:mb-2">
              {data.source === "AI" ? (
                <>
                  <Bot className="size-3" />
                  Drafted by AI
                </>
              ) : (
                <>
                  <CalendarDays className="size-3" />
                  Public holiday calendar
                </>
              )}
            </Badge>
          )}
        </div>

        {data?.source === "AI" && (
          <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
            No published calendar covers {data.country}, so these were drafted by AI. Check the
            dates before you import them.
          </p>
        )}

        {isFetching ? (
          <div className="flex h-56 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : message ? (
          <p className="flex h-56 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {message}
          </p>
        ) : suggestions.length === 0 ? (
          <p className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            Nothing found for {data?.country ?? "that country"} in {year}
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {chosen.length} of {suggestions.length} selected
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 cursor-pointer text-xs"
                  onClick={() => setAll(true)}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 cursor-pointer text-xs"
                  onClick={() => setAll(false)}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
              {suggestions.map((entry) => (
                <label
                  key={entry.date + entry.name}
                  className={`flex items-center gap-3 rounded-md border p-2.5 transition ${
                    entry.alreadyAdded
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-muted/40"
                  }`}
                >
                  <Checkbox
                    checked={isSelected(entry)}
                    disabled={entry.alreadyAdded}
                    onCheckedChange={() => toggle(entry)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{entry.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatDay(entry.date)}
                      {entry.endDate !== entry.date && ` – ${formatDay(entry.endDate)}`}
                      {entry.localName && entry.localName !== entry.name && ` · ${entry.localName}`}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-1">
                    {entry.alreadyAdded && (
                      <Badge variant="outline" className="text-[10px]">
                        Added
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      {HOLIDAY_TYPE_LABELS[entry.type]}
                    </Badge>
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </DialogBody>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="cursor-pointer"
          disabled={chosen.length === 0 || isImporting || isFetching}
          onClick={() => void onSubmit()}
        >
          {isImporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Import {chosen.length > 0 ? chosen.length : ""}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
