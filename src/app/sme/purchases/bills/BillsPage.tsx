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
  useCancelBillMutation,
  useDeleteBillMutation,
  useGetBillSummaryQuery,
  useGetBillsQuery,
  usePostBillMutation,
} from "@/redux/apis/billApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  BILL_STATUSES,
  BILL_STATUS_COLORS,
  BILL_STATUS_LABELS,
  type Bill,
  type BillStatus,
} from "@/types/domain/bill";
import { Plus } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PaymentFormModal } from "../payments/components/PaymentFormModal";
import { BillRowActions, billColumns } from "./bills.columns";
import { BillFormModal } from "./components/BillFormModal";

type PendingAction = { kind: "cancel" | "delete"; bill: Bill } | null;

export default function BillsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const navigate = useNavigate();
  const access = useModulePermission("/sme/purchases/bills");
  const paymentAccess = useModulePermission("/sme/purchases/payments");
  const debitNoteAccess = useModulePermission("/sme/purchases/debit-notes");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: suppliers = [] } = useGetSupplierOptionsQuery();

  const { data, isLoading, isFetching } = useGetBillsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as BillStatus | undefined,
    supplierId: filters.supplierId as string | undefined,
    overdue: filters.overdue as "yes" | "no" | undefined,
  });

  const { data: summary } = useGetBillSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Bill | null>(null);
  const [paying, setPaying] = React.useState<Bill | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [postBill] = usePostBillMutation();
  const [cancelBill, { isLoading: isCancelling }] = useCancelBillMutation();
  const [deleteBill, { isLoading: isDeleting }] = useDeleteBillMutation();

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
        options: BILL_STATUSES.map((status) => ({
          label: BILL_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "overdue",
        label: "Overdue",
        type: "select",
        options: [
          { label: "Past due", value: "yes" },
          { label: "Not yet due", value: "no" },
        ],
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
      onEdit: (bill: Bill) => {
        setEditing(bill);
        setFormOpen(true);
      },
      onPost: (bill: Bill) =>
        void run(
          postBill(bill._id).unwrap(),
          `${bill.billNumber} posted to your payables`,
          "Could not post this bill"
        ),
      onPay: setPaying,
      onDebitNote: (bill: Bill) =>
        navigate(`/sme/purchases/debit-notes?supplierId=${bill.supplierId}`),
      onCancel: (bill: Bill) => setPending({ kind: "cancel", bill }),
      onDelete: (bill: Bill) => setPending({ kind: "delete", bill }),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canPay: paymentAccess.canCreate,
      canRaiseDebitNote: debitNoteAccess.canCreate,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canEdit, access.canDelete, paymentAccess.canCreate, debitNoteAccess.canCreate]
  );

  const columns = React.useMemo(() => billColumns(rowActions), [rowActions]);

  const confirmPending = async () => {
    if (!pending) return;

    if (pending.kind === "cancel") {
      await run(
        cancelBill(pending.bill._id).unwrap(),
        `${pending.bill.billNumber} cancelled`,
        "Could not cancel the bill"
      );
    } else {
      await run(
        deleteBill(pending.bill._id).unwrap(),
        "Bill deleted",
        "Could not delete the bill"
      );
    }

    setPending(null);
  };

  const bills = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Bills"
        description="Supplier invoices matched to what you received, and what you still owe on each one."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/purchases/overview" label="Purchases overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Bills</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Owed to suppliers</StatLabel>
          <StatValue>{formatAmountValue(summary?.outstanding)}</StatValue>
          <StatDescription>
            Across {formatNumber(summary?.openCount ?? 0)} open bills
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overdue</StatLabel>
          <StatValue>{formatAmountValue(summary?.overdueValue)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.overdueCount ?? 0)} bills past their due date
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Due this week</StatLabel>
          <StatValue>{formatAmountValue(summary?.dueThisWeek)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.draftCount ?? 0)} bills still in draft
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search bills by number, invoice or supplier..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New bill"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} bills. Delete one or upgrade to add more.`
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
        data={bills}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(bill) => (
          <div className="space-y-3">
            <ul className="divide-y rounded-lg border">
              {bill.items.map((item) => (
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
                      {formatNumber(item.quantity)} × {formatAmountValue(item.unitPrice)}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {formatAmountValue(item.total)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Paid {formatAmountValue(bill.amountPaid)}</span>
              <span>Credited {formatAmountValue(bill.creditApplied)}</span>
              <span>Still owed {formatAmountValue(bill.amountDue)}</span>
            </div>
          </div>
        )}
        mobileCard={(bill) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">{bill.billNumber}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {bill.supplier?.name ?? bill.supplierName} · {formatDate(bill.billDate)}
                </p>
              </div>
              <StatusBadge
                color={BILL_STATUS_COLORS[bill.status] as StatusColor}
                label={BILL_STATUS_LABELS[bill.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(bill.grandTotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Still owed</dt>
                <dd className="font-medium tabular-nums">{formatAmountValue(bill.amountDue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Due</dt>
                <dd className="font-medium">
                  {bill.dueDate ? formatDate(bill.dueDate) : "No due date"}
                </dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <BillRowActions bill={bill} {...rowActions} />
            </div>
          </div>
        )}
      />

      <BillFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        bill={editing}
        presetSupplierId={(filters.supplierId as string | undefined) ?? null}
      />

      <PaymentFormModal
        open={Boolean(paying)}
        onOpenChange={(open) => !open && setPaying(null)}
        presetSupplierId={paying?.supplierId ?? null}
        presetBillId={paying?._id ?? null}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.kind === "cancel"
            ? `Cancel ${pending.bill.billNumber}?`
            : `Delete ${pending?.bill.billNumber ?? ""}?`
        }
        description={
          pending?.kind === "cancel"
            ? "The goods receipts it covered go back to waiting for a bill."
            : "Only bills with nothing paid or credited against them can be deleted."
        }
        confirmText={pending?.kind === "cancel" ? "Cancel bill" : "Delete"}
        variant="destructive"
        isLoading={isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
