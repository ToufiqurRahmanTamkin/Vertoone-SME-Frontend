import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetContactTypeOptionsQuery } from "@/redux/apis/contactTypeApis";
import {
  useDeleteContactMutation,
  useGetContactSummaryQuery,
  useGetContactsQuery,
} from "@/redux/apis/contactApis";
import { useGetLeadSourceOptionsQuery } from "@/redux/apis/leadSourceApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CONTACT_STATUS_COLORS,
  CONTACT_STATUS_LABELS,
  CONTACT_STATUSES,
  type Contact,
  type ContactStatus,
} from "@/types/domain/contact";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ContactFormModal } from "./components/ContactFormModal";
import { ContactRowActions, contactColumns } from "./contacts.columns";

export default function ContactsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/contacts");

  const { data: contactTypeOptions = [] } = useGetContactTypeOptionsQuery();
  const { data: leadSourceOptions = [] } = useGetLeadSourceOptionsQuery();

  const { data, isLoading, isFetching } = useGetContactsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    status: filters.status as ContactStatus | undefined,
    contactTypeId: filters.contactTypeId as string | undefined,
    leadSourceId: filters.leadSourceId as string | undefined,
  });

  const { data: summary } = useGetContactSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Contact | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Contact | null>(null);
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: CONTACT_STATUSES.map((status) => ({
          label: CONTACT_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "contactTypeId",
        label: "Contact type",
        type: "select",
        options: contactTypeOptions.map((type) => ({ label: type.name, value: type._id })),
      },
      {
        name: "leadSourceId",
        label: "Lead source",
        type: "select",
        options: leadSourceOptions.map((source) => ({ label: source.name, value: source._id })),
      },
      {
        name: "isActive",
        label: "Availability",
        type: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
    ],
    [contactTypeOptions, leadSourceOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditing(contact);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteContact(pendingDelete._id).unwrap();
      toast.success("Contact deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the contact");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => contactColumns(rowActions), [rowActions]);

  const contacts = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Contacts"
        description="The people you deal with, who owns the relationship and how they prefer to be reached."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Contacts</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Offered when logging a lead or deal</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Reachable by email</StatLabel>
          <StatValue>{summary?.withEmailCount ?? 0}</StatValue>
          <StatDescription>Contacts an email campaign can reach</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Do not contact</StatLabel>
          <StatValue>{summary?.doNotContactCount ?? 0}</StatValue>
          <StatDescription>Excluded from outbound campaigns</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search contacts..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New contact"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} contacts. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} contacts your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={contacts}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(contact) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{contact.name || "—"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {contact.jobTitle || "No job title"}
                </p>
              </div>
              <StatusBadge
                color={CONTACT_STATUS_COLORS[contact.status]}
                label={CONTACT_STATUS_LABELS[contact.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Company</dt>
                <dd className="truncate font-medium">{contact.companyName || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate font-medium">{contact.email || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="truncate font-medium">{contact.phone || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Owner</dt>
                <dd className="truncate font-medium">{contact.owner?.name || "Unassigned"}</dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {contact.contactType && (
                <ColorChip color={contact.contactType.color} label={contact.contactType.name} />
              )}
              <TagList tags={contact.tags} emptyLabel="" />
            </div>

            <div className="mt-3 border-t pt-3">
              <ContactRowActions contact={contact} {...rowActions} />
            </div>
          </div>
        )}
      />

      <ContactFormModal open={formOpen} onOpenChange={setFormOpen} contact={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The contact stops being offered on new leads and campaigns. Past records keep pointing at it."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
