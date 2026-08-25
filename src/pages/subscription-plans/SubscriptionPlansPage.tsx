import { AlertCircle, Package, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, humanizeEnum } from "@/lib/format";
import {
  useDeleteSubscriptionPlanMutation,
  useGetSubscriptionPlansQuery,
} from "@/redux/apis/subscriptionPlanApi";
import { BILLING_CYCLES, type BillingCycle, type SubscriptionPlan } from "@/types";
import { PlanFormDialog } from "./PlanFormDialog";

const ALL = "ALL";

const describeLimit = (value: number | null): string =>
  value === null || value === undefined ? "∞" : String(value);

export default function SubscriptionPlansPage() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [cycle, setCycle] = React.useState<BillingCycle | typeof ALL>(ALL);
  const [status, setStatus] = React.useState<"ALL" | "active" | "inactive">(ALL);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isFetching, isError, error } = useGetSubscriptionPlansQuery({
    page,
    limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(cycle !== ALL ? { billingCycle: cycle } : {}),
    ...(status !== ALL ? { isActive: status === "active" } : {}),
  });

  const [deletePlan, { isLoading: isDeleting }] = useDeleteSubscriptionPlanMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SubscriptionPlan | undefined>();
  const [pendingDelete, setPendingDelete] = React.useState<SubscriptionPlan | undefined>();

  // Any filter change invalidates the current page number.
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, cycle, status, limit]);

  const openCreate = () => {
    setEditing(undefined);
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
      setPendingDelete(undefined);
    } catch (deleteError) {
      // The API refuses to delete a plan that has sales — surface that reason.
      toast.error(getApiErrorMessage(deleteError, "Could not delete the plan"));
    }
  };

  const plans = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Subscription Plans"
        description="The catalogue customers can be sold."
        actions={
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="size-4" />
            New plan
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search plans…"
                className="pl-9"
              />
            </div>

            <Select
              value={cycle}
              onValueChange={(value) => setCycle(value as BillingCycle | typeof ALL)}
            >
              <SelectTrigger className="w-full cursor-pointer sm:w-48">
                <SelectValue placeholder="Billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All cycles</SelectItem>
                {BILLING_CYCLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {humanizeEnum(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as "ALL" | "active" | "inactive")}
            >
              <SelectTrigger className="w-full cursor-pointer sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isError ? (
            <EmptyState
              icon={AlertCircle}
              title="Could not load plans"
              description={getApiErrorMessage(error, "The server did not respond.")}
            />
          ) : isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No plans found"
              description={
                debouncedSearch || cycle !== ALL || status !== ALL
                  ? "No plan matches these filters."
                  : "Create your first subscription plan to start selling."
              }
              action={
                <Button className="cursor-pointer" onClick={openCreate}>
                  <Plus className="size-4" />
                  New plan
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto" data-fetching={isFetching}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Cycle</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Users</TableHead>
                      <TableHead className="text-center">Branches</TableHead>
                      <TableHead className="text-center">Trial</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{plan.name}</span>
                            {plan.isPopular && (
                              <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            )}
                          </div>
                          {plan.description && (
                            <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-muted-foreground">
                              {plan.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {humanizeEnum(plan.billingCycle)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                          {formatCurrency(plan.price, plan.currency)}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          {describeLimit(plan.limits?.users ?? null)}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          {describeLimit(plan.limits?.branches ?? null)}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          {plan.trialDays > 0 ? `${plan.trialDays}d` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer"
                              onClick={() => openEdit(plan)}
                              aria-label={`Edit ${plan.name}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer text-destructive hover:text-destructive"
                              onClick={() => setPendingDelete(plan)}
                              aria-label={`Delete ${plan.name}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <PaginationBar meta={data?.meta} onPageChange={setPage} onLimitChange={setLimit} />
            </>
          )}
        </CardContent>
      </Card>

      <PlanFormDialog open={formOpen} onOpenChange={setFormOpen} plan={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="This cannot be undone. Plans that already have sales cannot be deleted — deactivate them instead."
        confirmText="Delete plan"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
