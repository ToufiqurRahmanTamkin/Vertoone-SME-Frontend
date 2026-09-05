import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Textarea } from "@/components/ui/textarea";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import {
  useApprovePurchaseRequisitionMutation,
  useCancelPurchaseRequisitionMutation,
  useDeletePurchaseRequisitionMutation,
  useGetPurchaseRequisitionSummaryQuery,
  useGetPurchaseRequisitionsQuery,
  useRejectPurchaseRequisitionMutation,
  useSubmitPurchaseRequisitionMutation,
} from "@/redux/apis/purchaseRequisitionApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PURCHASE_REQUISITION_PRIORITIES,
  PURCHASE_REQUISITION_PRIORITY_LABELS,
  PURCHASE_REQUISITION_STATUSES,
  PURCHASE_REQUISITION_STATUS_COLORS,
  PURCHASE_REQUISITION_STATUS_LABELS,
  type PurchaseRequisition,
  type PurchaseRequisitionPriority,
  type PurchaseRequisitionStatus,
} from "@/types/domain/purchaseRequisition";
import { Loader2, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ConvertRequisitionDialog } from "./components/ConvertRequisitionDialog";
import { RequisitionFormModal } from "./components/RequisitionFormModal";
import { RequisitionRowActions, requisitionColumns } from "./requisitions.columns";

type PendingAction = { kind: "cancel" | "delete"; requisition: PurchaseRequisition } | null;

