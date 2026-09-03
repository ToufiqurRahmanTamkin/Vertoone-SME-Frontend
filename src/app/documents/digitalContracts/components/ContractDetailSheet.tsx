import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatAmount } from "@/lib/amount";
import { formatDate, formatDateTime, safeDistanceToNow } from "@/lib/date";
import {
  useGetContractQuery,
  useRemindContractSignerMutation,
  useSendContractMutation,
} from "@/redux/apis/contractApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CONTRACT_AUDIT_LABELS,
  CONTRACT_SIGNER_STATUS_COLORS,
  CONTRACT_SIGNER_STATUS_LABELS,
  CONTRACT_SIGNING_ORDER_LABELS,
  CONTRACT_STATUS_COLORS,
  CONTRACT_STATUS_LABELS,
  type Contract,
} from "@/types/domain/contract";
import { formatFileSize } from "@/types/domain/document";
import { BellRing, Copy, Download, Loader2, Pencil, Send } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface ContractDetailSheetProps {
  contract: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditContract: (contract: Contract) => void;
  canEdit: boolean;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

export function ContractDetailSheet({
  contract,
  open,
  onOpenChange,
  onEditContract,
  canEdit,
}: ContractDetailSheetProps) {
  const { data: fresh } = useGetContractQuery(contract?._id ?? "", {
    skip: !contract || !open,
  });

  const current = fresh ?? contract;

  const [sendContract, { isLoading: isSending }] = useSendContractMutation();
  const [remindSigner, { isLoading: isReminding }] = useRemindContractSignerMutation();

  if (!current) return null;

  const isDraft = current.status === "DRAFT";

  const onSend = async () => {
    try {
      await sendContract(current._id).unwrap();
      toast.success("Sent — the signers have their links");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send the contract");
    }
  };

  const onRemind = async (signerId: string, name: string) => {
    try {
      await remindSigner({ id: current._id, signerId }).unwrap();
      toast.success(`Reminder sent to ${name}`);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send the reminder");
    }
  };

  const copyLink = async (url: string, name: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Signing link for ${name} copied`);
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="pr-8">{current.title}</SheetTitle>
          <SheetDescription>
            <span className="font-mono uppercase">{current.contractNumber}</span>
            {current.counterpartyName ? ` · ${current.counterpartyName}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge
              color={CONTRACT_STATUS_COLORS[current.status]}
              label={CONTRACT_STATUS_LABELS[current.status]}
            />
            {current.expiresAt && (
              <StatusBadge
                color={current.isExpired ? "red" : current.isExpiringSoon ? "amber" : "zinc"}
                label={`${current.isExpired ? "Expired" : "Sign before"} ${formatDate(
                  current.expiresAt
                )}`}
              />
            )}
            <Badge variant="secondary" className="text-[10px]">
              {CONTRACT_SIGNING_ORDER_LABELS[current.signingOrder]}
            </Badge>
          </div>

          {current.description && (
            <p className="text-sm text-muted-foreground">{current.description}</p>
          )}

          <div className="rounded-lg border p-3">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium">
                {current.signedCount} of {current.signerCount} signed
              </span>
              <span className="tabular-nums text-muted-foreground">{current.progress}%</span>
            </div>
            <Progress value={current.progress} className="mt-2 h-1.5" />
          </div>

          <div className="flex flex-wrap gap-2">
            {isDraft && canEdit && (
              <>
                <Button
                  type="button"
                  size="sm"
                  className="cursor-pointer"
                  disabled={isSending}
                  onClick={onSend}
                >
                  {isSending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  Send for signature
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => onEditContract(current)}
                >
                  <Pencil className="size-3.5" />
                  Edit draft
                </Button>
              </>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => window.open(current.file.url, "_blank", "noopener,noreferrer")}
            >
              <Download className="size-3.5" />
              The document
            </Button>
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">Signers</p>
            <ul className="space-y-2">
              {current.signers.map((signer) => (
                <li key={signer._id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{signer.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{signer.email}</p>
                      {signer.role && (
                        <p className="truncate text-xs text-muted-foreground">{signer.role}</p>
                      )}
                    </div>
                    <StatusBadge
                      color={CONTRACT_SIGNER_STATUS_COLORS[signer.status]}
                      label={CONTRACT_SIGNER_STATUS_LABELS[signer.status]}
                    />
                  </div>

                  {signer.signedAt && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Signed {formatDateTime(signer.signedAt)}
                      {signer.signatureType === "DRAWN" ? " (drawn)" : " (typed)"}
                    </p>
                  )}
                  {signer.declinedAt && (
                    <p className="mt-1.5 text-xs text-destructive">
                      Declined {formatDateTime(signer.declinedAt)}
                      {signer.declineReason ? ` — ${signer.declineReason}` : ""}
                    </p>
                  )}
                  {!signer.signedAt && !signer.declinedAt && signer.viewedAt && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Opened {safeDistanceToNow(signer.viewedAt)}
                    </p>
                  )}

                  {signer.signingUrl && signer.status !== "SIGNED" && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 cursor-pointer text-xs"
                        onClick={() => void copyLink(signer.signingUrl as string, signer.name)}
                      >
                        <Copy className="size-3" />
                        Copy link
                      </Button>
                      {canEdit && signer.status !== "DECLINED" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 cursor-pointer text-xs"
                          disabled={isReminding}
                          onClick={() => void onRemind(signer._id, signer.name)}
                        >
                          <BellRing className="size-3" />
                          Chase
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <dl className="divide-y">
            <DetailRow label="File">
              <span className="truncate">
                {current.file.fileName}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {formatFileSize(current.file.fileSize)}
                </span>
              </span>
            </DetailRow>
            {current.value > 0 && (
              <DetailRow label="Value">
                {formatAmount(current.value, current.currency)}
              </DetailRow>
            )}
            <DetailRow label="Owner">{current.owner?.name ?? "Unassigned"}</DetailRow>
            {current.startDate && (
              <DetailRow label="Starts">{formatDate(current.startDate)}</DetailRow>
            )}
            {current.endDate && (
              <DetailRow label="Ends">{formatDate(current.endDate)}</DetailRow>
            )}
            {current.sentAt && (
              <DetailRow label="Sent">{formatDateTime(current.sentAt)}</DetailRow>
            )}
            {current.completedAt && (
              <DetailRow label="Completed">{formatDateTime(current.completedAt)}</DetailRow>
            )}
            {current.tags.length > 0 && (
              <DetailRow label="Tags">
                <TagList tags={current.tags} emptyLabel="—" />
              </DetailRow>
            )}
          </dl>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">Audit trail</p>
            <ol className="space-y-2">
              {current.auditTrail.map((entry) => (
                <li key={entry._id} className="flex gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">
                      {CONTRACT_AUDIT_LABELS[entry.action]}
                      {entry.actor ? (
                        <span className="font-normal text-muted-foreground"> · {entry.actor}</span>
                      ) : null}
                    </p>
                    {entry.detail && (
                      <p className="text-xs text-muted-foreground">{entry.detail}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {formatDateTime(entry.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
