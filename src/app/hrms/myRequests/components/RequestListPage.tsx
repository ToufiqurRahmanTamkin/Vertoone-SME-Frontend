import { ActionButton } from "@/components/shared/action-button";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { formatAmountValue } from "@/lib/amount";
import {
  useCancelEmployeeRequestMutation,
  useGetMyEmployeeRequestSummaryQuery,
  useGetMyEmployeeRequestsQuery,
} from "@/redux/apis/employeeRequestApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { formatRequestHours, type EmployeeRequest } from "@/types/domain/employeeRequest";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { RequestCard } from "./RequestCard";
import { RequestFormModal } from "./RequestFormModal";
import type { RequestKindConfig } from "./requestKinds";

interface RequestListPageProps {
  config: RequestKindConfig;
}

export function RequestListPage({ config }: RequestListPageProps) {
  const [page, setPage] = React.useState(1);
  const [formOpen, setFormOpen] = React.useState(false);
  const [pendingCancel, setPendingCancel] = React.useState<EmployeeRequest | null>(null);

  const { data, isLoading, isFetching } = useGetMyEmployeeRequestsQuery({
    kind: config.kind,
    page,
    limit: 20,
  });
  const { data: summary } = useGetMyEmployeeRequestSummaryQuery({ kind: config.kind });
  const [cancelRequest, { isLoading: isCancelling }] = useCancelEmployeeRequestMutation();

  const requests = data?.data ?? [];
  const meta = data?.meta;
  const showsMoney = config.metric === "AMOUNT";

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    try {
      await cancelRequest(pendingCancel._id).unwrap();
      toast.success("Request withdrawn");
      setPendingCancel(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not withdraw the request");
    }
  };

  return (
    <>
      <PageHeader
        title={config.pageTitle}
        description={config.pageDescription}
        actions={
          <>
            {showsMoney && <CurrencyNote currency={summary?.currency ?? "BDT"} />}
            <ActionButton icon={Plus} label={config.newLabel} onClick={() => setFormOpen(true)} />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Waiting on a decision</StatLabel>
          <StatValue>{summary?.open ?? 0}</StatValue>
          <StatDescription>Out of {summary?.total ?? 0} you have raised</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>{config.kind === "HELPDESK" ? "Resolved" : "Approved"}</StatLabel>
          <StatValue>{summary?.approved ?? 0}</StatValue>
          <StatDescription>
            {summary?.rejected ?? 0} {config.kind === "HELPDESK" ? "closed" : "turned down"}
          </StatDescription>
        </Stat>

        {config.metric === "HOURS" ? (
          <>
            <Stat>
              <StatLabel>Hours approved</StatLabel>
              <StatValue>{formatRequestHours(summary?.approvedHours ?? 0)}</StatValue>
              <StatDescription>Signed off so far</StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Hours raised</StatLabel>
              <StatValue>{formatRequestHours(summary?.totalHours ?? 0)}</StatValue>
              <StatDescription>Across every request</StatDescription>
            </Stat>
          </>
        ) : showsMoney ? (
          <>
            <Stat>
              <StatLabel>Approved</StatLabel>
              <StatValue>{formatAmountValue(summary?.approvedAmount ?? 0)}</StatValue>
              <StatDescription>Signed off so far</StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Waiting</StatLabel>
              <StatValue>{formatAmountValue(summary?.pendingAmount ?? 0)}</StatValue>
              <StatDescription>Still to be decided</StatDescription>
            </Stat>
          </>
        ) : (
          <>
            <Stat>
              <StatLabel>Being looked at</StatLabel>
              <StatValue>{summary?.inProgress ?? 0}</StatValue>
              <StatDescription>Somebody has picked these up</StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Withdrawn</StatLabel>
              <StatValue>{summary?.cancelled ?? 0}</StatValue>
              <StatDescription>You pulled these back</StatDescription>
            </Stat>
          </>
        )}
      </StatGrid>

      <SectionCard icon={config.icon} title={config.listTitle} description={config.listDescription}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{config.emptyText}</p>
        ) : (
          <div className="divide-y">
            {requests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                config={config}
                onWithdraw={setPendingCancel}
              />
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page >= meta.totalPages || isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      <RequestFormModal config={config} open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title="Withdraw this request?"
        description="It stops waiting for a decision. You can raise a new one whenever you need to."
        confirmText="Withdraw"
        variant="destructive"
        isLoading={isCancelling}
        onConfirm={confirmCancel}
      />
    </>
  );
}
