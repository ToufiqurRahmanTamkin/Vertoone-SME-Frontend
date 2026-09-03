import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatGrid, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import {
  SUBSCRIPTION_REQUEST_STATUS_LABELS,
  SUBSCRIPTION_REQUEST_TYPE_LABELS,
  toOptions,
} from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useGetSubscriptionRequestsQuery,
  useGetSubscriptionRequestSummaryQuery,
} from "@/redux/apis/subscriptionRequestApis";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import type {
  SubscriptionRequest,
  SubscriptionRequestStatus,
  SubscriptionRequestType,
} from "@/types/domain/subscriptionRequest";
import { ArrowUpCircle, Clock, HandCoins, Inbox, Trash2 } from "lucide-react";
import * as React from "react";
import { SubscriptionRequestMobileCard } from "./components/SubscriptionRequestMobileCard";
import {
  SubscriptionRequestReviewModal,
  type SubscriptionRequestReviewMode,
} from "./components/SubscriptionRequestReviewModal";
import { subscriptionRequestColumns } from "./subscription-requests.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "type",
    label: "Type",
    type: "select",
    options: toOptions(SUBSCRIPTION_REQUEST_TYPE_LABELS),
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: toOptions(SUBSCRIPTION_REQUEST_STATUS_LABELS),
  },
];

export default function SubscriptionRequestsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const { data: config } = useGetSystemConfigQuery();
  const { data: summary, isLoading: isSummaryLoading } = useGetSubscriptionRequestSummaryQuery();

  const { data, isLoading, isFetching } = useGetSubscriptionRequestsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    type: filters.type as SubscriptionRequestType | undefined,
    status: filters.status as SubscriptionRequestStatus | undefined,
  });

  const [reviewMode, setReviewMode] =
    React.useState<SubscriptionRequestReviewMode>("APPROVE");
  const [reviewRecord, setReviewRecord] = React.useState<SubscriptionRequest | null>(null);
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const openReview = React.useCallback(
    (mode: SubscriptionRequestReviewMode) => (record: SubscriptionRequest) => {
      setReviewMode(mode);
      setReviewRecord(record);
      setReviewOpen(true);
    },
    []
  );

  const rowActions = React.useMemo(
    () => ({
      onApprove: openReview("APPROVE"),
      onReject: openReview("REJECT"),
    }),
    [openReview]
  );

  const columns = React.useMemo(() => subscriptionRequestColumns(rowActions), [rowActions]);

  const records = data?.data ?? [];
  const meta = data?.meta;
  const currency = config?.defaultCurrency ?? "BDT";

  const stats = [
    {
      label: "All requests",
      value: formatNumber(summary?.total),
      icon: Inbox,
      color: "info" as const,
    },
    {
      label: "Awaiting review",
      value: formatNumber(summary?.pending),
      icon: Clock,
      color: "warning" as const,
    },
    {
      label: "Cancellations",
      value: formatNumber(summary?.pendingCancellations),
      icon: Trash2,
      color: "error" as const,
    },
    {
      label: "Upgrades",
      value: formatNumber(summary?.pendingUpgrades),
      icon: ArrowUpCircle,
      color: "info" as const,
    },
    {
      label: "Refunded",
      value: formatAmountValue(summary?.refundedAmount),
      icon: HandCoins,
      color: "success" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title="Subscription Requests"
        description="Cancellations and plan upgrades raised by company owners, waiting on your approval."
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
        searchPlaceholder="Search company, plan, invoice..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
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
              <span className="text-muted-foreground">Requested by</span>
              <span className="font-medium">{record.requestedByName || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Current subscription</span>
              <span className="font-mono font-medium">{record.subscriptionInvoiceNumber}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">New invoice</span>
              <span className="font-mono font-medium">{record.targetInvoiceNumber || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">System charge</span>
              <span className="font-medium tabular-nums">
                {formatAmountValue(record.systemChargeAmount)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Refund</span>
              <span className="font-medium tabular-nums">
                {formatAmountValue(record.refundAmount)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Erases all data</span>
              <span className="font-medium">{record.dataWipeRequired ? "Yes" : "No"}</span>
            </div>
            {record.dataWipedAt && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Data erased</span>
                <span className="font-medium">
                  {formatDate(record.dataWipedAt)} · {record.dataWipedRecords} record(s)
                </span>
              </div>
            )}
            {record.reviewedAt && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Reviewed</span>
                <span className="font-medium">{formatDate(record.reviewedAt)}</span>
              </div>
            )}
            {record.reason && (
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-muted-foreground">Their reason</span>
                <p className="mt-0.5 whitespace-pre-wrap font-medium">{record.reason}</p>
              </div>
            )}
            {record.reviewNote && (
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-muted-foreground">Review note</span>
                <p className="mt-0.5 whitespace-pre-wrap font-medium">{record.reviewNote}</p>
              </div>
            )}
          </div>
        )}
        mobileCard={(record) => (
          <SubscriptionRequestMobileCard record={record} {...rowActions} />
        )}
      />

      <SubscriptionRequestReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        mode={reviewMode}
        record={reviewRecord}
      />
    </>
  );
}
