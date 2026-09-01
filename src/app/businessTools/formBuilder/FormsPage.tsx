import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useDeleteFormMutation,
  useDuplicateFormMutation,
  useGetFormSummaryQuery,
  useGetFormsQuery,
  usePublishFormMutation,
  useUnpublishFormMutation,
} from "@/redux/apis/formBuilderApis";
import type { FormListItem, FormStatus } from "@/types/domain/formBuilder";
import { Plus } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FormFormModal } from "./components/FormFormModal";
import { FormRowActions, type FormRowActionHandlers } from "./components/FormRowActions";
import { FormShareDialog } from "./components/FormShareDialog";
import { absoluteFormUrl } from "./formBuilder.utils";
import { formColumns } from "./forms.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Live", value: "PUBLISHED" },
      { label: "Draft", value: "DRAFT" },
    ],
  },
];

export default function FormsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/business-tools/form-builder");

  const { data, isLoading, isFetching } = useGetFormsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as FormStatus | undefined,
  });

  const { data: summary } = useGetFormSummaryQuery();

  const [publishForm] = usePublishFormMutation();
  const [unpublishForm] = useUnpublishFormMutation();
  const [duplicateForm] = useDuplicateFormMutation();
  const [deleteForm, { isLoading: isDeleting }] = useDeleteFormMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [shareTarget, setShareTarget] = React.useState<FormListItem | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<FormListItem | null>(null);

  const forms = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.totalForms ?? 0;
  const limit = summary?.formLimit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const run = React.useCallback(
    async (action: Promise<unknown>, success: string, fallback: string) => {
      try {
        await action;
        toast.success(success);
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || fallback);
      }
    },
    []
  );

  const togglePublished = React.useCallback(
    (form: FormListItem) =>
      form.status === "PUBLISHED"
        ? run(
            unpublishForm(form._id).unwrap(),
            "Form taken offline",
            "Could not take the form offline"
          )
        : run(publishForm(form._id).unwrap(), "Form published", "Could not publish the form"),
    [publishForm, unpublishForm, run]
  );

  const duplicate = React.useCallback(
    (form: FormListItem) =>
      run(duplicateForm(form._id).unwrap(), "Form duplicated", "Could not duplicate the form"),
    [duplicateForm, run]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    await run(
      deleteForm(pendingDelete._id).unwrap(),
      "Form deleted",
      "Could not delete the form"
    );
    setPendingDelete(null);
  };

  const rowActions = React.useMemo<FormRowActionHandlers>(
    () => ({
      onShare: setShareTarget,
      onTogglePublished: (form) => void togglePublished(form),
      onDuplicate: (form) => void duplicate(form),
      onDelete: setPendingDelete,
      canCreate: access.canCreate,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canCreate, access.canEdit, access.canDelete, togglePublished, duplicate]
  );

  const columns = React.useMemo(() => formColumns(rowActions), [rowActions]);

  return (
    <>
      <PageHeader
        title="Form Builder"
        description="Build a form, publish it, then share the link or drop it straight onto one of your websites."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Forms</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Live</StatLabel>
          <StatValue>{summary?.publishedForms ?? 0}</StatValue>
          <StatDescription>Reachable by anyone with the link</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Responses</StatLabel>
          <StatValue>{summary?.totalSubmissions ?? 0}</StatValue>
          <StatDescription>Across every form</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>This month</StatLabel>
          <StatValue>{summary?.submissionsThisMonth ?? 0}</StatValue>
          <StatDescription>Responses since the 1st</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search forms..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New form"
              onClick={() => setFormOpen(true)}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} forms. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} forms your plan allows. Delete one or upgrade your subscription
          to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={forms}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(form) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/business-tools/form-builder/${form._id}`}
                  className="block truncate text-sm font-semibold hover:underline"
                >
                  {form.name}
                </Link>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">
                  {absoluteFormUrl(form.publicUrl, form.publicPath)}
                </span>
              </div>
              <StatusBadge
                color={form.status === "PUBLISHED" ? "green" : "zinc"}
                label={form.status === "PUBLISHED" ? "Live" : "Draft"}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="tabular-nums">
                {form.fieldCount} questions
              </Badge>
              <Badge variant="outline" className="tabular-nums">
                {form.submissionCount} responses
              </Badge>
              {form.hasUnpublishedChanges && <Badge variant="outline">Changes pending</Badge>}
            </div>

            <div className="mt-3 border-t pt-3">
              <FormRowActions form={form} {...rowActions} />
            </div>
          </div>
        )}
      />

      <FormFormModal open={formOpen} onOpenChange={setFormOpen} />

      <FormShareDialog
        form={shareTarget}
        onOpenChange={(open) => !open && setShareTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The form goes offline straight away and its responses are removed with it. Export them first if you need them."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
