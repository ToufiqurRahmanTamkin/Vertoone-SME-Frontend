import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetResourceSharesQuery,
  useGetShareTargetsQuery,
  useRevokeShareMutation,
  useShareResourceMutation,
  useUpdateSharePermissionsMutation,
} from "@/redux/apis/resourceShareApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import {
  SHARE_CAPABILITY_OPTIONS,
  SHARE_RESOURCE_LABELS,
  SHARE_STATUS_COLORS,
  SHARE_STATUS_LABELS,
  emptySharePermissions,
  type ResourceShare,
  type ShareCapability,
  type SharePermissions,
  type ShareResourceType,
  type ShareTargetOption,
} from "@/types/domain/resourceShare";
import { Send, Trash2, UserPlus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface ShareResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: ShareResourceType;
  resourceId: string | null;
  resourceTitle: string;
}

const errorMessage = (error: unknown, fallback: string): string =>
  (error as ApiErrorResponse)?.data?.message || fallback;

function CapabilityToggles({
  resourceType,
  permissions,
  disabled,
  onChange,
}: {
  resourceType: ShareResourceType;
  permissions: SharePermissions;
  disabled?: boolean;
  onChange: (capability: ShareCapability, value: boolean) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {SHARE_CAPABILITY_OPTIONS[resourceType].map((option) => (
        <label
          key={option.key}
          className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-3"
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium">{option.label}</span>
            <span className="block text-xs text-muted-foreground">{option.description}</span>
          </span>
          <Switch
            checked={permissions[option.key]}
            disabled={disabled}
            onCheckedChange={(value) => onChange(option.key, value)}
          />
        </label>
      ))}
    </div>
  );
}

/**
 * Owns the draft invitation. It is mounted fresh with the dialog, so the fields
 * start empty every time someone opens it.
 */
function InviteForm({
  resourceType,
  resourceId,
  suggestions,
}: {
  resourceType: ShareResourceType;
  resourceId: string | null;
  suggestions: ShareTargetOption[];
}) {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [permissions, setPermissions] = React.useState<SharePermissions>(emptySharePermissions);

  const [shareResource, { isLoading }] = useShareResourceMutation();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resourceId) return;

    try {
      await shareResource({ resourceType, resourceId, email, message, permissions }).unwrap();
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setMessage("");
      setPermissions(emptySharePermissions());
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not send that invitation"));
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="share-email">Their email address</Label>
        <Input
          id="share-email"
          type="email"
          required
          list="share-email-suggestions"
          placeholder="colleague@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <datalist id="share-email-suggestions">
          {suggestions.map((target) => (
            <option key={target.userId} value={target.email}>
              {target.name}
            </option>
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground">
          Has to be someone who signs in to your company.
        </p>
      </div>

      <div className="space-y-2">
        <Label>What they may do</Label>
        <CapabilityToggles
          resourceType={resourceType}
          permissions={permissions}
          onChange={(capability, value) =>
            setPermissions((current) => ({ ...current, [capability]: value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="share-message">A note with the invitation (optional)</Label>
        <Textarea
          id="share-message"
          rows={2}
          maxLength={500}
          placeholder="Why you are sharing this"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>

      <Button
        type="submit"
        className="w-full cursor-pointer sm:w-auto"
        disabled={isLoading || !resourceId || !email}
      >
        <Send className="size-4" />
        Send invitation
      </Button>
    </form>
  );
}

function ShareRow({
  share,
  resourceType,
  onRevoke,
}: {
  share: ResourceShare;
  resourceType: ShareResourceType;
  onRevoke: (share: ResourceShare) => void;
}) {
  const [updatePermissions, { isLoading }] = useUpdateSharePermissionsMutation();

  const change = async (capability: ShareCapability, value: boolean) => {
    try {
      await updatePermissions({
        id: share._id,
        permissions: { ...share.permissions, [capability]: value },
      }).unwrap();
      toast.success("Access updated");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not update their access"));
    }
  };

  return (
    <div className="rounded-xl border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {share.recipientName || share.recipientEmail}
          </p>
          <p className="truncate text-xs text-muted-foreground">{share.recipientEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            color={SHARE_STATUS_COLORS[share.status]}
            label={SHARE_STATUS_LABELS[share.status]}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer text-destructive"
            aria-label="Withdraw access"
            onClick={() => onRevoke(share)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <CapabilityToggles
          resourceType={resourceType}
          permissions={share.permissions}
          disabled={isLoading}
          onChange={change}
        />
      </div>
    </div>
  );
}

export function ShareResourceDialog({
  open,
  onOpenChange,
  resourceType,
  resourceId,
  resourceTitle,
}: ShareResourceDialogProps) {
  const label = SHARE_RESOURCE_LABELS[resourceType];

  const [pendingRevoke, setPendingRevoke] = React.useState<ResourceShare | null>(null);

  const [revokeShare, { isLoading: isRevoking }] = useRevokeShareMutation();

  const { data: targets = [] } = useGetShareTargetsQuery(undefined, { skip: !open });

  const { data: shares, isLoading: isLoadingShares } = useGetResourceSharesQuery(
    resourceId ? { resourceType, resourceId, limit: 100 } : undefined,
    { skip: !open || !resourceId }
  );

  const rows = React.useMemo(() => shares?.data ?? [], [shares]);

  const suggestions = React.useMemo(() => {
    const alreadyShared = new Set(rows.map((row) => row.recipientEmail));
    return targets.filter((target) => !alreadyShared.has(target.email));
  }, [targets, rows]);

  const confirmRevoke = async () => {
    if (!pendingRevoke) return;
    try {
      await revokeShare(pendingRevoke._id).unwrap();
      toast.success("Access withdrawn");
      setPendingRevoke(null);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not withdraw that access"));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share this {label.toLowerCase()}</DialogTitle>
            <DialogDescription>
              Send an invitation by email. They see it once they sign in, and it appears under
              their shared items after they accept.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5">
            <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{label}: </span>
              <span className="font-medium">{resourceTitle}</span>
            </p>

            <InviteForm
              key={resourceId ?? "none"}
              resourceType={resourceType}
              resourceId={resourceId}
              suggestions={suggestions}
            />

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <UserPlus className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">People with access</h3>
              </div>

              {isLoadingShares ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner />
                </div>
              ) : rows.length === 0 ? (
                <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                  Nobody else has been given access yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {rows.map((share) => (
                    <ShareRow
                      key={share._id}
                      share={share}
                      resourceType={resourceType}
                      onRevoke={setPendingRevoke}
                    />
                  ))}
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingRevoke)}
        onOpenChange={(next) => !next && setPendingRevoke(null)}
        title={`Withdraw access for ${
          pendingRevoke?.recipientName || pendingRevoke?.recipientEmail || ""
        }?`}
        description={`They lose sight of this ${label.toLowerCase()} straight away.`}
        confirmText="Withdraw"
        variant="destructive"
        isLoading={isRevoking}
        onConfirm={confirmRevoke}
      />
    </>
  );
}
