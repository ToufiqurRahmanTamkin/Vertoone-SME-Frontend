import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime } from "@/lib/date";
import {
  useDeclinePublicContractMutation,
  useGetPublicContractQuery,
  useSignPublicContractMutation,
} from "@/redux/apis/contractApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CONTRACT_SIGNER_STATUS_COLORS,
  CONTRACT_SIGNER_STATUS_LABELS,
  type ContractSignatureType,
} from "@/types/domain/contract";
import { CheckCircle2, FileText, Loader2, PenLine, ShieldCheck, XCircle } from "lucide-react";
import * as React from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { SignaturePad } from "./components/SignaturePad";

export default function SignContractPage() {
  const { token = "" } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useGetPublicContractQuery(token, { skip: !token });

  const [signContract, { isLoading: isSigning }] = useSignPublicContractMutation();
  const [declineContract, { isLoading: isDeclining }] = useDeclinePublicContractMutation();

  const [mode, setMode] = React.useState<ContractSignatureType>("TYPED");
  const [nameOverride, setNameOverride] = React.useState<string | null>(null);
  const [drawnSignature, setDrawnSignature] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [declineOpen, setDeclineOpen] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState("");
  const [done, setDone] = React.useState<"SIGNED" | "DECLINED" | null>(null);

  if (!token || isError) {
    return (
      <Shell>
        <EmptyState
          icon={XCircle}
          title="That link is not valid"
          description="Check you opened the most recent email, or ask the sender for a new link."
        />
      </Shell>
    );
  }

  if (isLoading || !data) {
    return (
      <Shell>
        <LoadingSpinner />
      </Shell>
    );
  }

  if (done === "SIGNED" || data.signer.status === "SIGNED") {
    return (
      <Shell>
        <EmptyState
          icon={CheckCircle2}
          tone="success"
          title="Signed — thank you"
          description={`Your signature on "${data.title}" has been recorded${
            data.signer.signedAt ? ` on ${formatDateTime(data.signer.signedAt)}` : ""
          }. Everyone gets a copy by email once the last person signs.`}
        />
      </Shell>
    );
  }

  if (done === "DECLINED" || data.signer.status === "DECLINED") {
    return (
      <Shell>
        <EmptyState
          icon={XCircle}
          title="You declined to sign"
          description={`${data.companyName} has been told. If that was a mistake, get in touch with them directly.`}
        />
      </Shell>
    );
  }

  const typedName = nameOverride ?? data.signer.name;
  const setTypedName = setNameOverride;
  const signatureValue = mode === "TYPED" ? typedName.trim() : drawnSignature;
  const canSubmit = agreed && typedName.trim().length > 0 && signatureValue.length > 0;

  const onSign = async () => {
    try {
      await signContract({
        token,
        body: {
          signatureType: mode,
          signatureValue,
          fullName: typedName.trim(),
          agreed,
        },
      }).unwrap();
      setDone("SIGNED");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not record your signature");
    }
  };

  const onDecline = async () => {
    try {
      await declineContract({ token, reason: declineReason.trim() }).unwrap();
      setDeclineOpen(false);
      setDone("DECLINED");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not record your response");
    }
  };

  return (
    <Shell>
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                <span className="font-mono uppercase">{data.contractNumber}</span> ·{" "}
                {data.companyName}
              </p>
              <h1 className="mt-1 text-xl font-semibold">{data.title}</h1>
            </div>
            <StatusBadge
              color={CONTRACT_SIGNER_STATUS_COLORS[data.signer.status]}
              label={CONTRACT_SIGNER_STATUS_LABELS[data.signer.status]}
            />
          </div>

          {data.description && (
            <p className="mt-3 text-sm text-muted-foreground">{data.description}</p>
          )}

          {data.message && (
            <div className="mt-3 rounded-lg border border-dashed bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Message from {data.companyName}
              </p>
              <p className="mt-1 text-sm">{data.message}</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              Signing as {data.signer.name}
              {data.signer.role ? ` · ${data.signer.role}` : ""}
            </Badge>
            {data.expiresAt && (
              <StatusBadge color="amber" label={`Sign before ${formatDate(data.expiresAt)}`} />
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                <FileText className="size-5 text-muted-foreground" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{data.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  Read it in full before you sign
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 cursor-pointer"
              onClick={() => window.open(data.fileUrl, "_blank", "noopener,noreferrer")}
            >
              Open the document
            </Button>
          </div>

          {data.extension === "pdf" && (
            <object
              data={data.fileUrl}
              type="application/pdf"
              className="mt-4 h-[28rem] w-full rounded-lg border"
              aria-label={`Preview of ${data.fileName}`}
            >
              <p className="p-4 text-sm text-muted-foreground">
                Your browser cannot show the document inline. Use “Open the document” above.
              </p>
            </object>
          )}
        </div>

        {data.otherSigners.length > 0 && (
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm font-medium">Other signers</p>
            <ul className="mt-2 space-y-1.5">
              {data.otherSigners.map((signer) => (
                <li key={`${signer.name}-${signer.role}`} className="flex items-center gap-2">
                  <StatusBadge
                    color={CONTRACT_SIGNER_STATUS_COLORS[signer.status]}
                    label={CONTRACT_SIGNER_STATUS_LABELS[signer.status]}
                  />
                  <span className="min-w-0 truncate text-sm">
                    {signer.name}
                    {signer.role ? ` · ${signer.role}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.canSign ? (
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2">
              <PenLine className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">Add your signature</p>
            </div>

            <Tabs
              value={mode}
              onValueChange={(value) => setMode(value as ContractSignatureType)}
              className="mt-3 gap-3"
            >
              <TabsList>
                <TabsTrigger value="TYPED">Type it</TabsTrigger>
                <TabsTrigger value="DRAWN">Draw it</TabsTrigger>
              </TabsList>

              <TabsContent value="TYPED" className="space-y-2">
                <Label htmlFor="signature-typed">Your full name</Label>
                <Input
                  id="signature-typed"
                  value={typedName}
                  maxLength={120}
                  placeholder="Jane Doe"
                  onChange={(event) => setTypedName(event.target.value)}
                />
                {typedName.trim() && (
                  <div className="rounded-lg border bg-muted/20 px-4 py-6 text-center">
                    <span className="font-[cursive] text-2xl">{typedName.trim()}</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="DRAWN" className="space-y-2">
                <SignaturePad value={drawnSignature} onChange={setDrawnSignature} />
                <div className="space-y-1.5">
                  <Label htmlFor="signature-name">Your full name</Label>
                  <Input
                    id="signature-name"
                    value={typedName}
                    maxLength={120}
                    placeholder="Jane Doe"
                    onChange={(event) => setTypedName(event.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />

            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <Checkbox
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-0.5"
              />
              <span>
                I have read “{data.title}” and I agree to be bound by it. I understand this
                electronic signature carries the same weight as a signature on paper.
              </span>
            </label>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isSigning || isDeclining}
                onClick={() => setDeclineOpen(true)}
              >
                Decline to sign
              </Button>
              <Button
                type="button"
                className="cursor-pointer"
                disabled={!canSubmit || isSigning}
                onClick={onSign}
              >
                {isSigning ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShieldCheck className="size-4" />
                )}
                Sign the document
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/20 p-5 text-center">
            <p className="text-sm font-medium">This document is not open for your signature</p>
            <p className="mt-1 text-sm text-muted-foreground">{data.blockedReason}</p>
          </div>
        )}
      </div>

      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Decline to sign</DialogTitle>
            <DialogDescription>
              {data.companyName} will be told, and nobody else can sign until they send a new
              version.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-1.5">
            <Label htmlFor="decline-reason">Why are you declining?</Label>
            <Textarea
              id="decline-reason"
              value={declineReason}
              rows={4}
              maxLength={500}
              placeholder="The payment terms in clause 4 need to change first"
              onChange={(event) => setDeclineReason(event.target.value)}
            />
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={isDeclining}
              onClick={() => setDeclineOpen(false)}
            >
              Go back
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer"
              disabled={!declineReason.trim() || isDeclining}
              onClick={onDecline}
            >
              {isDeclining && <Loader2 className="size-4 animate-spin" />}
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/30 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  tone = "default",
}: {
  icon: typeof CheckCircle2;
  title: string;
  description: string;
  tone?: "default" | "success";
}) {
  return (
    <div className="rounded-xl border bg-card p-10 text-center">
      <span
        className={
          tone === "success"
            ? "mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"
            : "mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
        }
      >
        <Icon className="size-6" />
      </span>
      <h1 className="mt-4 text-lg font-semibold">{title}</h1>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
