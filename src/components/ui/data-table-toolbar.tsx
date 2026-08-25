import { Button } from "@/components/ui/button";
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type FilterFieldType = "text" | "select" | "date" | "date-range";

export interface FilterConfig {
  name: string;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  /**
   * Select-only: option value treated as "unset" (stored as undefined).
   * Defaults to "all" — set when the neutral state has its own meaning,
   * e.g. the sessions payment filter defaulting to "unpaid".
   */
  defaultValue?: string;
  /** Select-only: hide the auto "All {label}" option when `options` already cover every state. */
  hideAllOption?: boolean;
  /** Select-only: extra classes for the inline (non-drawer) trigger, e.g. a wider desktop width. */
  triggerClassName?: string;
}

export type FilterValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { from?: string; to?: string };

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  currentFilters: Record<string, string | number | boolean | undefined>;
  onFilterChange: (name: string, value: string | number | undefined) => void;
  onClear: () => void;
  isLoading?: boolean;
  /**
   * Primary page action(s) (e.g. Create / Add / Upload). Rendered on the
   * opposite side of the filters (`justify-between`) on the same row.
   */
  actions?: React.ReactNode;
  /**
   * Mobile (<sm) filter presentation. "drawer" (default) collapses the
   * filters behind a funnel icon that opens a bottom sheet with one labeled
   * row per filter; "inline" keeps them on the toolbar row — use it for
   * pages with a single compact select.
   */
  mobileFilters?: "drawer" | "inline";
  /**
   * Extra content rendered inside the mobile filter drawer (below the
   * filters, above the footer). Use for secondary admin actions that would
   * crowd the toolbar row on mobile. When provided, the funnel trigger shows
   * even if there are no filters.
   */
  mobileDrawerExtra?: React.ReactNode;
  /** Heading shown at the top of the mobile drawer. Defaults to "Filters". */
  mobileDrawerTitle?: string;
}

