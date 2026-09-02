import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import {
  REGISTRATION_PAYMENT_STATUS_COLORS,
  REGISTRATION_PAYMENT_STATUS_LABELS,
  REGISTRATION_STATUS_COLORS,
  REGISTRATION_STATUS_LABELS,
  toOptions,
} from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount } from "@/lib/amount";
import { formatDateTime } from "@/lib/date";
import {
  useDeleteCalendarRegistrationMutation,
  useGetCalendarRegistrationsQuery,
  useGetCalendarRegistrationSummaryQuery,
  useUpdateCalendarRegistrationMutation,
} from "@/redux/apis/calendarRegistrationApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type {
  CalendarRegistration,
  CalendarResourceType,
  RegistrationPaymentStatus,
  RegistrationStatus,
} from "@/types/domain/calendar";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PaymentReviewDialog } from "./PaymentReviewDialog";
import {
  RegistrationRowActions,
  type RegistrationRowActionHandlers,
} from "./RegistrationRowActions";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: toOptions(REGISTRATION_STATUS_LABELS),
  },
  {
    name: "paymentStatus",
    label: "Payment",
    type: "select",
    options: toOptions(REGISTRATION_PAYMENT_STATUS_LABELS),
  },
];

export interface RegistrationsPageProps {
  resourceType: CalendarResourceType;
  resourceId: string;
  modulePath: string;
  heading: string;
  description: string;
  backTo: string;
  backLabel: string;
  emptyMessage: string;
  showSlot?: boolean;
  isLoadingResource: boolean;
  isResourceMissing: boolean;
}

