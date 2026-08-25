import {
  AlertCircle,
  CircleDollarSign,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { useListFilters } from "@/hooks/use-list-filters";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatDate, formatNumber, humanizeEnum } from "@/lib/format";
import {
  useDeleteSoldSubscriptionMutation,
  useGetSoldSubscriptionsQuery,
  useGetSoldSubscriptionSummaryQuery,
} from "@/redux/apis/soldSubscriptionApi";
import {
  PAYMENT_STATUSES,
  SUBSCRIPTION_STATUSES,
  type PaymentStatus,
  type SoldSubscription,
  type SubscriptionStatus,
} from "@/types";
import { SoldSubscriptionFormDialog } from "./SoldSubscriptionFormDialog";

const ALL = "ALL";

interface Filters extends Record<string, string> {
  search: string;
  status: SubscriptionStatus | typeof ALL;
  paymentStatus: PaymentStatus | typeof ALL;
}

export default function SoldSubscriptionsPage() {
  const { filters, setFilter, page, setPage, limit, setLimit } = useListFilters<Filters>({
    search: "",
    status: ALL,
    paymentStatus: ALL,
  });
  const { search, status, paymentStatus } = filters;

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error } = useGetSoldSubscriptionsQuery({
    page,
    limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status !== ALL ? { status } : {}),
    ...(paymentStatus !== ALL ? { paymentStatus } : {}),
  });

  const { data: summary, isLoading: isSummaryLoading } = useGetSoldSubscriptionSummaryQuery();
  const [deleteSale, { isLoading: isDeleting }] = useDeleteSoldSubscriptionMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SoldSubscription | undefined>();
  const [pendingDelete, setPendingDelete] = React.useState<SoldSubscription | undefined>();

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (record: SoldSubscription) => {
    setEditing(record);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteSale(pendingDelete._id).unwrap();
      toast.success("Subscription deleted");
      setPendingDelete(undefined);
    } catch (deleteError) {
      toast.error(getApiErrorMessage(deleteError, "Could not delete the subscription"));
    }
  };

  const records = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Sold Subscriptions"
        description="Every subscription sold against a plan."
        actions={
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="size-4" />
            Record sale
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total sold"
          value={formatNumber(summary?.totalSold ?? 0)}
          icon={Receipt}
          isLoading={isSummaryLoading}
        />
        <StatCard
          label="Active"
          value={formatNumber(summary?.activeCount ?? 0)}
          icon={Receipt}
          isLoading={isSummaryLoading}
        />
        <StatCard
          label="Pending"
          value={formatNumber(summary?.pendingCount ?? 0)}
          icon={AlertCircle}
          isLoading={isSummaryLoading}
        />
        <StatCard
          label="Realised revenue"
          value={formatCurrency(summary?.totalRevenue ?? 0)}
          hint="Paid invoices only"
          icon={CircleDollarSign}
          isLoading={isSummaryLoading}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setFilter("search", event.target.value)}
                placeholder="Search by customer, company, invoice…"
                className="pl-9"
              />
            </div>

            <Select
              value={status}
              onValueChange={(value) => setFilter("status", value as Filters["status"])}
            >
              <SelectTrigger className="w-full cursor-pointer sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                {SUBSCRIPTION_STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {humanizeEnum(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={paymentStatus}
              onValueChange={(value) => setFilter("paymentStatus", value as Filters["paymentStatus"])}
            >
              <SelectTrigger className="w-full cursor-pointer sm:w-44">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All payments</SelectItem>
                {PAYMENT_STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {humanizeEnum(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isError ? (
            <EmptyState
              icon={AlertCircle}
              title="Could not load subscriptions"
              description={getApiErrorMessage(error, "The server did not respond.")}
            />
          ) : isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No subscriptions found"
              description={
                debouncedSearch || status !== ALL || paymentStatus !== ALL
                  ? "No sale matches these filters."
                  : "Record your first sale to see it here."
              }
              action={
                <Button className="cursor-pointer" onClick={openCreate}>
                  <Plus className="size-4" />
                  Record sale
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="whitespace-nowrap font-mono text-xs">
                          {record.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{record.customerName}</p>
                          <p className="text-xs text-muted-foreground">{record.customerEmail}</p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{record.planName}</TableCell>
                        <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                          {formatCurrency(record.amount, record.currency)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(record.startDate)} → {formatDate(record.endDate)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={record.status} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={record.paymentStatus} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer"
                              onClick={() => openEdit(record)}
                              aria-label={`Edit ${record.invoiceNumber}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer text-destructive hover:text-destructive"
                              onClick={() => setPendingDelete(record)}
                              aria-label={`Delete ${record.invoiceNumber}`}
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

      <SoldSubscriptionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
        title={`Delete invoice ${pendingDelete?.invoiceNumber ?? ""}?`}
        description="This removes the sale from the billing record permanently."
        confirmText="Delete subscription"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
