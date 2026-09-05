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
  useCancelGoodsReceiptMutation,
  useDeleteGoodsReceiptMutation,
  useGetGoodsReceiptSummaryQuery,
  useGetGoodsReceiptsQuery,
  usePostGoodsReceiptMutation,
} from "@/redux/apis/goodsReceiptApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  GOODS_RECEIPT_STATUSES,
  GOODS_RECEIPT_STATUS_COLORS,
  GOODS_RECEIPT_STATUS_LABELS,
  type GoodsReceipt,
  type GoodsReceiptStatus,
} from "@/types/domain/goodsReceipt";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { BillFormModal } from "../bills/components/BillFormModal";
import { GoodsReceiptFormModal } from "./components/GoodsReceiptFormModal";
import { GoodsReceiptRowActions, goodsReceiptColumns } from "./goods-receipts.columns";

type PendingAction = { kind: "cancel" | "delete"; receipt: GoodsReceipt } | null;

export default function GoodsReceiptsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/purchases/goods-receipts");
  const billAccess = useModulePermission("/sme/purchases/bills");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: suppliers = [] } = useGetSupplierOptionsQuery();
  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();

  const { data, isLoading, isFetching } = useGetGoodsReceiptsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as GoodsReceiptStatus | undefined,
    supplierId: filters.supplierId as string | undefined,
    warehouseId: filters.warehouseId as string | undefined,
    billed: filters.billed as "yes" | "no" | undefined,
  });

  const { data: summary } = useGetGoodsReceiptSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GoodsReceipt | null>(null);
  const [billing, setBilling] = React.useState<GoodsReceipt | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const billingReceiptIds = React.useMemo(
    () => (billing ? [billing._id] : []),
    [billing]
  );

  const [postReceipt] = usePostGoodsReceiptMutation();
  const [cancelReceipt, { isLoading: isCancelling }] = useCancelGoodsReceiptMutation();
  const [deleteReceipt, { isLoading: isDeleting }] = useDeleteGoodsReceiptMutation();

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
        options: GOODS_RECEIPT_STATUSES.map((status) => ({
          label: GOODS_RECEIPT_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "billed",
        label: "Billed",
        type: "select",
        options: [
          { label: "On a bill", value: "yes" },
          { label: "Not billed yet", value: "no" },
        ],
      },
      {
        name: "supplierId",
        label: "Supplier",
        type: "select",
        options: suppliers.map((supplier) => ({ label: supplier.name, value: supplier._id })),
      },
      {
        name: "warehouseId",
        label: "Warehouse",
        type: "select",
        options: warehouses.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
    ],
    [suppliers, warehouses]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: (receipt: GoodsReceipt) => {
        setEditing(receipt);
        setFormOpen(true);
      },
      onPost: (receipt: GoodsReceipt) =>
        void run(
          postReceipt(receipt._id).unwrap(),
          `Stock booked in on ${receipt.receiptNumber}`,
          "Could not book this receipt into stock"
        ),
      onBill: setBilling,
      onCancel: (receipt: GoodsReceipt) => setPending({ kind: "cancel", receipt }),
      onDelete: (receipt: GoodsReceipt) => setPending({ kind: "delete", receipt }),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canRaiseBill: billAccess.canCreate,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canEdit, access.canDelete, billAccess.canCreate]
  );

  const columns = React.useMemo(() => goodsReceiptColumns(rowActions), [rowActions]);

  const confirmPending = async () => {
    if (!pending) return;

    if (pending.kind === "cancel") {
      await run(
        cancelReceipt(pending.receipt._id).unwrap(),
        `${pending.receipt.receiptNumber} cancelled`,
        "Could not cancel the receipt"
      );
    } else {
      await run(
        deleteReceipt(pending.receipt._id).unwrap(),
        "Receipt deleted",
        "Could not delete the receipt"
      );
    }

    setPending(null);
  };

  const receipts = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Goods receipts"
        description="What actually arrived against each purchase order, what you sent back, and what is still waiting for a bill."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/purchases/overview" label="Purchases overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Receipts</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Booked into stock</StatLabel>
          <StatValue>{formatNumber(summary?.receivedCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.draftCount ?? 0)} still sitting in draft
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Waiting on a bill</StatLabel>
          <StatValue>{formatNumber(summary?.awaitingBillCount ?? 0)}</StatValue>
          <StatDescription>
            {formatAmountValue(summary?.awaitingBillValue)} the supplier has not invoiced
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Received value</StatLabel>
          <StatValue>{formatAmountValue(summary?.receivedValue)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.rejectedUnits ?? 0)} units turned away at the door
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search receipts by number, order or delivery note..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Book in a delivery"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} receipts. Delete one or upgrade to add more.`
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
        data={receipts}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(receipt) => (
          <ul className="divide-y rounded-lg border">
            {receipt.items.map((item) => (
              <li
                key={item._id}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                    {item.sku}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular-nums">
                    {formatNumber(item.quantity)} in
                    {item.rejectedQuantity > 0
                      ? ` · ${formatNumber(item.rejectedQuantity)} rejected`
                      : ""}
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {formatAmountValue(item.totalCost)}
                    {item.landedUnitCost > 0
                      ? ` · ${formatAmountValue(item.landedUnitCost)} landed per unit`
                      : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        mobileCard={(receipt) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">
                  {receipt.receiptNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {receipt.supplier?.name ?? receipt.supplierName} ·{" "}
                  {formatDate(receipt.receiptDate)}
                </p>
              </div>
              <StatusBadge
                color={GOODS_RECEIPT_STATUS_COLORS[receipt.status] as StatusColor}
                label={GOODS_RECEIPT_STATUS_LABELS[receipt.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Against</dt>
                <dd className="font-mono font-medium uppercase">
                  {receipt.purchaseOrderNumber}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Units</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(receipt.totalQuantity)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Value</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(receipt.totalValue)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Billed</dt>
                <dd className="font-medium">{receipt.billNumber || "Not yet"}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <GoodsReceiptRowActions receipt={receipt} {...rowActions} />
            </div>
          </div>
        )}
      />

      <GoodsReceiptFormModal open={formOpen} onOpenChange={setFormOpen} receipt={editing} />

      <BillFormModal
        open={Boolean(billing)}
        onOpenChange={(open) => !open && setBilling(null)}
        presetSupplierId={billing?.supplierId ?? null}
        presetReceiptIds={billingReceiptIds}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.kind === "cancel"
            ? `Cancel ${pending.receipt.receiptNumber}?`
            : `Delete ${pending?.receipt.receiptNumber ?? ""}?`
        }
        description={
          pending?.kind === "cancel"
            ? "The stock it brought in is taken back out and the purchase order reopens."
            : "Only draft receipts that never moved stock can be deleted."
        }
        confirmText={pending?.kind === "cancel" ? "Cancel receipt" : "Delete"}
        variant="destructive"
        isLoading={isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