export function RegistrationsPage({
  resourceType,
  resourceId,
  modulePath,
  heading,
  description,
  backTo,
  backLabel,
  emptyMessage,
  showSlot = false,
  isLoadingResource,
  isResourceMissing,
}: RegistrationsPageProps) {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission(modulePath);
  const ref = React.useMemo(() => ({ resourceType, resourceId }), [resourceType, resourceId]);

  const { data, isLoading, isFetching } = useGetCalendarRegistrationsQuery(
    {
      ...ref,
      query: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        status: filters.status as RegistrationStatus | undefined,
        paymentStatus: filters.paymentStatus as RegistrationPaymentStatus | undefined,
      },
    },
    { skip: !resourceId || isResourceMissing }
  );

  const { data: summary } = useGetCalendarRegistrationSummaryQuery(ref, {
    skip: !resourceId || isResourceMissing,
  });

  const [updateRegistration] = useUpdateCalendarRegistrationMutation();
  const [deleteRegistration, { isLoading: isDeleting }] = useDeleteCalendarRegistrationMutation();

  const [reviewing, setReviewing] = React.useState<CalendarRegistration | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<CalendarRegistration | null>(null);

  const setStatus = React.useCallback(
    async (registration: CalendarRegistration, status: RegistrationStatus, success: string) => {
      try {
        await updateRegistration({ ...ref, id: registration._id, body: { status } }).unwrap();
        toast.success(success);
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not update that registration");
      }
    },
    [ref, updateRegistration]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteRegistration({ ...ref, id: pendingDelete._id }).unwrap();
      toast.success("Registration removed");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove that registration");
    } finally {
      setPendingDelete(null);
    }
  };

  const rowActions = React.useMemo<RegistrationRowActionHandlers>(
    () => ({
      onReviewPayment: setReviewing,
      onConfirm: (registration) =>
        void setStatus(registration, "CONFIRMED", "Place confirmed"),
      onCancel: (registration) => void setStatus(registration, "CANCELLED", "Place cancelled"),
      onMarkAttended: (registration) =>
        void setStatus(registration, "ATTENDED", "Marked as attended"),
      onMarkNoShow: (registration) => void setStatus(registration, "NO_SHOW", "Marked as no show"),
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [setStatus, access.canEdit, access.canDelete]
  );

  const columns = React.useMemo<ColumnDef<CalendarRegistration>[]>(() => {
    const base: ColumnDef<CalendarRegistration>[] = [
      {
        accessorKey: "name",
        header: "Who",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs uppercase">{row.original.reference}</span>
            <span className="text-[11px] text-muted-foreground">
              {row.original.seats} {row.original.seats === 1 ? "place" : "places"}
            </span>
          </div>
        ),
      },
    ];

    if (showSlot) {
      base.push({
        id: "slot",
        header: "Slot",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {formatDateTime(row.original.slotStart)}
          </span>
        ),
      });
    }

    base.push(
      {
        accessorKey: "amount",
        header: "Payment",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <StatusBadge
              color={REGISTRATION_PAYMENT_STATUS_COLORS[row.original.paymentStatus]}
              label={REGISTRATION_PAYMENT_STATUS_LABELS[row.original.paymentStatus]}
            />
            {row.original.paymentStatus !== "NOT_REQUIRED" && (
              <span className="text-[11px] text-muted-foreground">
                {formatAmount(row.original.amount, row.original.currency)}
                {row.original.transactionId ? ` · ${row.original.transactionId}` : ""}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge
              color={REGISTRATION_STATUS_COLORS[row.original.status]}
              label={REGISTRATION_STATUS_LABELS[row.original.status]}
            />
            {row.original.source === "INTERNAL" && (
              <Badge variant="outline" className="text-[10px]">
                Added by you
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Received",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <RegistrationRowActions registration={row.original} {...rowActions} />
        ),
      }
    );

    return base;
  }, [rowActions, showSlot]);

  if (isLoadingResource) {
    return <LoadingSpinner />;
  }

  if (isResourceMissing) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">{emptyMessage}</p>
        <BackLink to={backTo} label={backLabel} variant="outline" className="mt-4" />
      </div>
    );
  }

  const registrations = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title={heading}
        description={description}
        actions={<BackLink to={backTo} label={backLabel} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Registrations</StatLabel>
          <StatValue>{summary?.total ?? 0}</StatValue>
          <StatDescription>
            {summary?.seatsTaken ?? 0} {summary?.seatsTaken === 1 ? "place" : "places"} held
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Confirmed</StatLabel>
          <StatValue>{summary?.confirmed ?? 0}</StatValue>
          <StatDescription>{summary?.attended ?? 0} marked as attended</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Awaiting a payment check</StatLabel>
          <StatValue>{summary?.awaitingVerification ?? 0}</StatValue>
          <StatDescription>
            {formatAmount(summary?.outstandingAmount ?? 0, summary?.currency)} still to verify
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Verified payments</StatLabel>
          <StatValue>{formatAmount(summary?.verifiedAmount ?? 0, summary?.currency)}</StatValue>
          <StatDescription>Money you have confirmed as received</StatDescription>
        </Stat>
      </StatGrid>

      <div className="space-y-4">
        <DataTableToolbar
          searchValue={filters.search}
          onSearchChange={(value) => setFilter("search", value)}
          searchPlaceholder="Search by name, email, reference or transaction ID..."
          filters={FILTERS}
          currentFilters={filters}
          onFilterChange={setFilter}
          onClear={clearFilters}
          isLoading={isFetching}
        />

        <DataTable
          columns={columns}
          data={registrations}
          isLoading={isLoading}
          pagination={
            meta
              ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
              : undefined
          }
          onPageChange={(page) => setFilter("page", page)}
          onLimitChange={(limit) => setFilter("limit", limit)}
          getRowId={(row) => row._id}
          mobileCard={(registration) => (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{registration.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {registration.email}
                  </p>
                </div>
                <StatusBadge
                  color={REGISTRATION_STATUS_COLORS[registration.status]}
                  label={REGISTRATION_STATUS_LABELS[registration.status]}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                  {registration.reference}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {registration.seats} {registration.seats === 1 ? "place" : "places"}
                </Badge>
                <StatusBadge
                  color={REGISTRATION_PAYMENT_STATUS_COLORS[registration.paymentStatus]}
                  label={REGISTRATION_PAYMENT_STATUS_LABELS[registration.paymentStatus]}
                />
              </div>

              {showSlot && registration.slotStart && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5" />
                  {formatDateTime(registration.slotStart)}
                </p>
              )}

              {registration.paymentStatus !== "NOT_REQUIRED" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatAmount(registration.amount, registration.currency)}
                  {registration.transactionId ? ` · ${registration.transactionId}` : ""}
                </p>
              )}

              <div className="mt-3 border-t pt-3">
                <RegistrationRowActions registration={registration} {...rowActions} />
              </div>
            </div>
          )}
        />
      </div>

      <PaymentReviewDialog
        resourceType={resourceType}
        resourceId={resourceId}
        registration={reviewing}
        onOpenChange={(open) => !open && setReviewing(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove ${pendingDelete?.name ?? "this registration"}?`}
        description="The place is freed up again. This cannot be undone from here."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
