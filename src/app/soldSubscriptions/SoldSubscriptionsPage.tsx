import { ActionButton } from "@/components/shared/action-button";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatGrid, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import {
  BILLING_ORIGIN_LABELS,
  PAYMENT_REVIEW_ACTION_LABELS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  toOptions,
} from "@/constant";
import { formatAmountValue, formatNumber } from "@/lib/amount";
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
  BillingOrigin,
  PaymentStatus,
  SoldSubscription,
  SubscriptionStatus,
} from "@/types/domain/soldSubscription";
import { CircleCheck, Clock, HandCoins, Plus, Receipt, RefreshCcw, Wallet } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { RecordSaleModal } from "./components/RecordSaleModal";
import { SoldSubscriptionFormModal } from "./components/SoldSubscriptionFormModal";
import { SoldSubscriptionMobileCard } from "./components/SoldSubscriptionMobileCard";
import { PaymentReviewModal, type PaymentReviewMode } from "./components/PaymentReviewModal";
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
  {
    name: "billingOrigin",
    label: "Origin",
    type: "select",
    options: toOptions(BILLING_ORIGIN_LABELS),
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
    billingOrigin: filters.billingOrigin as BillingOrigin | undefined,
    startDateFrom: filters.from as string | undefined,
    startDateTo: filters.to as string | undefined,
  });

  const [createOpen, setCreateOpen] = React.useState(false);
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

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onDelete: setPendingDelete,
      onApprove: openReview("APPROVE"),
      onReject: openReview("REJECT"),
      onRefund: openReview("REFUND"),
      onSuspend: openReview("SUSPEND"),
    }),
    []
  );

  const columns = React.useMemo(() => soldSubscriptionColumns(rowActions), [rowActions]);

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
      label: "On trial",
      value: formatNumber(summary?.trialingCount),
      icon: Clock,
      color: "info" as const,
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
      label: "Auto renewed",
      value: formatNumber(summary?.autoRenewedCount),
      icon: RefreshCcw,
      color: "info" as const,
    },
    {
      label: "Revenue (paid)",
      value: formatAmountValue(summary?.totalRevenue),
      icon: Wallet,
      color: "success" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title="Sold Subscriptions"
        description="Every plan assigned to a company, with its invoice, term and payment state."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="xl:grid-cols-5">
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
      </StatGrid>

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
          <ActionButton icon={Plus} label="Assign plan" onClick={() => setCreateOpen(true)} />
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
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Trial days</span>
              <span className="font-medium">{record.trialDays || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Trial ends</span>
              <span className="font-medium">
                {record.trialEndsAt ? formatDate(record.trialEndsAt) : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Bill generated</span>
              <span className="font-medium">
                {record.billedAt ? formatDate(record.billedAt) : "Not yet"}
              </span>
            </div>
            {record.refundAmount > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Refunded</span>
                <span className="font-medium tabular-nums">
                  {formatAmountValue(record.refundAmount)}
                  {record.systemChargeAmount > 0
                    ? ` (after ${formatAmountValue(record.systemChargeAmount)} system charge)`
                    : ""}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Billing origin</span>
              <span className="font-medium">
                {BILLING_ORIGIN_LABELS[record.billingOrigin] ?? record.billingOrigin}
                {record.renewalCycle > 0 ? ` · cycle ${record.renewalCycle}` : ""}
              </span>
            </div>
            {record.paymentReviewAction && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Payment review</span>
                <span className="font-medium">
                  {PAYMENT_REVIEW_ACTION_LABELS[record.paymentReviewAction]}
                  {record.paymentReviewedAt ? ` · ${formatDate(record.paymentReviewedAt)}` : ""}
                </span>
              </div>
            )}
            {record.paymentReviewNote && (
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-muted-foreground">Review note</span>
                <p className="mt-0.5 whitespace-pre-wrap font-medium">{record.paymentReviewNote}</p>
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
        mobileCard={(record) => <SoldSubscriptionMobileCard record={record} {...rowActions} />}
      />

      <PaymentReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        mode={reviewMode}
        record={reviewRecord}
      />

      <RecordSaleModal open={createOpen} onOpenChange={setCreateOpen} />

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
