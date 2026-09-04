import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import {
  useChangeJobOpeningStatusMutation,
  useDeleteJobOpeningMutation,
  useDuplicateJobOpeningMutation,
  useGetJobOpeningSummaryQuery,
  useGetJobOpeningsQuery,
} from "@/redux/apis/jobOpeningApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  JOB_EMPLOYMENT_TYPES,
  JOB_EMPLOYMENT_TYPE_LABELS,
  JOB_OPENING_PRIORITY_COLORS,
  JOB_OPENING_PRIORITY_LABELS,
  JOB_OPENING_STATUSES,
  JOB_OPENING_STATUS_COLORS,
  JOB_OPENING_STATUS_LABELS,
  JOB_WORKPLACE_TYPES,
  JOB_WORKPLACE_TYPE_LABELS,
  type JobEmploymentType,
  type JobOpening,
  type JobOpeningStatus,
  type JobWorkplaceType,
} from "@/types/domain/jobOpening";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CircleDot,
  Copy,
  MoreHorizontal,
  Pause,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { JobOpeningFormModal } from "./components/JobOpeningFormModal";

const STATUS_ACTIONS: { status: JobOpeningStatus; label: string; icon: typeof CircleDot }[] = [
  { status: "OPEN", label: "Mark open", icon: CircleDot },
  { status: "ON_HOLD", label: "Put on hold", icon: Pause },
  { status: "FILLED", label: "Mark filled", icon: CircleDot },
  { status: "CLOSED", label: "Close", icon: XCircle },
];

