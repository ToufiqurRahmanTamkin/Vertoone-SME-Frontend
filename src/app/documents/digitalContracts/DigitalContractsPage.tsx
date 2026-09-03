import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useCancelContractMutation,
  useDeleteContractMutation,
  useGetContractSummaryQuery,
  useGetContractsQuery,
  useSendContractMutation,
} from "@/redux/apis/contractApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CONTRACT_STATUSES,
  CONTRACT_STATUS_COLORS,
  CONTRACT_STATUS_LABELS,
  type Contract,
  type ContractStatus,
} from "@/types/domain/contract";
import { Plus } from "lucide-react";
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ContractDetailSheet } from "./components/ContractDetailSheet";
import { ContractFormModal } from "./components/ContractFormModal";
import { ContractRowActions, contractColumns } from "./contracts.columns";

export default function DigitalContractsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const [searchParams, setSearchParams] = useSearchParams();
  const access = useModulePermission("/company/documents/digital-contracts");

  const { data, isLoading, isFetching } = useGetContractsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as ContractStatus | undefined,
    ownerId: typeof filters.ownerId === "string" ? filters.ownerId : undefined,
    openOnly: filters.openOnly === "true" ? true : undefined,
    expiringOnly: filters.expiringOnly === "true" ? true : undefined,
  });

  const { data: summary } = useGetContractSummaryQuery();
  const { data: config } = useGetSystemConfigQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Contract | null>(null);
  const [viewing, setViewing] = React.useState<Contract | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Contract | null>(null);
  const [pendingCancel, setPendingCancel] = React.useState<Contract | null>(null);

  const [deleteContract, { isLoading: isDeleting }] = useDeleteContractMutation();
  const [cancelContract, { isLoading: isCancelling }] = useCancelContractMutation();
  const [sendContract] = useSendContractMutation();

  const contracts = React.useMemo(() => data?.data ?? [], [data]);

  const openFromQuery = searchParams.get("open");
  const requested = openFromQuery
    ? contracts.find((contract) => contract._id === openFromQuery)
    : undefined;
  const [handledQuery, setHandledQuery] = React.useState<string | null>(null);

  if (requested && handledQuery !== requested._id) {
    setHandledQuery(requested._id);
    setViewing(requested);
    setDetailOpen(true);
    searchParams.delete("open");
    setSearchParams(searchParams, { replace: true });
  }

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openDetail = React.useCallback((contract: Contract) => {
    setViewing(contract);
    setDetailOpen(true);
  }, []);

  const openEdit = React.useCallback((contract: Contract) => {
    setEditing(contract);
    setFormOpen(true);
  }, []);

  const onSend = React.useCallback(
    async (contract: Contract) => {
      try {
        await sendContract(contract._id).unwrap();
        toast.success(`"${contract.title}" is out for signature`);
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not send the contract");
      }
    },
    [sendContract]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteContract(pendingDelete._id).unwrap();
      toast.success("Contract deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the contract");
    } finally {
      setPendingDelete(null);
    }
  };

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    try {
      await cancelContract(pendingCancel._id).unwrap();
      toast.success("Contract cancelled");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not cancel the contract");
    } finally {
      setPendingCancel(null);
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onOpen: openDetail,
      onEdit: openEdit,
      onSend,
      onCancel: setPendingCancel,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [openDetail, openEdit, onSend, access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => contractColumns(rowActions), [rowActions]);

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: CONTRACT_STATUSES.map((status) => ({
          label: CONTRACT_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "ownerId",
        label: "Owner",
        type: "select",
        options: employeeOptions.map((employee) => ({
          label: employee.name,
          value: employee._id,
        })),
      },
      {
        name: "openOnly",
        label: "Open only",
        type: "select",
        options: [{ label: "Still in flight", value: "true" }],
      },
      {
        name: "expiringOnly",
        label: "Deadline",
        type: "select",
        options: [{ label: "Deadline approaching", value: "true" }],
      },
    ],
    [employeeOptions]
  );

  const meta = data?.meta;
  const currency = config?.defaultCurrency ?? "BDT";
  const limit = summary?.limit ?? access.limit;
  const used = summary?.used ?? 0;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Digital contracts"
        description="Send a document for signature, watch who has opened it, and keep the audit trail behind every signature."
      />

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        <Stat>
          <StatLabel>Out for signature</StatLabel>
          <StatValue>{summary?.awaitingCount ?? 0}</StatValue>
          <StatDescription>
            {summary?.draftCount ?? 0} still in draft · {summary?.expiringCount ?? 0} near deadline
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Signed</StatLabel>
          <StatValue>{summary?.signedCount ?? 0}</StatValue>
          <StatDescription>
            {summary?.declinedCount ?? 0} declined · {summary?.expiredCount ?? 0} expired
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Signed value</StatLabel>
          <StatValue>{formatAmount(summary?.signedValue ?? 0, currency)}</StatValue>
          <StatDescription>
            {formatAmount(summary?.totalValue ?? 0, currency)} across every contract
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Average turnaround</StatLabel>
          <StatValue>{summary?.averageDaysToSign ?? 0}d</StatValue>
          <StatDescription>From sending to the last signature</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by number, title or other party..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New contract"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} contracts. Upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={contracts}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(value) => setFilter("limit", value)}
        getRowId={(row) => row._id}
        mobileCard={(contract) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{contract.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="font-mono uppercase">{contract.contractNumber}</span>
                  {contract.counterpartyName ? ` · ${contract.counterpartyName}` : ""}
                </p>
              </div>
              <StatusBadge
                color={CONTRACT_STATUS_COLORS[contract.status]}
                label={CONTRACT_STATUS_LABELS[contract.status]}
              />
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="tabular-nums">
                  {contract.signedCount}/{contract.signerCount} signed
                </span>
                <span className="text-muted-foreground">{contract.progress}%</span>
              </div>
              <Progress value={contract.progress} className="mt-1 h-1.5" />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {contract.value > 0 && (
                <span className="text-xs font-medium tabular-nums">
                  {formatAmount(contract.value, contract.currency)}
                </span>
              )}
              {contract.expiresAt && (
                <StatusBadge
                  color={contract.isExpired ? "red" : contract.isExpiringSoon ? "amber" : "zinc"}
                  label={`${contract.isExpired ? "Expired" : "Due"} ${formatDate(
                    contract.expiresAt
                  )}`}
                />
              )}
            </div>

            <div className="mt-3 border-t pt-3">
              <ContractRowActions contract={contract} {...rowActions} />
            </div>
          </div>
        )}
      />

      <ContractFormModal open={formOpen} onOpenChange={setFormOpen} contract={editing} />

      <ContractDetailSheet
        contract={viewing}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEditContract={(contract) => {
          setDetailOpen(false);
          openEdit(contract);
        }}
        canEdit={access.canEdit}
      />

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title={`Cancel "${pendingCancel?.title ?? ""}"?`}
        description="Every outstanding signing link stops working. Signatures already given are kept on the record."
        confirmText="Cancel the contract"
        variant="destructive"
        isLoading={isCancelling}
        onConfirm={confirmCancel}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="This removes the contract and its audit trail. A fully signed contract cannot be deleted."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
