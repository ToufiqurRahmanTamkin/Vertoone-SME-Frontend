import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { BILLING_CYCLE_LABELS, toOptions } from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useClonePlanMutation,
  useDeletePlanMutation,
  useGetPlansQuery,
  useUpdatePlanMutation,
} from "@/redux/apis/planApis";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { BillingCycle, SubscriptionPlan } from "@/types/domain/plan";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PlanFormModal } from "./components/PlanFormModal";
import { PlanMobileCard } from "./components/PlanMobileCard";
import { planColumns } from "./plans.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "billingCycle",
    label: "Cycle",
    type: "select",
    options: toOptions(BILLING_CYCLE_LABELS),
  },
  {
    name: "isActive",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];

export default function PlansPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const { data: config } = useGetSystemConfigQuery();

  const { data, isLoading, isFetching } = useGetPlansQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    billingCycle: filters.billingCycle as BillingCycle | undefined,
    isActive: filters.isActive as unknown as boolean | undefined,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SubscriptionPlan | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<SubscriptionPlan | null>(null);
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const [clonePlan] = useClonePlanMutation();
  const [togglingPlanId, setTogglingPlanId] = React.useState<string | null>(null);
  const [cloningPlanId, setCloningPlanId] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditing(plan);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePlan(pendingDelete._id).unwrap();
      toast.success("Plan deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the plan");
      setPendingDelete(null);
    }
  };

  const handleClone = React.useCallback(
    async (plan: SubscriptionPlan) => {
      setCloningPlanId(plan._id);
      try {
        const created = await clonePlan({ id: plan._id }).unwrap();
        toast.success(`"${created.name}" created as an inactive draft`);
        setEditing(created);
        setFormOpen(true);
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not clone the plan");
      } finally {
        setCloningPlanId(null);
      }
    },
    [clonePlan]
  );

  const toggleAutoRenew = React.useCallback(
    async (plan: SubscriptionPlan, enabled: boolean) => {
      setTogglingPlanId(plan._id);
      try {
        await updatePlan({ id: plan._id, body: { autoRenewEnabled: enabled } }).unwrap();
        toast.success(
          enabled ? `Auto renew turned on for ${plan.name}` : `Auto renew turned off for ${plan.name}`
        );
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not change auto renew");
      } finally {
        setTogglingPlanId(null);
      }
    },
    [updatePlan]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onClone: handleClone,
      onDelete: setPendingDelete,
      cloningPlanId,
    }),
    [handleClone, cloningPlanId]
  );

  const columns = React.useMemo(
    () => planColumns({ ...rowActions, onToggleAutoRenew: toggleAutoRenew, togglingPlanId }),
    [rowActions, toggleAutoRenew, togglingPlanId]
  );

  const plans = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Subscription Plans"
        description="The plans customers can be sold. Deactivate a plan to retire it without touching existing sales."
      />

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search plans..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={<ActionButton icon={Plus} label="New plan" onClick={openCreate} />}
      />

      <DataTable
        columns={columns}
        data={plans}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(plan) => (
          <PlanMobileCard
            plan={plan}
            {...rowActions}
            onToggleAutoRenew={toggleAutoRenew}
            isToggling={togglingPlanId === plan._id}
          />
        )}
      />

      <PlanFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        plan={editing}
        defaultCurrency={config?.defaultCurrency ?? "BDT"}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="This cannot be undone. A plan that already has sold subscriptions cannot be deleted — deactivate it instead."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
