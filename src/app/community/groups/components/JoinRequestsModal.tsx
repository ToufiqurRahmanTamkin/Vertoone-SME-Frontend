import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/date";
import {
  useApproveCommunityJoinRequestMutation,
  useDeclineCommunityJoinRequestMutation,
  useGetCommunityJoinRequestsQuery,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  COMMUNITY_JOIN_REQUEST_STATUS_COLORS,
  COMMUNITY_JOIN_REQUEST_STATUS_LABELS,
  type CommunityGroup,
} from "@/types/domain/community";
import { Check, Inbox, Loader2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { MemberAvatar } from "../../members/components/MemberAvatar";

interface JoinRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: CommunityGroup | null;
}

const SKELETON_ROWS = Array.from({ length: 3 });

export function JoinRequestsModal({ open, onOpenChange, group }: JoinRequestsModalProps) {
  const { data, isLoading } = useGetCommunityJoinRequestsQuery(
    group ? { groupId: group._id, status: "PENDING", limit: 50 } : { limit: 50 },
    { skip: !open || !group }
  );

  const [approveRequest, { isLoading: isApproving }] = useApproveCommunityJoinRequestMutation();
  const [declineRequest, { isLoading: isDeclining }] = useDeclineCommunityJoinRequestMutation();

  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setNotes({});
      setBusyId(null);
    }
  }, [open]);

  const requests = data?.data ?? [];

  const decide = async (id: string, approve: boolean, name: string) => {
    setBusyId(id);
    try {
      const decisionNote = notes[id]?.trim() || undefined;
      if (approve) {
        await approveRequest({ id, decisionNote }).unwrap();
        toast.success(`${name} is now in ${group?.name ?? "the group"}`);
      } else {
        await declineRequest({ id, decisionNote }).unwrap();
        toast.success(`Turned down ${name}`);
      }
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not answer that request");
    } finally {
      setBusyId(null);
    }
  };

  const busy = isApproving || isDeclining;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Requests to join {group?.name ?? "this group"}</DialogTitle>
          <DialogDescription>
            Approving somebody adds them to the group and to its chat straight away.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          {isLoading ? (
            SKELETON_ROWS.map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-xl" />
            ))
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
              <Inbox className="size-7 text-muted-foreground" />
              <p className="font-medium">Nobody is waiting</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                When somebody asks to join, their request shows up here.
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <MemberAvatar
                      name={request.member?.displayName ?? "Someone"}
                      avatarUrl={request.member?.avatarUrl}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {request.member?.displayName ?? "Someone"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        Asked {formatDateTime(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    color={COMMUNITY_JOIN_REQUEST_STATUS_COLORS[request.status]}
                    label={COMMUNITY_JOIN_REQUEST_STATUS_LABELS[request.status]}
                  />
                </div>

                {request.message && (
                  <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    {request.message}
                  </p>
                )}

                <Textarea
                  className="mt-3 min-h-16"
                  placeholder="Add a note back (optional)"
                  value={notes[request._id] ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({ ...current, [request._id]: event.target.value }))
                  }
                />

                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={busy || !request.canDecide}
                    onClick={() =>
                      void decide(request._id, false, request.member?.displayName ?? "them")
                    }
                  >
                    {busyId === request._id && isDeclining ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <X className="size-4" />
                    )}
                    Decline
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="cursor-pointer"
                    disabled={busy || !request.canDecide}
                    onClick={() =>
                      void decide(request._id, true, request.member?.displayName ?? "them")
                    }
                  >
                    {busyId === request._id && isApproving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
