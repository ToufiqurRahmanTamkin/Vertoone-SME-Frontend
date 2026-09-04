import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { formatDate, formatDateTime } from "@/lib/date";
import {
  useCancelLeaveRequestMutation,
  useGetMyLeaveRequestSummaryQuery,
  useGetMyLeaveRequestsQuery,
} from "@/redux/apis/leaveRequestApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  LEAVE_REQUEST_STATUS_COLORS,
  formatDays,
  type LeaveRequest,
} from "@/types/domain/leaveRequest";
import { ListChecks, Paperclip, Plane, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { LeaveRequestModal } from "./components/LeaveRequestModal";

export default function MyLeavePage() {
  const [page, setPage] = React.useState(1);
  const [formOpen, setFormOpen] = React.useState(false);
  const [pendingCancel, setPendingCancel] = React.useState<LeaveRequest | null>(null);

  const { data, isLoading, isFetching } = useGetMyLeaveRequestsQuery({ page, limit: 20 });
  const { data: summary } = useGetMyLeaveRequestSummaryQuery();
  const [cancelRequest, { isLoading: isCancelling }] = useCancelLeaveRequestMutation();

  const requests = data?.data ?? [];
  const meta = data?.meta;
  const balances = summary?.balances ?? [];
  const hasLeaveTypes = balances.length > 0;

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    try {
      await cancelRequest(pendingCancel._id).unwrap();
      toast.success("Leave request withdrawn");
      setPendingCancel(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not withdraw the request");
    }
  };

  return (
    <>
      <PageHeader
        title="Leave"
        description="Apply for time off and track what happened to it."
        actions={
          <ActionButton
            icon={Plus}
            label="Apply for leave"
            onClick={() => setFormOpen(true)}
            disabled={!hasLeaveTypes}
            title={
              hasLeaveTypes ? undefined : "No leave types have been set up for your company yet"
            }
          />
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Waiting on a decision</StatLabel>
          <StatValue>{summary?.pending ?? 0}</StatValue>
          <StatDescription>Out of {summary?.total ?? 0} you have raised</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Days taken</StatLabel>
          <StatValue>{summary?.daysTakenThisYear ?? 0}</StatValue>
          <StatDescription>Approved this leave year</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Days left</StatLabel>
          <StatValue>{summary?.remainingDays ?? 0}</StatValue>
          <StatDescription>Across every entitlement</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Booked but undecided</StatLabel>
          <StatValue>{summary?.daysPending ?? 0}</StatValue>
          <StatDescription>Held against your balance</StatDescription>
        </Stat>
      </StatGrid>

      {!hasLeaveTypes && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          No leave types have been set up for your company yet, so there is nothing to apply for.
          Speak to HR.
        </p>
      )}

      <SectionCard
        icon={ListChecks}
        title="Your balances"
        description="What is left against each entitlement this leave year."
      >
        {balances.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing has been allocated to you yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {balances.map((balance) => {
              const used = balance.takenDays + balance.pendingDays;
              const progress =
                balance.entitledDays > 0
                  ? Math.min(100, Math.round((used / balance.entitledDays) * 100))
                  : 0;

              return (
                <div key={balance.leaveTypeId} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: balance.color }}
                      />
                      <span className="truncate text-sm font-medium">{balance.name}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {balance.remainingDays}
                    </span>
                  </div>
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">
                    {balance.takenDays} taken · {balance.pendingDays} waiting · of{" "}
                    {balance.entitledDays} {balance.isPaid ? "paid" : "unpaid"} day(s)
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        icon={Plane}
        title="Your leave requests"
        description="Newest first. You can withdraw anything that has not started yet."
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            You have not applied for any time off yet.
          </p>
        ) : (
          <div className="divide-y">
            {requests.map((request) => (
              <div key={request._id} className="flex flex-col gap-2 py-4">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {formatDate(request.startDate)}
                      {request.startDate !== request.endDate && ` → ${formatDate(request.endDate)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.leaveType?.name ?? "Leave"} · {formatDays(request.days)}
                      {request.dayPart !== "FULL_DAY" && ` · ${request.dayPartLabel}`}
                    </p>
                  </div>
                  <StatusBadge
                    color={LEAVE_REQUEST_STATUS_COLORS[request.status]}
                    label={request.statusLabel}
                  />
                </div>

                <p className="text-sm text-muted-foreground">{request.reason}</p>

                {request.contactNumber && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Reachable on: </span>
                    {request.contactNumber}
                  </p>
                )}

                {request.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {request.attachments.map((attachment, index) => (
                      <a
                        key={`${attachment.url}-${index}`}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs hover:bg-muted"
                      >
                        <Paperclip className="size-3" />
                        {attachment.fileName || "Attachment"}
                      </a>
                    ))}
                  </div>
                )}

                {request.reviewedAt && (
                  <p className="text-xs text-muted-foreground">
                    Decided {formatDateTime(request.reviewedAt)}
                    {request.reviewedByName && ` by ${request.reviewedByName}`}
                    {request.reviewNote && ` — ${request.reviewNote}`}
                  </p>
                )}

                {(request.status === "PENDING" || request.status === "APPROVED") && (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => setPendingCancel(request)}
                    >
                      Withdraw
                    </Button>
                  </div>
                )}
              </div>
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

      <LeaveRequestModal open={formOpen} onOpenChange={setFormOpen} balances={balances} />

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title="Withdraw this leave request?"
        description="The days go back onto your balance. You can apply again whenever you need to."
        confirmText="Withdraw"
        variant="destructive"
        isLoading={isCancelling}
        onConfirm={confirmCancel}
      />
    </>
  );
}
