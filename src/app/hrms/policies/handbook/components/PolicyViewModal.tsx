import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
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
import { useAcknowledgePolicyMutation } from "@/redux/apis/policyApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  POLICY_CATEGORY_LABELS,
  POLICY_STATUS_COLORS,
  POLICY_STATUS_LABELS,
  type Policy,
} from "@/types/domain/policy";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PolicyViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Policy | null;
  showAcknowledge?: boolean;
}

const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export function PolicyViewModal({
  open,
  onOpenChange,
  policy,
  showAcknowledge = false,
}: PolicyViewModalProps) {
  const [acknowledgePolicy, { isLoading: isSaving }] = useAcknowledgePolicyMutation();

  const onAcknowledge = async () => {
    if (!policy) return;
    try {
      await acknowledgePolicy({ id: policy._id, body: {} }).unwrap();
      toast.success("Thanks, that is recorded");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not record your acknowledgement");
    }
  };

  const canAcknowledge =
    showAcknowledge &&
    policy?.status === "PUBLISHED" &&
    policy.requiresAcknowledgement &&
    !policy.hasAcknowledged;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{policy?.title ?? ""}</DialogTitle>
          <DialogDescription>
            {policy?.summary || "No summary was written for this policy."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {policy && (
              <StatusBadge
                color={POLICY_STATUS_COLORS[policy.status]}
                label={POLICY_STATUS_LABELS[policy.status]}
              />
            )}
            {policy && (
              <Badge variant="secondary" className="text-[10px]">
                {POLICY_CATEGORY_LABELS[policy.category]}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              Version {policy?.version ?? 1}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {policy?.audienceLabel ?? "Everyone"}
            </Badge>
            {policy?.hasAcknowledged && (
              <Badge variant="outline" className="gap-1 text-[10px]">
                <CheckCircle2 className="size-2.5" />
                You have acknowledged this
              </Badge>
            )}
          </div>

          <dl className="grid gap-2 rounded-lg border p-3 text-xs sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">In force from</dt>
              <dd className="font-medium">{formatDay(policy?.effectiveFrom ?? null)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Review by</dt>
              <dd className="font-medium">{formatDay(policy?.reviewDueAt ?? null)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Acknowledged</dt>
              <dd className="font-medium">
                {policy?.acknowledgedCount ?? 0} of {policy?.audienceCount ?? 0}
              </dd>
            </div>
          </dl>

          {policy?.file && (
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <a href={policy.file.url} target="_blank" rel="noreferrer" download>
                <Download className="size-4" />
                {policy.file.fileName || "Open the attached document"}
              </a>
            </Button>
          )}

          <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed">
            {policy?.content || "Nothing has been written into this policy yet."}
          </div>

          {policy && policy.versions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Version history</p>
              {policy.versions.slice(0, 6).map((version) => (
                <div
                  key={version._id}
                  className="flex items-center justify-between gap-3 rounded-md border p-2.5 text-xs"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium">v{version.version}</span>
                    {version.note && ` · ${version.note}`}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatDay(version.publishedAt)}
                  </span>
                </div>
              ))}
            </div>
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
          {canAcknowledge && (
            <Button
              type="button"
              className="cursor-pointer"
              disabled={isSaving}
              onClick={() => void onAcknowledge()}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              I have read this
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
