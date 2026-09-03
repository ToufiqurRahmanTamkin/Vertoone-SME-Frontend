import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDate } from "@/lib/date";
import {
  useDeleteDocumentMutation,
  useDownloadDocumentMutation,
  useGetDocumentFoldersQuery,
  useGetDocumentSummaryQuery,
  useGetDocumentsQuery,
} from "@/redux/apis/documentApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_COLORS,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_VISIBILITIES,
  DOCUMENT_VISIBILITY_COLORS,
  DOCUMENT_VISIBILITY_SHORT_LABELS,
  formatFileSize,
  type CompanyDocument,
  type DocumentCategory,
  type DocumentVisibility,
} from "@/types/domain/document";
import { FileText, FolderOpen, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { DocumentFormModal } from "./components/DocumentFormModal";
import { DocumentVersionModal } from "./components/DocumentVersionModal";
import { DocumentRowActions, documentColumns } from "./documents.columns";

export default function AllDocumentsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/company/documents/all-documents");

  const { data, isLoading, isFetching } = useGetDocumentsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    category: filters.category as DocumentCategory | undefined,
    visibility: filters.visibility as DocumentVisibility | undefined,
    folder: typeof filters.folder === "string" ? filters.folder : undefined,
    ownerId: typeof filters.ownerId === "string" ? filters.ownerId : undefined,
    isArchived: filters.isArchived === undefined ? undefined : filters.isArchived === "true",
    expiringOnly: filters.expiringOnly === "true" ? true : undefined,
  });

  const { data: summary } = useGetDocumentSummaryQuery();
  const { data: folders = [] } = useGetDocumentFoldersQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [versionOpen, setVersionOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CompanyDocument | null>(null);
  const [versioning, setVersioning] = React.useState<CompanyDocument | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<CompanyDocument | null>(null);

  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();
  const [downloadDocument] = useDownloadDocumentMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = React.useCallback((document: CompanyDocument) => {
    setEditing(document);
    setFormOpen(true);
  }, []);

  const openVersion = React.useCallback((document: CompanyDocument) => {
    setVersioning(document);
    setVersionOpen(true);
  }, []);

  const openFile = React.useCallback(
    async (document: CompanyDocument) => {
      window.open(document.file.url, "_blank", "noopener,noreferrer");
      try {
        await downloadDocument(document._id).unwrap();
      } catch {
        // the file already opened; the counter is a nicety
      }
    },
    [downloadDocument]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteDocument(pendingDelete._id).unwrap();
      toast.success("Document deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the document");
    } finally {
      setPendingDelete(null);
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onOpen: openFile,
      onEdit: openEdit,
      onNewVersion: openVersion,
      onDownload: openFile,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [openFile, openEdit, openVersion, access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => documentColumns(rowActions), [rowActions]);

  const tableFilters = React.useMemo<FilterConfig[]>(() => {
    const base: FilterConfig[] = [
      {
        name: "category",
        label: "Category",
        type: "select",
        options: DOCUMENT_CATEGORIES.map((category) => ({
          label: DOCUMENT_CATEGORY_LABELS[category],
          value: category,
        })),
      },
      {
        name: "visibility",
        label: "Visibility",
        type: "select",
        options: DOCUMENT_VISIBILITIES.map((visibility) => ({
          label: DOCUMENT_VISIBILITY_SHORT_LABELS[visibility],
          value: visibility,
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
        name: "isArchived",
        label: "Archived",
        type: "select",
        options: [
          { label: "Active", value: "false" },
          { label: "Archived", value: "true" },
        ],
      },
      {
        name: "expiringOnly",
        label: "Expiry",
        type: "select",
        options: [{ label: "Expiring or expired", value: "true" }],
      },
    ];

    if (folders.length === 0) return base;

    return [
      {
        name: "folder",
        label: "Folder",
        type: "select",
        options: folders.map((folder) => ({ label: folder, value: folder })),
      },
      ...base,
    ];
  }, [folders, employeeOptions]);

  const documents = data?.data ?? [];
  const meta = data?.meta;
  const limit = summary?.limit ?? access.limit;
  const used = summary?.used ?? 0;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="All documents"
        description="Every file your company keeps, who can reach it, and when it stops being valid."
      />

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        <Stat>
          <StatLabel>Documents</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>
            {limit === null
              ? `${summary?.archivedCount ?? 0} archived`
              : `${used} of ${limit} used · ${summary?.archivedCount ?? 0} archived`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Storage used</StatLabel>
          <StatValue>{formatFileSize(summary?.totalSize ?? 0)}</StatValue>
          <StatDescription>Across {summary?.folderCount ?? 0} folder(s)</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Expiring soon</StatLabel>
          <StatValue>{summary?.expiringCount ?? 0}</StatValue>
          <StatDescription>{summary?.expiredCount ?? 0} already expired</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Restricted</StatLabel>
          <StatValue>{(summary?.sharedCount ?? 0) + (summary?.privateCount ?? 0)}</StatValue>
          <StatDescription>
            {summary?.sharedCount ?? 0} shared · {summary?.privateCount ?? 0} private
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by title, description, file name or folder..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Add document"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} documents. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={documents}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(value) => setFilter("limit", value)}
        getRowId={(row) => row._id}
        mobileCard={(document) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                  <FileText className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{document.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-mono uppercase">{document.file.extension}</span>
                    {" · "}
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
              </div>
              <StatusBadge
                color={DOCUMENT_VISIBILITY_COLORS[document.visibility]}
                label={DOCUMENT_VISIBILITY_SHORT_LABELS[document.visibility]}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge
                color={DOCUMENT_CATEGORY_COLORS[document.category]}
                label={DOCUMENT_CATEGORY_LABELS[document.category]}
              />
              <Badge variant="outline" className="text-[10px]">
                <FolderOpen className="size-3" />
                {document.folder}
              </Badge>
              {document.expiresAt && (
                <StatusBadge
                  color={document.isExpired ? "red" : document.isExpiringSoon ? "amber" : "zinc"}
                  label={`${document.isExpired ? "Expired" : "Expires"} ${formatDate(
                    document.expiresAt
                  )}`}
                />
              )}
            </div>

            {document.tags.length > 0 && (
              <div className="mt-2">
                <TagList tags={document.tags} emptyLabel="" />
              </div>
            )}

            <div className="mt-3 border-t pt-3">
              <DocumentRowActions document={document} {...rowActions} />
            </div>
          </div>
        )}
      />

      <DocumentFormModal open={formOpen} onOpenChange={setFormOpen} document={editing} />

      <DocumentVersionModal
        open={versionOpen}
        onOpenChange={setVersionOpen}
        document={versioning}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="The record goes away and the file stops being reachable from here. Anything already downloaded is unaffected."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
