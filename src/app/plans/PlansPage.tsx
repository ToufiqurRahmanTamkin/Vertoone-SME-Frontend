import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { BILLING_CYCLE_LABELS, toOptions } from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useDeletePlanMutation, useGetPlansQuery } from "@/redux/apis/planApis";
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
    // The backend parses this as the literal string "true"/"false", so it is
    // forwarded as-is rather than coerced to a boolean here.
    isActive: filters.isActive as unknown as boolean | undefined,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SubscriptionPlan | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<SubscriptionPlan | null>(null);
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();

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
      // A plan with sales cannot be deleted — the server explains why, so
      // surface its message rather than a generic failure.
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the plan");
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () => planColumns({ onEdit: openEdit, onDelete: setPendingDelete }),
    []
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
        actions={
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            New plan
          </Button>
        }
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
          <PlanMobileCard plan={plan} onEdit={openEdit} onDelete={setPendingDelete} />
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
