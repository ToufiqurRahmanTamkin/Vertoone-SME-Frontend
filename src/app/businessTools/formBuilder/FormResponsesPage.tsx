import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import envConfig from "@/config/envConfig";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { selectCurrentToken } from "@/redux/authSlice";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  submissionsExportUrl,
  useDeleteSubmissionMutation,
  useGetFormQuery,
  useGetSubmissionSummaryQuery,
  useGetSubmissionsQuery,
  useMarkSubmissionsReadMutation,
  useUpdateSubmissionMutation,
} from "@/redux/apis/formBuilderApis";
import type { SubmissionListItem } from "@/types/domain/formBuilder";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCheck, Download } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  SubmissionRowActions,
  type SubmissionRowActionHandlers,
} from "./components/SubmissionRowActions";
import { SubmissionDetailSheet } from "./components/SubmissionDetailSheet";

const FILTERS: FilterConfig[] = [
  {
    name: "isRead",
    label: "Read",
    type: "select",
    options: [
      { label: "Unread", value: "false" },
      { label: "Read", value: "true" },
    ],
  },
  {
    name: "isSpam",
    label: "Spam",
    type: "select",
    options: [
      { label: "Not spam", value: "false" },
      { label: "Spam only", value: "true" },
    ],
  },
];

const toBoolean = (value: string | number | undefined): boolean | undefined =>
  value === undefined ? undefined : String(value) === "true";