export function DataTableToolbar({
  searchValue = "",
  onSearchChange = () => {},
  searchPlaceholder = "Search...",
  filters = [],
  currentFilters = {},
  onFilterChange = () => {},
  onClear = () => {},
  isLoading = false,
  actions,
  mobileFilters = "drawer",
  mobileDrawerExtra,
  mobileDrawerTitle = "Filters",
}: DataTableToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue || "");
  const [prevSearchValue, setPrevSearchValue] = useState(searchValue);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Mobile drawer staging: changes inside the drawer are held here and only
  // committed to the URL/API when the user taps "Done". Closing via the overlay
  // or Escape discards them (re-snapshotted from the applied filters on reopen).
  const [pendingFilters, setPendingFilters] = useState<
    Record<string, string | number | boolean | undefined>
  >({});
  const drawerRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const setPendingFilter = (name: string, value: string | number | undefined) => {
    setPendingFilters((prev) => ({ ...prev, [name]: value === "" ? undefined : value }));
  };

  const openDrawer = () => {
    // Snapshot the currently applied filters so the drawer starts from them.
    setPendingFilters({ ...currentFilters });
    setIsDrawerOpen(true);
  };

  // Every query param a filter control owns — a date range spans from/to, so it
  // contributes two keys rather than one.
  const filterParamKeys = filters.flatMap((f) =>
    f.type === "date-range" ? ["from", "to"] : [f.name]
  );

  const applyPendingAndClose = () => {
    filterParamKeys.forEach((key) => {
      const next = pendingFilters[key];
      const normalizedNext = next === "" ? undefined : next;
      const current = currentFilters[key];
      const normalizedCurrent = current === "" ? undefined : current;
      if (normalizedNext !== normalizedCurrent) {
        onFilterChange(key, normalizedNext as string | number | undefined);
      }
    });
    setIsDrawerOpen(false);
  };

  const hasPendingFilters = filterParamKeys.some((key) => {
    const v = pendingFilters[key];
    return v !== "" && v !== "all" && v !== undefined;
  });

  // While the mobile filter drawer is open: lock body scroll, close on Escape,
  // and move focus into the drawer (restored on close) — the behaviors the
  // modal Sheet used to provide.
  useEffect(() => {
    if (!isDrawerOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    drawerRef.current?.focus({ preventScroll: true });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus({ preventScroll: true });
    };
  }, [isDrawerOpen]);

  if (searchValue !== prevSearchValue) {
    setLocalSearch(searchValue || "");
    setPrevSearchValue(searchValue);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (searchValue || "")) {
        onSearchChange(localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchValue]);

  const activeFilterKeys = Object.entries(currentFilters)
    .filter(([key, v]) => {
      if (["page", "limit", "skip", "sort", "search"].includes(key)) return false;
      return v !== "" && v !== "all" && v !== undefined;
    })
    .map(([key]) => key);
  // A date range sets both `from` and `to` but is a single filter to the user.
  const activeFilterCount =
    activeFilterKeys.length -
    (activeFilterKeys.includes("from") && activeFilterKeys.includes("to") ? 1 : 0);

  const hasActiveFilters = (searchValue && searchValue !== "") || activeFilterKeys.length > 0;

  const handleClear = () => {
    setLocalSearch("");
    onClear();
  };

  /** One filter control; drawer rows stretch full width, toolbar ones stay compact. */
  const renderFilter = (filter: FilterConfig, inDrawer: boolean) => {
    // In the drawer, controls read from / write to the staged `pendingFilters`
    // so nothing hits the API until "Done". Inline (desktop / mobile-inline)
    // controls apply immediately.
    const source = inDrawer ? pendingFilters : currentFilters;
    const change = inDrawer ? setPendingFilter : onFilterChange;
    const value = source[filter.name];

    if (filter.type === "select") {
      const unsetValue = filter.defaultValue ?? "all";
      return (
        <Select
          value={(value as string) || unsetValue}
          onValueChange={(val) => change(filter.name, val === unsetValue ? undefined : val)}
          disabled={isLoading}
        >
          <SelectTrigger
            className={inDrawer ? "w-full" : cn("w-32 sm:w-37.5", filter.triggerClassName)}
          >
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {!filter.hideAllOption && <SelectItem value="all">All {filter.label}</SelectItem>}
            {filter.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (filter.type === "date") {
      return (
        <DatePicker
          value={value as string | undefined}
          onValueChange={(v) => change(filter.name, v ?? undefined)}
          placeholder={filter.placeholder || `Pick ${filter.label}`}
          disabled={isLoading}
          clearable
          className={inDrawer ? "w-full" : "w-60"}
        />
      );
    }

    if (filter.type === "date-range") {
      return (
        <DateRangePicker
          value={{
            from: source.from as string | undefined,
            to: source.to as string | undefined,
          }}
          onValueChange={(range) => {
            change("from", range.from);
            change("to", range.to);
          }}
          placeholder={filter.placeholder || `Pick ${filter.label} range`}
          disabled={isLoading}
          className={inDrawer ? "w-full" : undefined}
        />
      );
    }


    return null;
  };

  const useDrawer =
    mobileFilters === "drawer" && (filters.length > 0 || !!mobileDrawerExtra);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-8"
            disabled={isLoading}
          />
        </div>

        {/* Inline filters — always on desktop; on mobile only in "inline" mode. */}
        <div
          className={cn(
            "flex-wrap items-center gap-2",
            useDrawer ? "hidden sm:flex" : "flex"
          )}
        >
          {filters.map((filter) => (
            <div key={filter.name} className="flex items-center">
              {renderFilter(filter, false)}
            </div>
          ))}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={isLoading}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile drawer trigger */}
        {useDrawer && (
          <Button
            variant="outline"
            size="icon"
            aria-label="Filters"
            className="relative shrink-0 sm:hidden"
            onClick={openDrawer}
            disabled={isLoading}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}

      {/* Mobile bottom drawer with one labeled row per filter. Deliberately
          NOT a Radix Sheet — same reasoning as MobileSidebar in sidebar.tsx:
          the Sheet unmounts its children when closed, so every open re-mounts
          each filter control and runs Radix's forced reflows, making the
          slide-up stutter. Keeping the drawer mounted makes opening a pure
          transform/opacity transition; `inert` keeps the closed drawer out of
          the tab order and the accessibility tree. */}
      {useDrawer && (
        <div inert={!isDrawerOpen} className="sm:hidden">
          <div
            aria-hidden="true"
            onClick={() => setIsDrawerOpen(false)}
            className={cn(
              "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ease-in-out",
              isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            tabIndex={-1}
            data-state={isDrawerOpen ? "open" : "closed"}
            className={cn(
              "bg-background fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col gap-4 rounded-t-2xl border-t shadow-lg outline-none transition-transform duration-300 ease-in-out will-change-transform",
              isDrawerOpen ? "translate-y-0" : "translate-y-full"
            )}
          >
            <div
              aria-hidden
              className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-muted"
            />
            <div className="flex flex-col gap-1.5 p-4 pb-0">
              <h2 className="font-semibold text-foreground">{mobileDrawerTitle}</h2>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto px-4 py-1">
              {filters.map((filter) => (
                <div key={filter.name} className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {filter.label}
                  </span>
                  {renderFilter(filter, true)}
                </div>
              ))}
              {mobileDrawerExtra && (
                <div className="flex flex-col gap-2">{mobileDrawerExtra}</div>
              )}
            </div>
            <div className="mt-auto flex flex-row gap-2 p-4 pb-6">
              {filters.length > 0 && (
                <Button
                  variant="outline"
                  className="flex-1"
                  // Clears the staged selections only; nothing is committed until
                  // "Done" applies the (now empty) staged filters.
                  onClick={() => setPendingFilters({})}
                  disabled={isLoading || !hasPendingFilters}
                >
                  Reset
                </Button>
              )}
              <Button className="flex-1" onClick={applyPendingAndClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
