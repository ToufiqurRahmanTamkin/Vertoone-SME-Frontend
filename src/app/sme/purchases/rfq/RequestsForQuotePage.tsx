import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useCancelRequestForQuoteMutation,
  useCloseRequestForQuoteMutation,
  useDeleteRequestForQuoteMutation,
  useGetRequestForQuoteSummaryQuery,
  useGetRequestsForQuoteQuery,
  useSendRequestForQuoteMutation,
} from "@/redux/apis/requestForQuoteApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  RFQ_STATUSES,
  RFQ_STATUS_COLORS,
  RFQ_STATUS_LABELS,
  RFQ_SUPPLIER_STATUS_COLORS,
  RFQ_SUPPLIER_STATUS_LABELS,
  type RequestForQuote,
  type RequestForQuoteStatus,
} from "@/types/domain/requestForQuote";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AwardRfqDialog } from "./components/AwardRfqDialog";
import { RecordQuoteDialog } from "./components/RecordQuoteDialog";
import { RfqFormModal } from "./components/RfqFormModal";
import { RfqRowActions, rfqColumns } from "./rfq.columns";

type PendingAction = { kind: "close" | "cancel" | "delete"; rfq: RequestForQuote } | null;

export default function RequestsForQuotePage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/purchases/rfq");
  const orderAccess = useModulePermission("/sme/purchases/orders");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: suppliers = [] } = useGetSupplierOptionsQuery();

  const { data, isLoading, isFetching } = useGetRequestsForQuoteQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as RequestForQuoteStatus | undefined,
    supplierId: filters.supplierId as string | undefined,
  });

  const { data: summary } = useGetRequestForQuoteSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<RequestForQuote | null>(null);
  const [quoting, setQuoting] = React.useState<RequestForQuote | null>(null);
  const [awarding, setAwarding] = React.useState<RequestForQuote | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [sendRfq] = useSendRequestForQuoteMutation();
  const [closeRfq, { isLoading: isClosing }] = useCloseRequestForQuoteMutation();
  const [cancelRfq, { isLoading: isCancelling }] = useCancelRequestForQuoteMutation();
  const [deleteRfq, { isLoading: isDeleting }] = useDeleteRequestForQuoteMutation();

  const run = async (action: Promise<unknown>, success: string, failure: string) => {
    try {
      await action;
      toast.success(success);
      return true;
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || failure);
      return false;
    }
  };

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: RFQ_STATUSES.map((status) => ({
          label: RFQ_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "supplierId",
        label: "Supplier",
        type: "select",
        options: suppliers.map((supplier) => ({
          label: supplier.name,
          value: supplier._id,
        })),
      },
    ],
    [suppliers]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: (rfq: RequestForQuote) => {
        setEditing(rfq);
        setFormOpen(true);
      },
      onSend: (rfq: RequestForQuote) =>
        void run(
          sendRfq(rfq._id).unwrap(),
          `${rfq.rfqNumber} sent to ${rfq.supplierCount} suppliers`,
          "Could not send this request"
        ),
      onRecordQuote: setQuoting,
      onAward: setAwarding,
      onClose: (rfq: RequestForQuote) => setPending({ kind: "close", rfq }),
      onCancel: (rfq: RequestForQuote) => setPending({ kind: "cancel", rfq }),
      onDelete: (rfq: RequestForQuote) => setPending({ kind: "delete", rfq }),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canRaiseOrder: orderAccess.canCreate,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canEdit, access.canDelete, orderAccess.canCreate]
  );

  const columns = React.useMemo(() => rfqColumns(rowActions), [rowActions]);

  const confirmPending = async () => {
    if (!pending) return;

    if (pending.kind === "close") {
      await run(
        closeRfq(pending.rfq._id).unwrap(),
        `${pending.rfq.rfqNumber} closed`,
        "Could not close this request"
      );
    } else if (pending.kind === "cancel") {
      await run(
        cancelRfq(pending.rfq._id).unwrap(),
        `${pending.rfq.rfqNumber} cancelled`,
        "Could not cancel this request"
      );
    } else {
      await run(
        deleteRfq(pending.rfq._id).unwrap(),
        "Request deleted",
        "Could not delete this request"
      );
    }

    setPending(null);
  };

  const rfqs = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const pendingCopy: Record<"close" | "cancel" | "delete", { title: string; body: string }> = {
    close: {
      title: `Close ${pending?.rfq.rfqNumber ?? ""}?`,
      body: "Nobody wins this one. The quotes stay on record so you can compare them later.",
    },
    cancel: {
      title: `Cancel ${pending?.rfq.rfqNumber ?? ""}?`,
      body: "A request that already turned into a purchase order cannot be cancelled here.",
    },
    delete: {
      title: `Delete ${pending?.rfq.rfqNumber ?? ""}?`,
      body: "Only requests that never became a purchase order can be deleted.",
    },
  };

  return (
    <>
      <PageHeader
        title="Requests for quote"
        description="What you asked suppliers to price, what came back, and which quote won."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/purchases/overview" label="Purchases overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Requests</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Out with suppliers</StatLabel>
          <StatValue>{formatNumber(summary?.awaitingResponseCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.overdueCount ?? 0)} past their reply date
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Ready to award</StatLabel>
          <StatValue>{formatNumber(summary?.quotedCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.draftCount ?? 0)} still in draft
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Awarded value</StatLabel>
          <StatValue>{formatAmountValue(summary?.awardedValue)}</StatValue>
          <StatDescription>
            {formatAmountValue(summary?.estimatedValue)} still being priced
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search requests for quote..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New request"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} requests. Delete one or upgrade to add more.`
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

      <DataTable
        columns={columns}
        data={rfqs}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(rfq) => (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Who was asked
            </p>
            <ul className="divide-y rounded-lg border">
              {rfq.suppliers.map((supplier) => (
                <li
                  key={supplier._id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{supplier.supplierName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {supplier.respondedAt
                        ? `Replied ${formatDate(supplier.respondedAt)}`
                        : supplier.invitedAt
                          ? `Asked ${formatDate(supplier.invitedAt)}`
                          : "Not sent yet"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {supplier.quotedTotal > 0 && (
                      <span className="tabular-nums">
                        {formatAmountValue(supplier.quotedTotal)}
                      </span>
                    )}
                    <StatusBadge
                      color={RFQ_SUPPLIER_STATUS_COLORS[supplier.status] as StatusColor}
                      label={RFQ_SUPPLIER_STATUS_LABELS[supplier.status]}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {rfq.purchaseOrderNumber && (
              <p className="text-xs text-muted-foreground">
                Awarded to {rfq.awardedSupplierName} on {rfq.purchaseOrderNumber}
              </p>
            )}
          </div>
        )}
        mobileCard={(rfq) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">{rfq.rfqNumber}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {rfq.title} · {formatDate(rfq.issueDate)}
                </p>
              </div>
              <StatusBadge
                color={RFQ_STATUS_COLORS[rfq.status] as StatusColor}
                label={RFQ_STATUS_LABELS[rfq.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Quotes in</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(rfq.respondedCount)} / {formatNumber(rfq.supplierCount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Best quote</dt>
                <dd className="font-medium tabular-nums">
                  {rfq.respondedCount > 0 ? formatAmountValue(rfq.bestQuoteTotal) : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Replies by</dt>
                <dd className="font-medium">
                  {rfq.responseDeadline ? formatDate(rfq.responseDeadline) : "No deadline"}
                </dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <RfqRowActions rfq={rfq} {...rowActions} />
            </div>
          </div>
        )}
      />

      <RfqFormModal open={formOpen} onOpenChange={setFormOpen} rfq={editing} />

      <RecordQuoteDialog rfq={quoting} onOpenChange={(open) => !open && setQuoting(null)} />

      <AwardRfqDialog rfq={awarding} onOpenChange={(open) => !open && setAwarding(null)} />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={pending ? pendingCopy[pending.kind].title : ""}
        description={pending ? pendingCopy[pending.kind].body : ""}
        confirmText={
          pending?.kind === "close"
            ? "Close request"
            : pending?.kind === "cancel"
              ? "Cancel request"
              : "Delete"
        }
        variant={pending?.kind === "close" ? undefined : "destructive"}
        isLoading={isClosing || isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
