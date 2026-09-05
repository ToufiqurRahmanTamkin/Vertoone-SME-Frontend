import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import {
  useDeleteSupplierMutation,
  useGetSupplierSummaryQuery,
  useGetSuppliersQuery,
} from "@/redux/apis/supplierApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PAYMENT_TERM_LABELS,
  SUPPLIER_PAYMENT_TERMS,
  type Supplier,
  type SupplierPaymentTerm,
} from "@/types/domain/supplier";
import { Plus } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SupplierFormModal } from "./components/SupplierFormModal";
import { SupplierRowActions, supplierColumns } from "./suppliers.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "isActive",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
  {
    name: "paymentTerms",
    label: "Payment terms",
    type: "select",
    options: SUPPLIER_PAYMENT_TERMS.map((term) => ({
      label: PAYMENT_TERM_LABELS[term],
      value: term,
    })),
  },
];

export default function SuppliersPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const navigate = useNavigate();
  const access = useModulePermission("/sme/purchases/suppliers");
  const orderAccess = useModulePermission("/sme/purchases/orders");
  const billAccess = useModulePermission("/sme/purchases/bills");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();

  const { data, isLoading, isFetching } = useGetSuppliersQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    paymentTerms: filters.paymentTerms as SupplierPaymentTerm | undefined,
  });

  const { data: summary } = useGetSupplierSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Supplier | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Supplier | null>(null);
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteSupplier(pendingDelete._id).unwrap();
      toast.success("Supplier deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the supplier");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onViewOrders: (supplier: Supplier) =>
        navigate(`/sme/purchases/orders?supplierId=${supplier._id}`),
      onViewBills: (supplier: Supplier) =>
        navigate(`/sme/purchases/bills?supplierId=${supplier._id}`),
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canViewOrders: orderAccess.canView,
      canViewBills: billAccess.canView,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canEdit, access.canDelete, orderAccess.canView, billAccess.canView]
  );

  const columns = React.useMemo(() => supplierColumns(rowActions), [rowActions]);

  const suppliers = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Who you buy from. Purchase orders, returns and payables all point back here."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/purchases/overview" label="Purchases overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        <Stat>
          <StatLabel>Suppliers</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{formatNumber(summary?.activeCount ?? 0)}</StatValue>
          <StatDescription>Offered when raising a purchase order</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Owed to suppliers</StatLabel>
          <StatValue>{formatAmountValue(summary?.payableOutstanding ?? 0)}</StatValue>
          <StatDescription>
            Still unpaid on posted bills, on top of{" "}
            {formatAmountValue(summary?.openingBalanceTotal ?? 0)} carried in
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overdue</StatLabel>
          <StatValue>{formatAmountValue(summary?.overdueValue ?? 0)}</StatValue>
          <StatDescription>
            Across {formatNumber(summary?.suppliersWithOverdue ?? 0)} suppliers past their due date
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search suppliers..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New supplier"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} suppliers. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} suppliers your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={suppliers}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(supplier) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{supplier.name}</p>
                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                  {supplier.code}
                </p>
              </div>
              <StatusBadge
                color={supplier.isActive ? "green" : "zinc"}
                label={supplier.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="font-medium">{supplier.contactPerson || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium">{supplier.phone || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Terms</dt>
                <dd className="font-medium">{PAYMENT_TERM_LABELS[supplier.paymentTerms]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Open orders</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(supplier.openOrderCount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Owed to them</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(supplier.payableOutstanding)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <SupplierRowActions supplier={supplier} {...rowActions} />
            </div>
          </div>
        )}
      />

      <SupplierFormModal open={formOpen} onOpenChange={setFormOpen} supplier={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The supplier is removed from new purchase orders. Past records keep pointing at it."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
