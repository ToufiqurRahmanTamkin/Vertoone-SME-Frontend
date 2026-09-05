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
  useAllocateLandedCostMutation,
  useCancelLandedCostMutation,
  useDeleteLandedCostMutation,
  useGetLandedCostSummaryQuery,
  useGetLandedCostsQuery,
} from "@/redux/apis/landedCostApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  LANDED_COST_BASES,
  LANDED_COST_BASIS_LABELS,
  LANDED_COST_STATUSES,
  LANDED_COST_STATUS_COLORS,
  LANDED_COST_STATUS_LABELS,
  type LandedCost,
  type LandedCostBasis,
  type LandedCostStatus,
} from "@/types/domain/landedCost";
import { Plus } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LandedCostFormModal } from "./components/LandedCostFormModal";
import { LandedCostRowActions, landedCostColumns } from "./landed-costs.columns";

type PendingAction = { kind: "cancel" | "delete"; cost: LandedCost } | null;

export default function LandedCostsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const navigate = useNavigate();
  const access = useModulePermission("/sme/purchases/landed-costs");
  const receiptAccess = useModulePermission("/sme/purchases/goods-receipts");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: suppliers = [] } = useGetSupplierOptionsQuery();

  const { data, isLoading, isFetching } = useGetLandedCostsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as LandedCostStatus | undefined,
    basis: filters.basis as LandedCostBasis | undefined,
    vendorId: filters.vendorId as string | undefined,
  });

  const { data: summary } = useGetLandedCostSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LandedCost | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [allocateCost] = useAllocateLandedCostMutation();
  const [cancelCost, { isLoading: isCancelling }] = useCancelLandedCostMutation();
  const [deleteCost, { isLoading: isDeleting }] = useDeleteLandedCostMutation();

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
        options: LANDED_COST_STATUSES.map((status) => ({
          label: LANDED_COST_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "basis",
        label: "Spread by",
        type: "select",
        options: LANDED_COST_BASES.map((basis) => ({
          label: LANDED_COST_BASIS_LABELS[basis],
          value: basis,
        })),
      },
      {
        name: "vendorId",
        label: "Charged by",
        type: "select",
        options: suppliers.map((supplier) => ({ label: supplier.name, value: supplier._id })),
      },
    ],
    [suppliers]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: (cost: LandedCost) => {
        setEditing(cost);
        setFormOpen(true);
      },
      onAllocate: (cost: LandedCost) =>
        void run(
          allocateCost(cost._id).unwrap(),
          `${cost.landedCostNumber} spread across the receipts`,
          "Could not spread this cost"
        ),
      onViewReceipts: (cost: LandedCost) =>
        navigate(`/sme/purchases/goods-receipts?search=${cost.goodsReceiptNumbers[0] ?? ""}`),
      onCancel: (cost: LandedCost) => setPending({ kind: "cancel", cost }),
      onDelete: (cost: LandedCost) => setPending({ kind: "delete", cost }),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canViewReceipts: receiptAccess.canView,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canEdit, access.canDelete, receiptAccess.canView]
  );

  const columns = React.useMemo(() => landedCostColumns(rowActions), [rowActions]);

  const confirmPending = async () => {
    if (!pending) return;

    if (pending.kind === "cancel") {
      await run(
        cancelCost(pending.cost._id).unwrap(),
        `${pending.cost.landedCostNumber} cancelled`,
        "Could not cancel this landed cost"
      );
    } else {
      await run(
        deleteCost(pending.cost._id).unwrap(),
        "Landed cost deleted",
        "Could not delete this landed cost"
      );
    }

    setPending(null);
  };

  const costs = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Landed costs"
        description="Freight, duty and handling folded into the cost of the goods you received."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/purchases/overview" label="Purchases overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Landed costs</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Folded into stock</StatLabel>
          <StatValue>{formatAmountValue(summary?.totalAllocated)}</StatValue>
          <StatDescription>
            Across {formatNumber(summary?.allocatedCount ?? 0)} spread costs
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Waiting to be spread</StatLabel>
          <StatValue>{formatAmountValue(summary?.awaitingAllocation)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.draftCount ?? 0)} still in draft
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>This month</StatLabel>
          <StatValue>{formatAmountValue(summary?.thisMonth)}</StatValue>
          <StatDescription>Spread since the start of the month</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search landed costs..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New landed cost"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} landed costs. Delete one or upgrade to add more.`
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
        data={costs}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(cost) => (
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Charges
              </p>
              <ul className="divide-y rounded-lg border">
                {cost.charges.map((charge) => (
                  <li
                    key={charge._id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <span className="truncate">{charge.label}</span>
                    <span className="shrink-0 tabular-nums">
                      {formatAmountValue(charge.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Where it landed
              </p>
              <ul className="max-h-56 divide-y overflow-y-auto rounded-lg border">
                {cost.allocations.map((allocation) => (
                  <li
                    key={allocation._id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate">{allocation.name}</p>
                      <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                        {allocation.receiptNumber}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tabular-nums">{formatAmountValue(allocation.amount)}</p>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {formatAmountValue(allocation.unitAmount)} per unit
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        mobileCard={(cost) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">
                  {cost.landedCostNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {cost.vendor?.name ?? (cost.vendorName || "No vendor")} ·{" "}
                  {formatDate(cost.costDate)}
                </p>
              </div>
              <StatusBadge
                color={LANDED_COST_STATUS_COLORS[cost.status] as StatusColor}
                label={LANDED_COST_STATUS_LABELS[cost.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Charges</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(cost.totalCharge)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Spread by</dt>
                <dd className="font-medium">{LANDED_COST_BASIS_LABELS[cost.basis]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Receipts</dt>
                <dd className="font-medium">{cost.goodsReceiptNumbers.join(", ") || "—"}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <LandedCostRowActions cost={cost} {...rowActions} />
            </div>
          </div>
        )}
      />

      <LandedCostFormModal open={formOpen} onOpenChange={setFormOpen} cost={editing} />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.kind === "cancel"
            ? `Cancel ${pending.cost.landedCostNumber}?`
            : `Delete ${pending?.cost.landedCostNumber ?? ""}?`
        }
        description={
          pending?.kind === "cancel"
            ? "The uplift comes back off your stock valuation and the receipts it touched."
            : "Only costs that have not been spread yet can be deleted."
        }
        confirmText={pending?.kind === "cancel" ? "Cancel landed cost" : "Delete"}
        variant="destructive"
        isLoading={isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