export default function RequisitionsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/purchases/requisitions");
  const orderAccess = useModulePermission("/sme/purchases/orders");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();
  const { data: departments = [] } = useGetDepartmentOptionsQuery();

  const { data, isLoading, isFetching } = useGetPurchaseRequisitionsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as PurchaseRequisitionStatus | undefined,
    priority: filters.priority as PurchaseRequisitionPriority | undefined,
    warehouseId: filters.warehouseId as string | undefined,
    departmentId: filters.departmentId as string | undefined,
  });

  const { data: summary } = useGetPurchaseRequisitionSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PurchaseRequisition | null>(null);
  const [converting, setConverting] = React.useState<PurchaseRequisition | null>(null);
  const [rejecting, setRejecting] = React.useState<PurchaseRequisition | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [submitRequisition] = useSubmitPurchaseRequisitionMutation();
  const [approveRequisition] = useApprovePurchaseRequisitionMutation();
  const [rejectRequisition, { isLoading: isRejecting }] = useRejectPurchaseRequisitionMutation();
  const [cancelRequisition, { isLoading: isCancelling }] = useCancelPurchaseRequisitionMutation();
  const [deleteRequisition, { isLoading: isDeleting }] = useDeletePurchaseRequisitionMutation();

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
        options: PURCHASE_REQUISITION_STATUSES.map((status) => ({
          label: PURCHASE_REQUISITION_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: PURCHASE_REQUISITION_PRIORITIES.map((priority) => ({
          label: PURCHASE_REQUISITION_PRIORITY_LABELS[priority],
          value: priority,
        })),
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
      {
        name: "departmentId",
        label: "Department",
        type: "select",
        options: departments.map((department) => ({
          label: department.name,
          value: department._id,
        })),
      },
    ],
    [warehouses, departments]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: (requisition: PurchaseRequisition) => {
        setEditing(requisition);
        setFormOpen(true);
      },
      onSubmit: (requisition: PurchaseRequisition) =>
        void run(
          submitRequisition(requisition._id).unwrap(),
          `${requisition.requisitionNumber} sent for approval`,
          "Could not send this for approval"
        ),
      onApprove: (requisition: PurchaseRequisition) =>
        void run(
          approveRequisition(requisition._id).unwrap(),
          `${requisition.requisitionNumber} approved`,
          "Could not approve this requisition"
        ),
      onReject: (requisition: PurchaseRequisition) => {
        setRejectReason("");
        setRejecting(requisition);
      },
      onConvert: setConverting,
      onCancel: (requisition: PurchaseRequisition) => setPending({ kind: "cancel", requisition }),
      onDelete: (requisition: PurchaseRequisition) => setPending({ kind: "delete", requisition }),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canRaiseOrder: orderAccess.canCreate,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canEdit, access.canDelete, orderAccess.canCreate]
  );

  const columns = React.useMemo(() => requisitionColumns(rowActions), [rowActions]);

  const confirmReject = async () => {
    if (!rejecting) return;
    const ok = await run(
      rejectRequisition({ id: rejecting._id, reason: rejectReason }).unwrap(),
      `${rejecting.requisitionNumber} turned down`,
      "Could not turn this requisition down"
    );
    if (ok) setRejecting(null);
  };

  const confirmPending = async () => {
    if (!pending) return;

    if (pending.kind === "cancel") {
      await run(
        cancelRequisition(pending.requisition._id).unwrap(),
        `${pending.requisition.requisitionNumber} cancelled`,
        "Could not cancel the requisition"
      );
    } else {
      await run(
        deleteRequisition(pending.requisition._id).unwrap(),
        "Requisition deleted",
        "Could not delete the requisition"
      );
    }

    setPending(null);
  };

  const requisitions = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Purchase requisitions"
        description="What the business has asked to buy, who signed it off, and what turned into an order."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/purchases/overview" label="Purchases overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Requisitions</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Waiting on you</StatLabel>
          <StatValue>{formatNumber(summary?.awaitingApprovalCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.draftCount ?? 0)} still in draft
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Approved, not ordered</StatLabel>
          <StatValue>{formatNumber(summary?.approvedCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.overdueCount ?? 0)} already past their needed-by date
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Estimated spend</StatLabel>
          <StatValue>{formatAmountValue(summary?.estimatedValue)}</StatValue>
          <StatDescription>
            {formatAmountValue(summary?.awaitingValue)} of it still waiting for approval
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search requisitions..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New requisition"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} requisitions. Delete one or upgrade to add more.`
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
        data={requisitions}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(requisition) => (
          <div className="space-y-3">
            <ul className="divide-y rounded-lg border">
              {requisition.items.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                      {item.sku}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular-nums">
                      {formatNumber(item.orderedQuantity)} / {formatNumber(item.quantity)} ordered
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {formatAmountValue(item.estimatedTotal)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            {requisition.purchaseOrderNumbers.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Turned into {requisition.purchaseOrderNumbers.join(", ")}
              </p>
            )}
            {requisition.rfqNumbers.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Quoted on {requisition.rfqNumbers.join(", ")}
              </p>
            )}
            {requisition.rejectionReason && (
              <p className="text-xs text-destructive">
                Turned down: {requisition.rejectionReason}
              </p>
            )}
          </div>
        )}
        mobileCard={(requisition) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">
                  {requisition.requisitionNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {requisition.title} · {formatDate(requisition.requisitionDate)}
                </p>
              </div>
              <StatusBadge
                color={PURCHASE_REQUISITION_STATUS_COLORS[requisition.status] as StatusColor}
                label={PURCHASE_REQUISITION_STATUS_LABELS[requisition.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Needed by</dt>
                <dd className="font-medium">
                  {requisition.requiredBy ? formatDate(requisition.requiredBy) : "No date"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lines</dt>
                <dd className="font-medium tabular-nums">{requisition.items.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estimated</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(requisition.estimatedTotal)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <RequisitionRowActions requisition={requisition} {...rowActions} />
            </div>
          </div>
        )}
      />

      <RequisitionFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        requisition={editing}
      />

      <ConvertRequisitionDialog
        requisition={converting}
        onOpenChange={(open) => !open && setConverting(null)}
      />

      <Dialog open={Boolean(rejecting)} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Turn down {rejecting?.requisitionNumber ?? ""}?</DialogTitle>
            <DialogDescription>
              Tell whoever raised it why, so they can put it right and send it back.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <Textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Budget is not approved for this quarter"
              rows={3}
            />
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejecting(null)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmReject}
              disabled={isRejecting}
            >
              {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Turn down
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.kind === "cancel"
            ? `Cancel ${pending.requisition.requisitionNumber}?`
            : `Delete ${pending?.requisition.requisitionNumber ?? ""}?`
        }
        description={
          pending?.kind === "cancel"
            ? "A requisition that already turned into a purchase order cannot be cancelled here."
            : "Only requisitions that never became an order can be deleted."
        }
        confirmText={pending?.kind === "cancel" ? "Cancel requisition" : "Delete"}
        variant="destructive"
        isLoading={isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
