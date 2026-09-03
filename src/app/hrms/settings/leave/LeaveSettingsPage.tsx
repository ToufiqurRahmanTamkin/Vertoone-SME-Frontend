import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetAiAllowanceQuery } from "@/redux/apis/aiApis";
import { useGetHrmsSettingsQuery } from "@/redux/apis/hrmsSettingsApis";
import {
  useDeleteLeaveTypeMutation,
  useGetLeaveTypeSummaryQuery,
  useGetLeaveTypesQuery,
  useRestoreDefaultLeaveTypesMutation,
} from "@/redux/apis/leaveTypeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { LEAVE_ACCRUAL_LABELS, type LeaveType } from "@/types/domain/leaveType";
import { Bot, Loader2, Plus, Sparkles } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AiLeaveTypesModal } from "./components/AiLeaveTypesModal";
import { LeavePolicyForm } from "./components/LeavePolicyForm";
import { LeaveTypeFormModal } from "./components/LeaveTypeFormModal";
import { LeaveTypeRowMenu, leaveTypeColumns } from "./leaveTypes.columns";

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
    name: "isPaid",
    label: "Pay",
    type: "select",
    options: [
      { label: "Paid", value: "true" },
      { label: "Unpaid", value: "false" },
    ],
  },
];

export default function LeaveSettingsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/settings/leave");

  const { data, isLoading, isFetching } = useGetLeaveTypesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    isPaid: filters.isPaid === undefined ? undefined : filters.isPaid === "true",
  });

  const { data: summary } = useGetLeaveTypeSummaryQuery();
  const { data: settings, isLoading: isLoadingSettings } = useGetHrmsSettingsQuery();
  const { data: ai } = useGetAiAllowanceQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [aiOpen, setAiOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LeaveType | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<LeaveType | null>(null);
  const [deleteLeaveType, { isLoading: isDeleting }] = useDeleteLeaveTypeMutation();
  const [restoreDefaults, { isLoading: isRestoring }] = useRestoreDefaultLeaveTypesMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: (leaveType: LeaveType) => {
        setEditing(leaveType);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => leaveTypeColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteLeaveType(pendingDelete._id).unwrap();
      toast.success("Leave type deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the leave type");
    }
  };

  const loadDefaults = async () => {
    try {
      const created = await restoreDefaults().unwrap();
      toast.success(
        created.length > 0
          ? `${created.length} standard leave types added`
          : "Every standard leave type is already set up"
      );
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not load the standard leave types");
    }
  };

  const leaveTypes = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;
  const isEmpty = !isLoading && used === 0;

  return (
    <>
      <PageHeader
        title="Leave"
        description="The leave types your people can request, and the policy every request is checked against."
        actions={<BackLink to="/hrms/settings/overview" label="All settings" />}
      />

      <Tabs defaultValue="types" className="gap-4">
        <TabsList>
          <TabsTrigger value="types">Leave types</TabsTrigger>
          <TabsTrigger value="policy">Leave policy</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="flex flex-col gap-4">
          <StatGrid className="sm:grid-cols-4">
            <Stat>
              <StatLabel>Leave types</StatLabel>
              <StatValue>{used}</StatValue>
              <StatDescription>
                {limit === null
                  ? "Unlimited on your plan"
                  : `${used} of ${limit} allowed by your plan`}
              </StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Active</StatLabel>
              <StatValue>{summary?.activeCount ?? 0}</StatValue>
              <StatDescription>Offered when somebody requests leave</StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Paid days a year</StatLabel>
              <StatValue>{summary?.totalPaidDays ?? 0}</StatValue>
              <StatDescription>
                Across {summary?.paidCount ?? 0} paid leave types
              </StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Carry forward</StatLabel>
              <StatValue>{summary?.carryForwardCount ?? 0}</StatValue>
              <StatDescription>Types whose unused days roll over</StatDescription>
            </Stat>
          </StatGrid>

          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search leave types..."
            filters={FILTERS}
            currentFilters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetching}
            actions={
              access.canCreate && (
                <>
                  {ai?.isConfigured && (
                    <ActionButton
                      icon={Bot}
                      label="Generate with AI"
                      variant="outline"
                      onClick={() => setAiOpen(true)}
                      disabled={isLimitReached}
                      title={
                        isLimitReached
                          ? `Your plan allows ${limit} leave types. Delete one or upgrade to add more.`
                          : undefined
                      }
                    />
                  )}
                  <ActionButton
                    icon={Plus}
                    label="New leave type"
                    onClick={openCreate}
                    disabled={isLimitReached}
                    title={
                      isLimitReached
                        ? `Your plan allows ${limit} leave types. Delete one or upgrade to add more.`
                        : undefined
                    }
                  />
                </>
              )
            }
          />

          {isEmpty && access.canCreate && (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">No leave types yet</p>
                <p className="text-sm text-muted-foreground">
                  Load the standard set — casual, sick, annual, bereavement, maternity, paternity
                  and unpaid — then adjust the day counts to match your policy.
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0 cursor-pointer"
                onClick={() => void loadDefaults()}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Load the standard set
              </Button>
            </div>
          )}

          {isLimitReached && (
            <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
              You have used all {limit} leave types your plan allows. Delete one or upgrade your
              subscription to add more.
            </p>
          )}

          <DataTable
            columns={columns}
            data={leaveTypes}
            isLoading={isLoading}
            pagination={
              meta
                ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
                : undefined
            }
            onPageChange={(page) => setFilter("page", page)}
            onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
            getRowId={(row) => row._id}
            mobileCard={(leaveType) => (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: leaveType.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{leaveType.name}</p>
                      <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                        {leaveType.code}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    color={leaveType.isActive ? "green" : "zinc"}
                    label={leaveType.isActive ? "Active" : "Inactive"}
                  />
                </div>

                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Days a year</dt>
                    <dd className="font-medium">{leaveType.daysPerYear}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Granted</dt>
                    <dd className="font-medium">{LEAVE_ACCRUAL_LABELS[leaveType.accrual]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Pay</dt>
                    <dd className="font-medium">{leaveType.isPaid ? "Paid" : "Unpaid"}</dd>
                  </div>
                </dl>

                <div className="mt-3 border-t pt-3">
                  <LeaveTypeRowMenu leaveType={leaveType} actions={rowActions} />
                </div>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="policy">
          {isLoadingSettings || !settings ? (
            <LoadingSpinner />
          ) : (
            <LeavePolicyForm
              key={settings.updatedAt}
              leave={settings.leave}
              canEdit={access.canEdit}
            />
          )}
        </TabsContent>
      </Tabs>

      <LeaveTypeFormModal open={formOpen} onOpenChange={setFormOpen} leaveType={editing} />

      <AiLeaveTypesModal
        open={aiOpen}
        onOpenChange={setAiOpen}
        remaining={limit === null ? null : Math.max(0, limit - used)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="Employees will no longer be able to request this leave type. Records already logged against it are kept."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