export default function FormResponsesPage() {
  const { formId = "" } = useParams<{ formId: string }>();
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/business-tools/form-builder");
  const token = useSelector(selectCurrentToken);

  const { data: form, isLoading: isLoadingForm, isError } = useGetFormQuery(formId, {
    skip: !formId,
  });

  const { data, isLoading, isFetching } = useGetSubmissionsQuery(
    {
      formId,
      query: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        isRead: toBoolean(filters.isRead),
        isSpam: toBoolean(filters.isSpam),
      },
    },
    { skip: !formId }
  );

  const { data: summary } = useGetSubmissionSummaryQuery(formId, { skip: !formId });

  const [updateSubmission] = useUpdateSubmissionMutation();
  const [markAllRead, { isLoading: isMarking }] = useMarkSubmissionsReadMutation();
  const [deleteSubmission, { isLoading: isDeleting }] = useDeleteSubmissionMutation();

  const [openId, setOpenId] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const submissions = data?.data ?? [];
  const meta = data?.meta;

  const run = async (action: Promise<unknown>, success: string, fallback: string) => {
    try {
      await action;
      toast.success(success);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || fallback);
    }
  };

  const exportCsv = async () => {
    setIsExporting(true);

    try {
      const response = await fetch(`${envConfig.apiBaseUrl}${submissionsExportUrl(formId)}`, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${form?.slug ?? "form"}-responses.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Responses exported");
    } catch {
      toast.error("Could not export the responses");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSpam = React.useCallback(
    (submission: SubmissionListItem) =>
      void run(
        updateSubmission({
          formId,
          id: submission._id,
          body: { isSpam: !submission.isSpam },
        }).unwrap(),
        submission.isSpam ? "No longer marked as spam" : "Marked as spam",
        "Could not update the response"
      ),
    [formId, updateSubmission]
  );

  const rowActions = React.useMemo<SubmissionRowActionHandlers>(
    () => ({
      onOpen: (submission) => setOpenId(submission._id),
      onToggleSpam: toggleSpam,
      onDelete: (submission) => setPendingDelete(submission._id),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [toggleSpam, access.canEdit, access.canDelete]
  );

  const columns = React.useMemo<ColumnDef<SubmissionListItem>[]>(
    () => [
      {
        accessorKey: "summary",
        header: "Response",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setOpenId(row.original._id)}
            className="flex min-w-0 flex-col items-start text-left"
          >
            <span className="flex items-center gap-2">
              {!row.original.isRead && (
                <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
              )}
              <span className="truncate text-sm font-medium hover:underline">
                {row.original.contactName || row.original.contactEmail || "Response"}
              </span>
            </span>
            <span className="line-clamp-1 text-[11px] text-muted-foreground">
              {row.original.summary || "No answers"}
            </span>
          </button>
        ),
      },
      {
        accessorKey: "contactEmail",
        header: "Email",
        cell: ({ row }) => (
          <span className="truncate text-sm text-muted-foreground">
            {row.original.contactEmail || "—"}
          </span>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {row.original.source === "EMBEDDED" ? "Website" : "Link"}
            </Badge>
            {row.original.isSpam && <StatusBadge color="red" label="Spam" />}
          </div>
        ),
      },
      {
        accessorKey: "submittedAt",
        header: "Received",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {new Date(row.original.submittedAt).toLocaleString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <SubmissionRowActions submission={row.original} {...rowActions} />,
      },
    ],
    [rowActions]
  );

  if (isLoadingForm) {
    return <LoadingSpinner />;
  }

  if (isError || !form) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">This form is not available</p>
        <BackLink
          to="/crm/business-tools/form-builder"
          label="All forms"
          variant="outline"
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`${form.name} · Responses`}
        description={
          form.behaviour.storeSubmissions
            ? "Everything people have sent through this form."
            : "This form is not keeping responses. Turn “Keep responses” on in the form settings to start storing them."
        }
        actions={
          <>
            <BackLink to={`/crm/business-tools/form-builder/${formId}`} label="Back to the form" />
            <Button
              variant="outline"
              size="sm"
              disabled={!access.canEdit || isMarking || (summary?.unreadSubmissions ?? 0) === 0}
              onClick={() =>
                void run(
                  markAllRead(formId).unwrap(),
                  "Everything marked as read",
                  "Could not mark them as read"
                )
              }
            >
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
            <Button
              size="sm"
              disabled={isExporting || (summary?.totalSubmissions ?? 0) === 0}
              onClick={() => void exportCsv()}
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Responses</StatLabel>
          <StatValue>{summary?.totalSubmissions ?? 0}</StatValue>
          <StatDescription>Stored for this form</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Unread</StatLabel>
          <StatValue>{summary?.unreadSubmissions ?? 0}</StatValue>
          <StatDescription>Nobody has opened these yet</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Last 7 days</StatLabel>
          <StatValue>{summary?.submissionsThisWeek ?? 0}</StatValue>
          <StatDescription>Arrived this week</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Marked spam</StatLabel>
          <StatValue>{summary?.spamSubmissions ?? 0}</StatValue>
          <StatDescription>Filtered out of your counts</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search responses..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      <DataTable
        columns={columns}
        data={submissions}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(submission) => (
          <div className="rounded-xl border bg-card p-4">
            <button
              type="button"
              onClick={() => setOpenId(submission._id)}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="flex items-center gap-2">
                    {!submission.isRead && (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    )}
                    <span className="truncate text-sm font-semibold">
                      {submission.contactName || submission.contactEmail || "Response"}
                    </span>
                  </span>
                  <span className="line-clamp-2 text-[11px] text-muted-foreground">
                    {submission.summary || "No answers"}
                  </span>
                </div>
                {submission.isSpam && <StatusBadge color="red" label="Spam" />}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </button>

            <div className="mt-3 border-t pt-3">
              <SubmissionRowActions submission={submission} {...rowActions} />
            </div>
          </div>
        )}
      />

      <SubmissionDetailSheet
        formId={formId}
        submissionId={openId}
        canEdit={access.canEdit}
        canDelete={access.canDelete}
        onOpenChange={(open) => !open && setOpenId(null)}
        onToggleSpam={(id, isSpam) =>
          void run(
            updateSubmission({ formId, id, body: { isSpam } }).unwrap(),
            isSpam ? "Marked as spam" : "No longer marked as spam",
            "Could not update the response"
          )
        }
        onDelete={(id) => {
          setOpenId(null);
          setPendingDelete(id);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this response?"
        description="It is removed from your list. Export first if you need a copy."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await run(
            deleteSubmission({ formId, id: pendingDelete }).unwrap(),
            "Response deleted",
            "Could not delete the response"
          );
          setPendingDelete(null);
        }}
      />
    </>
  );
}
