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
  useDeletePaymentMadeMutation,
  useGetPaymentMadeSummaryQuery,
  useGetPaymentsMadeQuery,
  useVoidPaymentMadeMutation,
} from "@/redux/apis/paymentMadeApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PAYMENT_MADE_STATUSES,
  PAYMENT_MADE_STATUS_COLORS,
  PAYMENT_MADE_STATUS_LABELS,
  type PaymentMade,
  type PaymentMadeStatus,
} from "@/types/domain/paymentMade";
import {
  TRADE_PAYMENT_METHODS,
  TRADE_PAYMENT_METHOD_LABELS,
  type TradePaymentMethod,
} from "@/types/domain/trade";
import { Plus } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PaymentFormModal } from "./components/PaymentFormModal";
import { PaymentRowActions, paymentColumns } from "./payments.columns";

type PendingAction = { kind: "void" | "delete"; payment: PaymentMade } | null;

export default function PaymentsMadePage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const navigate = useNavigate();
  const access = useModulePermission("/sme/purchases/payments");
  const billAccess = useModulePermission("/sme/purchases/bills");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: suppliers = [] } = useGetSupplierOptionsQuery();

  const { data, isLoading, isFetching } = useGetPaymentsMadeQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as PaymentMadeStatus | undefined,
    method: filters.method as TradePaymentMethod | undefined,
    supplierId: filters.supplierId as string | undefined,
  });

  const { data: summary } = useGetPaymentMadeSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [voidPayment, { isLoading: isVoiding }] = useVoidPaymentMadeMutation();
  const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMadeMutation();

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
        options: PAYMENT_MADE_STATUSES.map((status) => ({
          label: PAYMENT_MADE_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "method",
        label: "Method",
        type: "select",
        options: TRADE_PAYMENT_METHODS.map((method) => ({
          label: TRADE_PAYMENT_METHOD_LABELS[method],
          value: method,
        })),
      },
      {
        name: "supplierId",
        label: "Supplier",
        type: "select",
        options: suppliers.map((supplier) => ({ label: supplier.name, value: supplier._id })),
      },
    ],
    [suppliers]
  );

  const rowActions = React.useMemo(
    () => ({
      onVoid: (payment: PaymentMade) => setPending({ kind: "void", payment }),
      onViewBills: (payment: PaymentMade) =>
        navigate(`/sme/purchases/bills?search=${payment.allocations[0]?.billNumber ?? ""}`),
      onDelete: (payment: PaymentMade) => setPending({ kind: "delete", payment }),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canViewBills: billAccess.canView,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canEdit, access.canDelete, billAccess.canView]
  );

  const columns = React.useMemo(() => paymentColumns(rowActions), [rowActions]);

  const confirmPending = async () => {
    if (!pending) return;

    if (pending.kind === "void") {
      await run(
        voidPayment(pending.payment._id).unwrap(),
        `${pending.payment.paymentNumber} voided`,
        "Could not void the payment"
      );
    } else {
      await run(
        deletePayment(pending.payment._id).unwrap(),
        "Payment deleted",
        "Could not delete the payment"
      );
    }

    setPending(null);
  };

  const payments = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Payments made"
        description="Money that has gone out to suppliers, what it settled, and what is still sitting unapplied."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/purchases/overview" label="Purchases overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Payments</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Paid this month</StatLabel>
          <StatValue>{formatAmountValue(summary?.paidThisMonth)}</StatValue>
          <StatDescription>
            {formatAmountValue(summary?.totalPaid)} paid all time
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Advances on orders</StatLabel>
          <StatValue>{formatAmountValue(summary?.advanceAmount)}</StatValue>
          <StatDescription>Paid before the supplier billed you</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Unapplied</StatLabel>
          <StatValue>{formatAmountValue(summary?.unappliedAmount)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.voidCount ?? 0)} payments voided
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search payments by number, reference or supplier..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Record a payment"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} payments. Delete one or upgrade to add more.`
                  : undefined
              }
              onClick={() => setFormOpen(true)}
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(payment) =>
          payment.allocations.length > 0 ? (
            <ul className="divide-y rounded-lg border">
              {payment.allocations.map((allocation) => (
                <li
                  key={allocation._id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <span className="truncate font-mono text-xs uppercase">
                    {allocation.billNumber}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatAmountValue(allocation.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {payment.purchaseOrderNumber
                ? `Paid as an advance on ${payment.purchaseOrderNumber}.`
                : "This payment has not been set against a bill yet."}
            </p>
          )
        }
        mobileCard={(payment) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">
                  {payment.paymentNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {payment.supplier?.name ?? payment.supplierName} ·{" "}
                  {formatDate(payment.paymentDate)}
                </p>
              </div>
              <StatusBadge
                color={PAYMENT_MADE_STATUS_COLORS[payment.status] as StatusColor}
                label={PAYMENT_MADE_STATUS_LABELS[payment.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-medium tabular-nums">{formatAmountValue(payment.amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Method</dt>
                <dd className="font-medium">{TRADE_PAYMENT_METHOD_LABELS[payment.method]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Settled</dt>
                <dd className="font-medium">
                  {payment.purchaseOrderNumber ||
                    payment.allocations.map((entry) => entry.billNumber).join(", ") ||
                    "Nothing yet"}
                </dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <PaymentRowActions payment={payment} {...rowActions} />
            </div>
          </div>
        )}
      />

      <PaymentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        presetSupplierId={(filters.supplierId as string | undefined) ?? null}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.kind === "void"
            ? `Void ${pending.payment.paymentNumber}?`
            : `Delete ${pending?.payment.paymentNumber ?? ""}?`
        }
        description={
          pending?.kind === "void"
            ? "Everything this payment settled goes back to being owed."
            : "Only a voided payment can be deleted."
        }
        confirmText={pending?.kind === "void" ? "Void payment" : "Delete"}
        variant="destructive"
        isLoading={isVoiding || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
