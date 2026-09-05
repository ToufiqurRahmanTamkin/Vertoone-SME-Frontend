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
  useCancelDebitNoteMutation,
  useDeleteDebitNoteMutation,
  useGetDebitNoteSummaryQuery,
  useGetDebitNotesQuery,
  useIssueDebitNoteMutation,
} from "@/redux/apis/debitNoteApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEBIT_NOTE_REASONS,
  DEBIT_NOTE_REASON_LABELS,
  DEBIT_NOTE_STATUSES,
  DEBIT_NOTE_STATUS_COLORS,
  DEBIT_NOTE_STATUS_LABELS,
  type DebitNote,
  type DebitNoteReason,
  type DebitNoteStatus,
} from "@/types/domain/debitNote";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ApplyDebitNoteDialog } from "./components/ApplyDebitNoteDialog";
import { DebitNoteFormModal } from "./components/DebitNoteFormModal";
import { DebitNoteRowActions, debitNoteColumns } from "./debit-notes.columns";

type PendingAction = { kind: "cancel" | "delete"; note: DebitNote } | null;

export default function DebitNotesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/purchases/debit-notes");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: suppliers = [] } = useGetSupplierOptionsQuery();

  const { data, isLoading, isFetching } = useGetDebitNotesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as DebitNoteStatus | undefined,
    reason: filters.reason as DebitNoteReason | undefined,
    supplierId: filters.supplierId as string | undefined,
  });

  const { data: summary } = useGetDebitNoteSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DebitNote | null>(null);
  const [applying, setApplying] = React.useState<DebitNote | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [issueNote] = useIssueDebitNoteMutation();
  const [cancelNote, { isLoading: isCancelling }] = useCancelDebitNoteMutation();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteDebitNoteMutation();

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
        options: DEBIT_NOTE_STATUSES.map((status) => ({
          label: DEBIT_NOTE_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "reason",
        label: "Reason",
        type: "select",
        options: DEBIT_NOTE_REASONS.map((reason) => ({
          label: DEBIT_NOTE_REASON_LABELS[reason],
          value: reason,
        })),
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
      onEdit: (note: DebitNote) => {
        setEditing(note);
        setFormOpen(true);
      },
      onIssue: (note: DebitNote) =>
        void run(
          issueNote(note._id).unwrap(),
          `${note.debitNoteNumber} issued to the supplier`,
          "Could not issue this debit note"
        ),
      onApply: setApplying,
      onCancel: (note: DebitNote) => setPending({ kind: "cancel", note }),
      onDelete: (note: DebitNote) => setPending({ kind: "delete", note }),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => debitNoteColumns(rowActions), [rowActions]);

  const confirmPending = async () => {
    if (!pending) return;

    if (pending.kind === "cancel") {
      await run(
        cancelNote(pending.note._id).unwrap(),
        `${pending.note.debitNoteNumber} cancelled`,
        "Could not cancel the debit note"
      );
    } else {
      await run(
        deleteNote(pending.note._id).unwrap(),
        "Debit note deleted",
        "Could not delete the debit note"
      );
    }

    setPending(null);
  };

  const notes = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Debit notes"
        description="What you are claiming back from suppliers, and how much of it has come off their bills."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/purchases/overview" label="Purchases overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Debit notes</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Claimed</StatLabel>
          <StatValue>{formatAmountValue(summary?.raisedValue)}</StatValue>
          <StatDescription>
            Across {formatNumber((summary?.issuedCount ?? 0) + (summary?.appliedCount ?? 0))}{" "}
            issued notes
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Still to claim</StatLabel>
          <StatValue>{formatAmountValue(summary?.unappliedValue)}</StatValue>
          <StatDescription>Not yet set against a bill</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>In draft</StatLabel>
          <StatValue>{formatNumber(summary?.draftCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.appliedCount ?? 0)} fully applied
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search debit notes..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New debit note"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} debit notes. Delete one or upgrade to add more.`
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
        data={notes}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(note) => (
          <div className="space-y-3">
            <ul className="divide-y rounded-lg border">
              {note.items.map((item) => (
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
                  <span className="shrink-0 tabular-nums">{formatAmountValue(item.total)}</span>
                </li>
              ))}
            </ul>
            {note.applications.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Applied to{" "}
                {note.applications
                  .map((entry) => `${entry.billNumber} (${formatAmountValue(entry.amount)})`)
                  .join(", ")}
              </p>
            )}
          </div>
        )}
        mobileCard={(note) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">
                  {note.debitNoteNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {note.supplier?.name ?? note.supplierName} · {formatDate(note.noteDate)}
                </p>
              </div>
              <StatusBadge
                color={DEBIT_NOTE_STATUS_COLORS[note.status] as StatusColor}
                label={DEBIT_NOTE_STATUS_LABELS[note.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Why</dt>
                <dd className="font-medium">{DEBIT_NOTE_REASON_LABELS[note.reason]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Value</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(note.grandTotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Still to claim</dt>
                <dd className="font-medium tabular-nums">{formatAmountValue(note.balance)}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <DebitNoteRowActions note={note} {...rowActions} />
            </div>
          </div>
        )}
      />

      <DebitNoteFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        note={editing}
        presetSupplierId={(filters.supplierId as string | undefined) ?? null}
      />

      <ApplyDebitNoteDialog
        note={applying}
        onOpenChange={(open) => !open && setApplying(null)}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.kind === "cancel"
            ? `Cancel ${pending.note.debitNoteNumber}?`
            : `Delete ${pending?.note.debitNoteNumber ?? ""}?`
        }
        description={
          pending?.kind === "cancel"
            ? "Anything it has already taken off a bill is put back on."
            : "Only notes that have not been set against a bill can be deleted."
        }
        confirmText={pending?.kind === "cancel" ? "Cancel note" : "Delete"}
        variant="destructive"
        isLoading={isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
