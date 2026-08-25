import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import {
  PAYMENT_REVIEW_ACTION_LABELS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  toOptions,
} from "@/constant";
import { formatAmount, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteSoldSubscriptionMutation,
  useGetSoldSubscriptionsQuery,
  useGetSoldSubscriptionSummaryQuery,
} from "@/redux/apis/soldSubscriptionApis";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type {
  PaymentStatus,
  SoldSubscription,
  SubscriptionStatus,
} from "@/types/domain/soldSubscription";
import { CircleCheck, Clock, HandCoins, Plus, Receipt, Wallet } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { SoldSubscriptionFormModal } from "./components/SoldSubscriptionFormModal";
import { SoldSubscriptionMobileCard } from "./components/SoldSubscriptionMobileCard";
import {
  PaymentReviewModal,
  type PaymentReviewMode,
} from "./components/PaymentReviewModal";
import { soldSubscriptionColumns } from "./sold-subscriptions.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: toOptions(SUBSCRIPTION_STATUS_LABELS),
  },
  {
    name: "paymentStatus",
    label: "Payment",
    type: "select",
    options: toOptions(PAYMENT_STATUS_LABELS),
  },
  { name: "startDate", label: "Start date", type: "date-range" },
];

export default function SoldSubscriptionsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const { data: config } = useGetSystemConfigQuery();
  const { data: summary, isLoading: isSummaryLoading } = useGetSoldSubscriptionSummaryQuery();

  const { data, isLoading, isFetching } = useGetSoldSubscriptionsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as SubscriptionStatus | undefined,
    paymentStatus: filters.paymentStatus as PaymentStatus | undefined,
    // The date-range filter writes the shared `from`/`to` params.
    startDateFrom: filters.from as string | undefined,
    startDateTo: filters.to as string | undefined,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SoldSubscription | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<SoldSubscription | null>(null);
  const [deleteSale, { isLoading: isDeleting }] = useDeleteSoldSubscriptionMutation();

  const [reviewMode, setReviewMode] = React.useState<PaymentReviewMode>("APPROVE");
  const [reviewRecord, setReviewRecord] = React.useState<SoldSubscription | null>(null);
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const openReview = (mode: PaymentReviewMode) => (record: SoldSubscription) => {
    setReviewMode(mode);
    setReviewRecord(record);
    setReviewOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (record: SoldSubscription) => {
    setEditing(record);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteSale(pendingDelete._id).unwrap();
      toast.success("Subscription deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the subscription");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () =>
      soldSubscriptionColumns({
        onEdit: openEdit,
        onDelete: setPendingDelete,
        onApprove: openReview("APPROVE"),
        onReject: openReview("REJECT"),
        onRefund: openReview("REFUND"),
      }),
    []
  );

  const records = data?.data ?? [];
  const meta = data?.meta;
  const currency = config?.defaultCurrency ?? "BDT";

  const stats = [
    {
      label: "Total sold",
      value: formatNumber(summary?.totalSold),
      icon: Receipt,
      color: "info" as const,
    },
    {
      label: "Active",
      value: formatNumber(summary?.activeCount),
      icon: CircleCheck,
      color: "success" as const,
    },
    {
      label: "Pending",
      value: formatNumber(summary?.pendingCount),
      icon: Clock,
      color: "warning" as const,
    },
    {
      label: "Awaiting approval",
      value: formatNumber(summary?.awaitingApprovalCount),
      icon: HandCoins,
      color: "warning" as const,
    },
    {
      label: "Revenue (paid)",
      value: formatAmount(summary?.totalRevenue, currency),
      icon: Wallet,
      color: "success" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title="Sold Subscriptions"
        description="Every subscription sold, with its invoice, term and payment state."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Stat key={label}>
            <StatLabel>{label}</StatLabel>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <StatValue className="truncate">{value}</StatValue>
            )}
            <StatIndicator variant="icon" color={color}>
              <Icon />
            </StatIndicator>
          </Stat>
        ))}
      </div>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search customer, invoice, transaction..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Record sale
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(record) => (
          <div className="grid gap-x-8 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{record.customerPhone || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Company</span>
              <span className="font-medium">{record.companyName || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Payment method</span>
              <span className="font-medium">{record.paymentMethod}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="truncate font-mono font-medium">{record.transactionId || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Auto renew</span>
              <span className="font-medium">{record.autoRenew ? "Yes" : "No"}</span>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <span className="text-muted-foreground">Modules granted</span>
              {record.grantedModules?.length ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {record.grantedModules.map((entry) => (
                    <span
                      key={entry.key}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium"
                    >
                      {entry.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-0.5 font-medium">None</p>
              )}
            </div>
            {record.paymentReviewAction && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Payment review</span>
                <span className="font-medium">
                  {PAYMENT_REVIEW_ACTION_LABELS[record.paymentReviewAction]}
                  {record.paymentReviewedAt
                    ? ` · ${formatDate(record.paymentReviewedAt)}`
                    : ""}
                </span>
              </div>
            )}
            {record.paymentReviewNote && (
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-muted-foreground">Review note</span>
                <p className="mt-0.5 whitespace-pre-wrap font-medium">
                  {record.paymentReviewNote}
                </p>
              </div>
            )}
            {record.notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-muted-foreground">Notes</span>
                <p className="mt-0.5 whitespace-pre-wrap font-medium">{record.notes}</p>
              </div>
            )}
          </div>
        )}
        mobileCard={(record) => (
          <SoldSubscriptionMobileCard
            record={record}
            onEdit={openEdit}
            onDelete={setPendingDelete}
            onApprove={openReview("APPROVE")}
            onReject={openReview("REJECT")}
            onRefund={openReview("REFUND")}
          />
        )}
      />

      <PaymentReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        mode={reviewMode}
        record={reviewRecord}
      />

      <SoldSubscriptionFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editing}
        defaultCurrency={currency}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete ${pendingDelete?.invoiceNumber ?? ""}?`}
        description="This permanently removes the sale record. This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
