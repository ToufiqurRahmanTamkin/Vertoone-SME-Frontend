import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteHolidayMutation,
  useGetHolidaySummaryQuery,
  useGetHolidaysQuery,
} from "@/redux/apis/holidayApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { HOLIDAY_TYPES, HOLIDAY_TYPE_LABELS, type Holiday } from "@/types/domain/holiday";
import { CopyPlus, Globe2, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CopyYearDialog } from "./components/CopyYearDialog";
import { HolidayFormModal } from "./components/HolidayFormModal";
import { ImportCountryHolidaysDialog } from "./components/ImportCountryHolidaysDialog";
import { HolidayRowMenu, formatRange, holidayColumns } from "./holidays.columns";

const CURRENT_YEAR = new Date().getFullYear();

const YEAR_OPTIONS = Array.from({ length: 7 }, (_, index) => {
  const year = CURRENT_YEAR - 2 + index;
  return { label: String(year), value: String(year) };
});

const FILTERS: FilterConfig[] = [
  {
    name: "year",
    label: "Year",
    type: "select",
    options: YEAR_OPTIONS,
    defaultValue: String(CURRENT_YEAR),
    hideAllOption: true,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: HOLIDAY_TYPES.map((value) => ({ label: HOLIDAY_TYPE_LABELS[value], value })),
  },
  {
    name: "isActive",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];

export default function HolidayCalendarPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/settings/holiday-calendar");

  const year = Number(filters.year ?? CURRENT_YEAR);

  const { data, isLoading, isFetching } = useGetHolidaysQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    year,
    type: filters.type as Holiday["type"] | undefined,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetHolidaySummaryQuery({ year });

  const [formOpen, setFormOpen] = React.useState(false);
  const [copyOpen, setCopyOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Holiday | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Holiday | null>(null);
  const [deleteHoliday, { isLoading: isDeleting }] = useDeleteHolidayMutation();

  const rowActions = React.useMemo(
    () => ({
      onEdit: (holiday: Holiday) => {
        setEditing(holiday);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => holidayColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteHoliday(pendingDelete._id).unwrap();
      toast.success("Holiday removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the holiday");
    }
  };

  const holidays = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Holiday calendar"
        description="The days nobody is expected to work. Attendance, leave and payroll all read from this."
        actions={
          <>
            <BackLink to="/hrms/settings/overview" label="All settings" />
            {access.canCreate && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setImportOpen(true)}
              >
                <Globe2 className="size-4" />
                Import {year} holidays
              </Button>
            )}
            {access.canCreate && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setCopyOpen(true)}
                disabled={(summary?.years.length ?? 0) === 0}
                title={
                  (summary?.years.length ?? 0) === 0
                    ? "Add a holiday first, then you can copy the year"
                    : undefined
                }
              >
                <CopyPlus className="size-4" />
                Copy a year
              </Button>
            )}
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Days off in {year}</StatLabel>
          <StatValue>{summary?.thisYearDays ?? 0}</StatValue>
          <StatDescription>
            Across {summary?.thisYearCount ?? 0} holidays
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Still to come</StatLabel>
          <StatValue>{summary?.upcomingCount ?? 0}</StatValue>
          <StatDescription>{summary?.nextHolidayName || "None scheduled"}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Optional</StatLabel>
          <StatValue>{summary?.optionalCount ?? 0}</StatValue>
          <StatDescription>People may work these and take the day elsewhere</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>All years</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed`}
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search holidays..."
        filters={FILTERS}
        currentFilters={{ ...filters, year: String(year) }}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New holiday"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} holidays. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} holidays your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={holidays}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        getRowId={(row) => row._id}
        mobileCard={(holiday) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: holiday.color }}
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{holiday.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{formatRange(holiday)}</p>
                </div>
              </div>
              <StatusBadge
                color={!holiday.isActive ? "zinc" : holiday.isPast ? "muted" : "green"}
                label={!holiday.isActive ? "Inactive" : holiday.isPast ? "Past" : "Upcoming"}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {HOLIDAY_TYPE_LABELS[holiday.type]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {holiday.days} day{holiday.days === 1 ? "" : "s"}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {holiday.isPaid ? "Paid" : "Unpaid"}
              </Badge>
            </div>

            <div className="mt-3 border-t pt-3">
              <HolidayRowMenu holiday={holiday} actions={rowActions} />
            </div>
          </div>
        )}
      />

      <HolidayFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        holiday={editing}
        defaultYear={year}
      />

      <ImportCountryHolidaysDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        year={year}
      />

      <CopyYearDialog
        open={copyOpen}
        onOpenChange={setCopyOpen}
        years={summary?.years ?? []}
        currentYear={year}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.name ?? ""}"?`}
        description="The day goes back to being a normal working day for everybody."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
