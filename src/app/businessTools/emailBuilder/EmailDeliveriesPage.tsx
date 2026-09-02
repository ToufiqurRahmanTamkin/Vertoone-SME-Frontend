import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useGetEmailDeliveriesQuery,
  useGetEmailDeliveryQuery,
  useResendEmailDeliveryMutation,
} from "@/redux/apis/emailBuilderApis";
import type { EmailDeliveryListItem } from "@/types/domain/emailBuilder";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { toast } from "sonner";
import { DeliveryRowActions } from "./components/DeliveryRowActions";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Sent", value: "SENT" },
      { label: "Failed", value: "FAILED" },
      { label: "Not delivered", value: "SKIPPED" },
    ],
  },
];

const STATUS_META: Record<
  EmailDeliveryListItem["status"],
  { color: "green" | "red" | "amber"; label: string }
> = {
  SENT: { color: "green", label: "Sent" },
  FAILED: { color: "red", label: "Failed" },
  SKIPPED: { color: "amber", label: "Not delivered" },
};

function DeliveryPreviewDialog({
  deliveryId,
  onOpenChange,
}: {
  deliveryId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: delivery, isLoading } = useGetEmailDeliveryQuery(deliveryId ?? "", {
    skip: !deliveryId,
  });

  return (
    <Dialog open={Boolean(deliveryId)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate">{delivery?.subject ?? "Sent email"}</DialogTitle>
          <DialogDescription>
            {delivery ? `Delivered to ${delivery.to}` : "Loading the copy that went out…"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {isLoading || !delivery ? (
            <LoadingSpinner />
          ) : (
            <div className="h-[60vh] overflow-hidden rounded-lg border">
              <iframe
                title="Sent email"
                srcDoc={delivery.html}
                sandbox=""
                className="h-full w-full border-0 bg-white"
              />
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EmailDeliveriesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/business-tools/email-builder");

  const { data, isLoading, isFetching } = useGetEmailDeliveriesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as EmailDeliveryListItem["status"] | undefined,
  });

  const [resendDelivery] = useResendEmailDeliveryMutation();
  const [previewId, setPreviewId] = React.useState<string | null>(null);

  const deliveries = data?.data ?? [];
  const meta = data?.meta;

  const resend = React.useCallback(
    async (delivery: EmailDeliveryListItem) => {
      try {
        await resendDelivery(delivery._id).unwrap();
        toast.success(`Sent again to ${delivery.to}`);
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not resend this email");
      }
    },
    [resendDelivery]
  );

  const columns = React.useMemo<ColumnDef<EmailDeliveryListItem>[]>(
    () => [
      {
        accessorKey: "to",
        header: "Recipient",
        cell: ({ row }) => (
          <div className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {row.original.recipientName || row.original.to}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {row.original.to}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <span className="block max-w-xs truncate text-sm">{row.original.subject}</span>
        ),
      },
      {
        accessorKey: "relatedReference",
        header: "From template",
        cell: ({ row }) => (
          <span className="block max-w-40 truncate text-xs text-muted-foreground">
            {row.original.relatedReference || "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = STATUS_META[row.original.status];

          return (
            <div className="flex flex-col gap-1">
              <StatusBadge color={status.color} label={status.label} />
              {row.original.errorMessage && (
                <span className="max-w-52 truncate text-[11px] text-muted-foreground">
                  {row.original.errorMessage}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "sentAt",
        header: "Sent",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {new Date(row.original.sentAt).toLocaleString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <DeliveryRowActions
            delivery={row.original}
            onPreview={(delivery) => setPreviewId(delivery._id)}
            onResend={(delivery) => void resend(delivery)}
            canResend={access.canCreate}
          />
        ),
      },
    ],
    [access.canCreate, resend]
  );

  return (
    <>
      <PageHeader
        title="Sent emails"
        description="Every email your team has sent from the Email Builder, with what actually happened to it."
        actions={<BackLink to="/crm/business-tools/email-builder" label="All emails" />}
      />

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by address or subject..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      <DataTable
        columns={columns}
        data={deliveries}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(delivery) => {
          const status = STATUS_META[delivery.status];

          return (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{delivery.subject}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {delivery.to}
                  </span>
                </div>
                <StatusBadge color={status.color} label={status.label} />
              </div>

              <p className="mt-2 text-[11px] text-muted-foreground">
                {new Date(delivery.sentAt).toLocaleString()}
              </p>

              <div className="mt-3 border-t pt-3">
                <DeliveryRowActions
                  delivery={delivery}
                  onPreview={(item) => setPreviewId(item._id)}
                  onResend={(item) => void resend(item)}
                  canResend={access.canCreate}
                />
              </div>
            </div>
          );
        }}
      />

      <DeliveryPreviewDialog
        deliveryId={previewId}
        onOpenChange={(open) => !open && setPreviewId(null)}
      />
    </>
  );
}
