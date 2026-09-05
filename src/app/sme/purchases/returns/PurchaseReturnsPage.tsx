import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
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
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useCancelPurchaseReturnMutation,
  useConfirmPurchaseReturnMutation,
  useDeletePurchaseReturnMutation,
  useGetPurchaseReturnSummaryQuery,
  useGetPurchaseReturnsQuery,
  useSettlePurchaseReturnMutation,
} from "@/redux/apis/purchaseReturnApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PURCHASE_RETURN_REASONS,
  PURCHASE_RETURN_REASON_LABELS,
  PURCHASE_RETURN_STATUSES,
  PURCHASE_RETURN_STATUS_COLORS,
  PURCHASE_RETURN_STATUS_LABELS,
  type PurchaseReturn,
  type PurchaseReturnReason,
  type PurchaseReturnStatus,
} from "@/types/domain/purchaseReturn";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { DebitNoteFormModal } from "../debitNotes/components/DebitNoteFormModal";
import { PurchaseReturnFormModal } from "./components/PurchaseReturnFormModal";
import { PurchaseReturnRowActions, purchaseReturnColumns } from "./returns.columns";

type PendingAction =
  | { kind: "confirm" | "cancel" | "delete"; row: PurchaseReturn }
  | null;

export default function PurchaseReturnsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/purchases/returns");
  const debitNoteAccess = useModulePermission("/sme/purchases/debit-notes");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: PURCHASE_RETURN_STATUSES.map((status) => ({
          label: PURCHASE_RETURN_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "reason",
        label: "Reason",
        type: "select",
        options: PURCHASE_RETURN_REASONS.map((reason) => ({
          label: PURCHASE_RETURN_REASON_LABELS[reason],
          value: reason,
        })),
      },
      {
        name: "supplierId",
        label: "Supplier",
        type: "select",
        options: supplierOptions.map((supplier) => ({
          label: supplier.name,
          value: supplier._id,
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
    [supplierOptions, warehouseOptions]
  );

  const { data, isLoading, isFetching } = useGetPurchaseReturnsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as PurchaseReturnStatus | undefined,
    reason: filters.reason as PurchaseReturnReason | undefined,
    supplierId: filters.supplierId as string | undefined,
    warehouseId: filters.warehouseId as string | undefined,
  });

  const { data: summary } = useGetPurchaseReturnSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PurchaseReturn | null>(null);
  const [settling, setSettling] = React.useState<PurchaseReturn | null>(null);
  const [claiming, setClaiming] = React.useState<PurchaseReturn | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [confirmReturn, { isLoading: isConfirming }] = useConfirmPurchaseReturnMutation();
  const [settleReturn, { isLoading: isSettling }] = useSettlePurchaseReturnMutation();
  const [cancelReturn, { isLoading: isCancelling }] = useCancelPurchaseReturnMutation();
  const [deleteReturn, { isLoading: isDeleting }] = useDeletePurchaseReturnMutation();

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

  const rowActions = React.useMemo(
    () => ({
      onEdit: (row: PurchaseReturn) => {
        setEditing(row);
        setFormOpen(true);
      },
      onConfirm: (row: PurchaseReturn) => setPending({ kind: "confirm", row }),
      onSettle: setSettling,
      onDebitNote: setClaiming,
      onCancel: (row: PurchaseReturn) => setPending({ kind: "cancel", row }),
      onDelete: (row: PurchaseReturn) => setPending({ kind: "delete", row }),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canRaiseDebitNote: debitNoteAccess.canCreate,
    }),
    [access.canEdit, access.canDelete, debitNoteAccess.canCreate]
  );

  const columns = React.useMemo(() => purchaseReturnColumns(rowActions), [rowActions]);

  const confirmPending = async () => {
    if (!pending) return;
    const { returnNumber, _id } = pending.row;

    if (pending.kind === "confirm") {
      await run(
        confirmReturn(_id).unwrap(),
        `${returnNumber} confirmed and stock removed`,
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
          "The goods leave your warehouse and the quantity is booked back against the purchase order.",
        confirmText: "Confirm return",
      };
    }
    if (pending.kind === "cancel") {
      return {
        title: `Cancel ${pending.row.returnNumber}?`,
        description: "Any stock this return removed is put back on the shelf.",
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
        title="Purchase returns"
        description="Goods going back to suppliers, and the credits or refunds still owed to you."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/purchases/overview" label="Purchases overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Returns</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Draft</StatLabel>
          <StatValue>{formatNumber(summary?.draftCount ?? 0)}</StatValue>
          <StatDescription>Not confirmed, stock untouched</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Returned value</StatLabel>
          <StatValue>{formatAmountValue(summary?.returnedValue ?? 0)}</StatValue>
          <StatDescription>
            Across {formatNumber(summary?.confirmedCount ?? 0)} confirmed returns
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Awaiting settlement</StatLabel>
          <StatValue>{formatAmountValue(summary?.awaitingSettlement ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.awaitingDebitNote ?? 0)} confirmed returns have no debit note yet
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search purchase returns..."
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
                  ? `Your plan allows ${limit} purchase returns. Delete one or upgrade to add more.`
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
                  {row.supplier?.name ?? row.supplierName} · {formatDate(row.returnDate)}
                </p>
              </div>
              <StatusBadge
                color={PURCHASE_RETURN_STATUS_COLORS[row.status] as StatusColor}
                label={PURCHASE_RETURN_STATUS_LABELS[row.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Reason</dt>
                <dd className="font-medium">{PURCHASE_RETURN_REASON_LABELS[row.reason]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Units</dt>
                <dd className="font-medium tabular-nums">{formatNumber(row.totalQuantity)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Value</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(row.grandTotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Debit note</dt>
                <dd className="font-medium">
                  {row.debitNoteNumber || "Not raised yet"}
                </dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <PurchaseReturnRowActions purchaseReturn={row} {...rowActions} />
            </div>
          </div>
        )}
      />

      <PurchaseReturnFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        purchaseReturn={editing}
      />

      <DebitNoteFormModal
        open={Boolean(claiming)}
        onOpenChange={(open) => !open && setClaiming(null)}
        presetSupplierId={claiming?.supplierId ?? null}
        presetPurchaseReturnId={claiming?._id ?? null}
      />

      <RecordPaymentDialog
        open={Boolean(settling)}
        onOpenChange={(open) => !open && setSettling(null)}
        title={`Settle ${settling?.returnNumber ?? ""}`}
        description="Record what the supplier credited or refunded against this return."
        outstanding={settling?.balanceDue ?? 0}
        isLoading={isSettling}
        confirmText="Record settlement"
        showMethod={false}
        amountLabel="Amount settled"
        referenceLabel="Note"
        onSubmit={async (body) => {
          if (!settling) return;
          const ok = await run(
            settleReturn({
              id: settling._id,
              body: { amount: body.amount, note: body.reference },
            }).unwrap(),
            `Settlement recorded on ${settling.returnNumber}`,
            "Could not record the settlement"
          );
          if (ok) setSettling(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={copy.title}
        description={copy.description}
        confirmText={copy.confirmText}
        variant={pending?.kind === "confirm" ? undefined : "destructive"}
        isLoading={isConfirming || isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
