import { ColorChip } from "@/components/shared/color-chip";
import { Button } from "@/components/ui/button";
import {
  useAcceptShareMutation,
  useDeclineShareMutation,
  useGetShareInvitationsQuery,
} from "@/redux/apis/resourceShareApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import {
  SHARE_CAPABILITY_OPTIONS,
  SHARE_RESOURCE_LABELS,
  type ResourceShare,
  type ShareResourceType,
} from "@/types/domain/resourceShare";
import { formatDate } from "@/lib/date";
import { Check, Mailbox, X } from "lucide-react";
import { toast } from "sonner";

const errorMessage = (error: unknown, fallback: string): string =>
  (error as ApiErrorResponse)?.data?.message || fallback;

const grantedLabels = (share: ResourceShare): string[] =>
  SHARE_CAPABILITY_OPTIONS[share.resourceType]
    .filter((option) => share.permissions[option.key])
    .map((option) => option.label);

function InvitationCard({ share }: { share: ResourceShare }) {
  const [accept, { isLoading: isAccepting }] = useAcceptShareMutation();
  const [decline, { isLoading: isDeclining }] = useDeclineShareMutation();

  const busy = isAccepting || isDeclining;
  const granted = grantedLabels(share);

  const respond = async (isAccept: boolean) => {
    try {
      if (isAccept) {
        await accept(share._id).unwrap();
        toast.success(`"${share.resourceTitle}" added to your shared items`);
      } else {
        await decline(share._id).unwrap();
        toast.success("Invitation declined");
      }
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not answer that invitation"));
    }
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-4">
      <div className="min-w-0 space-y-1">
        <ColorChip
          color={share.resourceColor || "#8b5cf6"}
          label={share.resourceTitle || SHARE_RESOURCE_LABELS[share.resourceType]}
        />
        <p className="text-xs text-muted-foreground">
          {share.sharedByName || share.sharedByEmail} shared this with you on{" "}
          {formatDate(share.invitedAt)}
        </p>
        {share.message && <p className="text-xs italic text-muted-foreground">“{share.message}”</p>}
        <p className="text-xs text-muted-foreground">
          You can: {granted.length > 0 ? granted.join(", ") : "view it"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="cursor-pointer"
          disabled={busy}
          onClick={() => respond(true)}
        >
          <Check className="size-4" />
          Accept
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="cursor-pointer"
          disabled={busy}
          onClick={() => respond(false)}
        >
          <X className="size-4" />
          Decline
        </Button>
      </div>
    </div>
  );
}

/**
 * Invitations waiting on this user for one kind of record. Renders nothing when
 * there are none, so it can sit at the top of any page.
 */
export function ShareInvitations({ resourceType }: { resourceType: ShareResourceType }) {
  const { data: invitations = [] } = useGetShareInvitationsQuery({ resourceType });

  if (invitations.length === 0) return null;

  const label = SHARE_RESOURCE_LABELS[resourceType].toLowerCase();

  return (
    <section className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
      <div className="flex items-center gap-2">
        <Mailbox className="size-4 text-amber-600" />
        <h2 className="text-sm font-semibold">
          {invitations.length} {label} invitation{invitations.length === 1 ? "" : "s"} waiting for
          you
        </h2>
      </div>

      <div className="space-y-3">
        {invitations.map((share) => (
          <InvitationCard key={share._id} share={share} />
        ))}
      </div>
    </section>
  );
}
