import { ActionButton } from "@/components/shared/action-button";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { RecordPaymentDialog } from "@/components/shared/record-payment-dialog";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount, formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetContactOptionsQuery } from "@/redux/apis/contactApis";
import {
  useCancelSalesReturnMutation,
  useConfirmSalesReturnMutation,
  useDeleteSalesReturnMutation,
  useGetSalesReturnSummaryQuery,
  useGetSalesReturnsQuery,
  useRefundSalesReturnMutation,
} from "@/redux/apis/salesReturnApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  SALES_RETURN_REASONS,
  SALES_RETURN_REASON_LABELS,
  SALES_RETURN_STATUSES,
  SALES_RETURN_STATUS_COLORS,
  SALES_RETURN_STATUS_LABELS,
  type SalesReturn,
  type SalesReturnReason,
  type SalesReturnStatus,
} from "@/types/domain/salesReturn";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { SalesReturnFormModal } from "./components/SalesReturnFormModal";
import { salesReturnColumns } from "./returns.columns";

type PendingAction = {
  kind: "confirm" | "cancel" | "delete";
  row: SalesReturn;
} | null;

export default function SalesReturnsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/sales/returns");

  const { data: contactOptions = [] } = useGetContactOptionsQuery();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: SALES_RETURN_STATUSES.map((status) => ({
          label: SALES_RETURN_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "reason",
        label: "Reason",
        type: "select",
        options: SALES_RETURN_REASONS.map((reason) => ({
          label: SALES_RETURN_REASON_LABELS[reason],
          value: reason,
        })),
      },
      {
        name: "customerId",
        label: "Customer",
        type: "select",
        options: contactOptions.map((contact) => ({
          label: contact.name || contact.email || contact.phone,
          value: contact._id,
        })),
      },
      {
        name: "warehouseId",
        label: "Warehouse",
        type: "select",
        options: warehouseOptions.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
    ],
    [contactOptions, warehouseOptions]
  );

  const { data, isLoading, isFetching } = useGetSalesReturnsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as SalesReturnStatus | undefined,
    reason: filters.reason as SalesReturnReason | undefined,
    customerId: filters.customerId as string | undefined,
    warehouseId: filters.warehouseId as string | undefined,
  });

  const { data: summary } = useGetSalesReturnSummaryQuery();
  const currency = summary?.currency ?? "BDT";

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SalesReturn | null>(null);
  const [refunding, setRefunding] = React.useState<SalesReturn | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [confirmReturn, { isLoading: isConfirming }] = useConfirmSalesReturnMutation();
  const [refundReturn, { isLoading: isRefunding }] = useRefundSalesReturnMutation();
  const [cancelReturn, { isLoading: isCancelling }] = useCancelSalesReturnMutation();
  const [deleteReturn, { isLoading: isDeleting }] = useDeleteSalesReturnMutation();

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

  const columns = React.useMemo(
    () =>
      salesReturnColumns({
        onEdit: (row) => {
          setEditing(row);
          setFormOpen(true);
        },
        onConfirm: (row) => setPending({ kind: "confirm", row }),
        onRefund: setRefunding,
        onCancel: (row) => setPending({ kind: "cancel", row }),
        onDelete: (row) => setPending({ kind: "delete", row }),
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const confirmPending = async () => {
    if (!pending) return;

    const { _id, returnNumber } = pending.row;

    if (pending.kind === "confirm") {
      await run(
        confirmReturn(_id).unwrap(),
        `${returnNumber} confirmed and stock taken back`,
        "Could not confirm the return"
      );
    } else if (pending.kind === "cancel") {
      await run(
        cancelReturn(_id).unwrap(),
        `${returnNumber} cancelled`,
        "Could not cancel the return"
      );
    } else {
      await run(deleteReturn(_id).unwrap(), "Return deleted", "Could not delete the return");
    }

    setPending(null);
  };

  const returns = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const copy = (() => {
    if (!pending) return { title: "", description: "", confirmText: "Confirm" };
    if (pending.kind === "confirm") {
      return {
        title: `Confirm ${pending.row.returnNumber}?`,
        description:
          "Lines marked for restock come back into the warehouse, and the amount is booked back against the invoice.",
        confirmText: "Confirm return",
      };
    }
    if (pending.kind === "cancel") {
      return {
        title: `Cancel ${pending.row.returnNumber}?`,
        description: "Any stock this return put back on the shelf is taken off again.",
        confirmText: "Cancel return",
      };
    }
    return {
      title: `Delete ${pending.row.returnNumber}?`,
      description: "Only drafts and cancelled returns can be deleted.",
      confirmText: "Delete",
    };
  })();

  return (
    <>
      <PageHeader
        title="Sales returns"
        description="Goods customers sent back, what went back on the shelf and what you still owe them."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Returns</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Draft</StatLabel>
          <StatValue>{summary?.draftCount ?? 0}</StatValue>
          <StatDescription>Not confirmed, stock untouched</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Returned value</StatLabel>
          <StatValue>{formatAmountValue(summary?.returnedValue ?? 0)}</StatValue>
          <StatDescription>
            Across {summary?.confirmedCount ?? 0} confirmed returns
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Awaiting refund</StatLabel>
          <StatValue>{formatAmountValue(summary?.awaitingRefund ?? 0)}</StatValue>
          <StatDescription>Refunds and credit notes you still owe</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search sales returns..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New return"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} sales returns. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={returns}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(row) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">{row.returnNumber}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.customer?.name ?? row.customerName} · {formatDate(row.returnDate)}
                </p>
              </div>
              <StatusBadge
                color={SALES_RETURN_STATUS_COLORS[row.status] as StatusColor}
                label={SALES_RETURN_STATUS_LABELS[row.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Units back</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(row.restockedQuantity)} / {formatNumber(row.totalQuantity)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Value</dt>
                <dd className="font-medium tabular-nums">{formatAmount(row.grandTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">To refund</dt>
                <dd className="font-medium tabular-nums">{formatAmount(row.balanceDue)}</dd>
              </div>
            </dl>
          </div>
        )}
      />

      <SalesReturnFormModal open={formOpen} onOpenChange={setFormOpen} salesReturn={editing} />

      <RecordPaymentDialog
        open={Boolean(refunding)}
        onOpenChange={(open) => !open && setRefunding(null)}
        title={`Refund ${refunding?.returnNumber ?? ""}`}
        description="Record what you refunded or credited the customer against this return."
        outstanding={refunding?.balanceDue ?? 0}
        isLoading={isRefunding}
        confirmText="Record refund"
        showMethod={false}
        amountLabel="Amount refunded"
        referenceLabel="Note"
        onSubmit={async (body) => {
          if (!refunding) return;
          const ok = await run(
            refundReturn({
              id: refunding._id,
              body: { amount: body.amount, note: body.reference },
            }).unwrap(),
            `Refund recorded on ${refunding.returnNumber}`,
            "Could not record the refund"
          );
          if (ok) setRefunding(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={copy.title}
        description={copy.description}
        confirmText={copy.confirmText}
        variant={pending?.kind === "delete" ? "destructive" : undefined}
        isLoading={isConfirming || isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