export default function JobOpeningsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/recruitment/job-openings");

  const { data: departments = [] } = useGetDepartmentOptionsQuery();

  const { data, isLoading, isFetching } = useGetJobOpeningsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as JobOpeningStatus | undefined,
    departmentId: filters.departmentId as string | undefined,
    employmentType: filters.employmentType as JobEmploymentType | undefined,
    workplaceType: filters.workplaceType as JobWorkplaceType | undefined,
    closingSoon: filters.closingSoon === "true" ? true : undefined,
  });

  const { data: summary } = useGetJobOpeningSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<JobOpening | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<JobOpening | null>(null);

  const [deleteOpening, { isLoading: isDeleting }] = useDeleteJobOpeningMutation();
  const [changeStatus] = useChangeJobOpeningStatusMutation();
  const [duplicateOpening] = useDuplicateJobOpeningMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: JOB_OPENING_STATUSES.map((value) => ({
          value,
          label: JOB_OPENING_STATUS_LABELS[value],
        })),
      },
      {
        name: "departmentId",
        label: "Department",
        type: "select",
        options: departments.map((entry) => ({ value: entry._id, label: entry.name })),
      },
      {
        name: "employmentType",
        label: "Type",
        type: "select",
        options: JOB_EMPLOYMENT_TYPES.map((value) => ({
          value,
          label: JOB_EMPLOYMENT_TYPE_LABELS[value],
        })),
      },
      {
        name: "workplaceType",
        label: "Where",
        type: "select",
        options: JOB_WORKPLACE_TYPES.map((value) => ({
          value,
          label: JOB_WORKPLACE_TYPE_LABELS[value],
        })),
      },
      {
        name: "closingSoon",
        label: "Deadline",
        type: "select",
        options: [{ label: "Closing soon", value: "true" }],
      },
    ],
    [departments]
  );

  const onEdit = React.useCallback((opening: JobOpening) => {
    setEditing(opening);
    setFormOpen(true);
  }, []);

  const setStatus = React.useCallback(
    async (opening: JobOpening, status: JobOpeningStatus) => {
      try {
        await changeStatus({ id: opening._id, status }).unwrap();
        toast.success(`${opening.title} is now ${JOB_OPENING_STATUS_LABELS[status].toLowerCase()}`);
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not change the status");
      }
    },
    [changeStatus]
  );

  const duplicate = React.useCallback(
    async (opening: JobOpening) => {
      try {
        await duplicateOpening(opening._id).unwrap();
        toast.success(`Copied ${opening.title}`);
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not duplicate the opening");
      }
    },
    [duplicateOpening]
  );

  const rowMenu = React.useCallback(
    (opening: JobOpening) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          disabled={!access.canEdit}
          onClick={() => onEdit(opening)}
        >
          <Pencil className="size-4" />
          Edit
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer"
              aria-label={`More actions for ${opening.title}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {STATUS_ACTIONS.filter((action) => action.status !== opening.status).map((action) => (
              <DropdownMenuItem
                key={action.status}
                disabled={!access.canEdit}
                onSelect={() => void setStatus(opening, action.status)}
              >
                <action.icon className="size-4" />
                {action.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!access.canCreate}
              onSelect={() => void duplicate(opening)}
            >
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={!access.canDelete}
              onSelect={() => setPendingDelete(opening)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    [access.canCreate, access.canDelete, access.canEdit, duplicate, onEdit, setStatus]
  );

  const columns = React.useMemo<ColumnDef<JobOpening>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Role",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.code}
              {row.original.department ? ` · ${row.original.department.name}` : ""}
              {row.original.location ? ` · ${row.original.location}` : ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="space-y-1">
            <StatusBadge
              color={JOB_OPENING_STATUS_COLORS[row.original.status]}
              label={JOB_OPENING_STATUS_LABELS[row.original.status]}
            />
            {row.original.isPublished && (
              <p className="text-xs text-muted-foreground">Published</p>
            )}
          </div>
        ),
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm">{JOB_EMPLOYMENT_TYPE_LABELS[row.original.employmentType]}</p>
            <p className="text-xs text-muted-foreground">
              {JOB_WORKPLACE_TYPE_LABELS[row.original.workplaceType]}
            </p>
          </div>
        ),
      },
      {
        id: "positions",
        header: () => <div className="text-right">Positions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <p className="text-sm">
              {formatNumber(row.original.filledCount)} / {formatNumber(row.original.openings)}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.remainingCount} to fill
            </p>
          </div>
        ),
      },
      {
        id: "salary",
        header: () => <div className="text-right">Salary</div>,
        cell: ({ row }) => {
          const { min, max } = row.original.salary;
          if (min === 0 && max === 0) {
            return <div className="text-right text-xs text-muted-foreground">—</div>;
          }
          return (
            <div className="text-right text-sm">
              {formatAmountValue(min)}
              {max > 0 ? ` – ${formatAmountValue(max)}` : "+"}
            </div>
          );
        },
      },
      {
        id: "closing",
        header: "Closes",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm">{formatDate(row.original.closingAt)}</p>
            {row.original.isOverdue && (
              <p className="text-xs text-red-600 dark:text-red-500">Past the deadline</p>
            )}
            {row.original.isClosingSoon && (
              <p className="text-xs text-amber-600 dark:text-amber-500">Closing soon</p>
            )}
          </div>
        ),
      },
      {
        id: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <StatusBadge
            color={JOB_OPENING_PRIORITY_COLORS[row.original.priority]}
            label={JOB_OPENING_PRIORITY_LABELS[row.original.priority]}
          />
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => rowMenu(row.original),
      },
    ],
    [rowMenu]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteOpening(pendingDelete._id).unwrap();
      toast.success("Job opening removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the job opening");
    }
  };

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const limit = summary?.limit ?? access.limit;
  const used = summary?.used ?? 0;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Job openings"
        description="The roles you are hiring for, and how far along each one is."
        actions={
          <div className="flex items-center gap-2">
            <CurrencyNote currency={summary?.currency ?? "BDT"} />
            <BackLink to="/hrms/recruitment/overview" label="Recruitment overview" />
          </div>
        }
      />

      <StatGrid>
        <Stat>
          <StatLabel>Open roles</StatLabel>
          <StatValue>{formatNumber(summary?.openCount)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.draftCount)} draft, {formatNumber(summary?.onHoldCount)} on hold
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Positions to fill</StatLabel>
          <StatValue>{formatNumber(summary?.positionsToFill)}</StatValue>
          <StatDescription>
            Across {formatNumber(summary?.totalPositions)} budgeted seats
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Closing soon</StatLabel>
          <StatValue>{formatNumber(summary?.closingSoonCount)}</StatValue>
          <StatDescription>Deadline within two weeks</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Published</StatLabel>
          <StatValue>{formatNumber(summary?.publishedCount)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} openings used`}
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search job openings..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New opening"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} job openings. Delete one or upgrade to add more.`
                  : undefined
              }
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          You have used all {limit} job openings your plan allows. Delete one or upgrade your plan
          to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        getRowId={(row) => row._id}
        mobileCard={(opening) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{opening.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {opening.code}
                  {opening.department ? ` · ${opening.department.name}` : ""}
                </p>
              </div>
              <StatusBadge
                color={JOB_OPENING_STATUS_COLORS[opening.status]}
                label={JOB_OPENING_STATUS_LABELS[opening.status]}
              />
            </div>

            {opening.summary && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{opening.summary}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {JOB_EMPLOYMENT_TYPE_LABELS[opening.employmentType]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {JOB_WORKPLACE_TYPE_LABELS[opening.workplaceType]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {opening.remainingCount} to fill
              </Badge>
              {opening.isClosingSoon && (
                <Badge variant="secondary" className="text-[10px]">
                  Closing soon
                </Badge>
              )}
              {opening.isPublished && (
                <Badge variant="outline" className="text-[10px]">
                  Published
                </Badge>
              )}
            </div>

            <div className="mt-3 border-t pt-3">{rowMenu(opening)}</div>
          </div>
        )}
      />

      <JobOpeningFormModal open={formOpen} onOpenChange={setFormOpen} opening={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="The opening goes, along with anything tracked against it."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
