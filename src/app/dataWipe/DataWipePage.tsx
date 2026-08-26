import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WIPE_SCOPE_COLORS, WIPE_SCOPE_DESCRIPTIONS, WIPE_SCOPE_LABELS } from "@/constant";
import { formatNumber } from "@/lib/amount";
import {
  useExecuteDataWipeMutation,
  useGetDataWipePreviewQuery,
} from "@/redux/apis/dataWipeApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import { WIPE_SCOPES, type DataWipeResult, type WipeScope } from "@/types/domain/dataWipe";
import { ShieldAlert, TriangleAlert } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

export default function DataWipePage() {
  const { data: preview, isLoading } = useGetDataWipePreviewQuery();
  const [executeWipe, { isLoading: isWiping }] = useExecuteDataWipeMutation();

  const [scope, setScope] = React.useState<WipeScope>("SOFT_DELETED");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [result, setResult] = React.useState<DataWipeResult | null>(null);

  const phrase = preview?.confirmationPhrase ?? "";
  const targets = preview?.targets ?? [];
  const affected = targets.filter((target) => target.scopes.includes(scope));

  const erasedCountFor = (liveCount: number, softDeletedCount: number): number =>
    scope === "SOFT_DELETED" ? softDeletedCount : liveCount + softDeletedCount;

  const affectedCount = affected.reduce(
    (sum, target) => sum + erasedCountFor(target.liveCount, target.softDeletedCount),
    0
  );

  const closeConfirm = () => {
    setConfirmOpen(false);
    setPassword("");
    setConfirmation("");
  };

  const submit = async () => {
    try {
      const wiped = await executeWipe({ scope, password, confirmation }).unwrap();
      setResult(wiped);
      toast.success(`${formatNumber(wiped.totalDeleted)} record(s) permanently removed`);
      closeConfirm();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "The wipe could not be completed");
    }
  };

  return (
    <>
      <PageHeader
        title="Wipe Data"
        description="Permanently erase system data. This is the only place data is ever hard deleted."
      />

      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
        <p className="text-muted-foreground">
          Everywhere else in the app, deleting a record only hides it &mdash; it stays recoverable
          in the database. A wipe here bypasses that and removes rows permanently.{" "}
          <span className="font-medium text-foreground">There is no undo and no backup.</span>{" "}
          {preview
            ? `${formatNumber(preview.protectedSuperAdmins)} super admin account(s) are always preserved so you never lock yourself out.`
            : null}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose what to erase</CardTitle>
          <CardDescription>
            Each option is a superset of the one above it. Start with the narrowest that does the
            job.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={scope}
            onValueChange={(value) => setScope(value as WipeScope)}
            className="gap-3"
          >
            {WIPE_SCOPES.map((option) => (
              <Label
                key={option}
                htmlFor={`scope-${option}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/40"
              >
                <RadioGroupItem value={option} id={`scope-${option}`} className="mt-0.5" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{WIPE_SCOPE_LABELS[option]}</span>
                    <StatusBadge
                      color={WIPE_SCOPE_COLORS[option]}
                      label={option.replace(/_/g, " ")}
                    />
                  </div>
                  <p className="text-xs font-normal text-muted-foreground">
                    {WIPE_SCOPE_DESCRIPTIONS[option]}
                  </p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What this removes</CardTitle>
          <CardDescription>
            {isLoading
              ? "Counting records..."
              : `${formatNumber(affectedCount)} record(s) across ${affected.length} collection(s) will be permanently deleted.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collection</TableHead>
                    <TableHead className="text-right">Live</TableHead>
                    <TableHead className="text-right">Already deleted</TableHead>
                    <TableHead className="text-right">Will be erased</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targets.map((target) => {
                    const included = target.scopes.includes(scope);
                    return (
                      <TableRow key={target.key} className={included ? undefined : "opacity-50"}>
                        <TableCell>
                          <p className="font-medium">{target.label}</p>
                          <p className="max-w-[28rem] text-xs text-muted-foreground">
                            {target.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(target.liveCount)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatNumber(target.softDeletedCount)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {included
                            ? formatNumber(
                                erasedCountFor(target.liveCount, target.softDeletedCount)
                              )
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <Button
            variant="destructive"
            className="cursor-pointer"
            disabled={isLoading || affectedCount === 0}
            onClick={() => setConfirmOpen(true)}
          >
            <TriangleAlert className="size-4" />
            {WIPE_SCOPE_LABELS[scope]}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Last wipe</CardTitle>
            <CardDescription>
              {WIPE_SCOPE_LABELS[result.scope]} removed {formatNumber(result.totalDeleted)}{" "}
              record(s).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {result.entries.map((entry) => (
                <li key={entry.key} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{entry.label}</span>
                  <span className="font-medium tabular-nums">{formatNumber(entry.deleted)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => (open ? setConfirmOpen(true) : closeConfirm())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {WIPE_SCOPE_LABELS[scope].toLowerCase()}</DialogTitle>
            <DialogDescription>
              {formatNumber(affectedCount)} record(s) will be permanently deleted. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wipe-password">Your password</Label>
              <Input
                id="wipe-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Re-enter your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wipe-confirmation">
                Type <span className="font-mono font-semibold">{phrase}</span> to confirm
              </Label>
              <Input
                id="wipe-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={phrase}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={isWiping || !password || confirmation.trim() !== phrase}
              onClick={submit}
            >
              {isWiping ? "Erasing..." : "Erase permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
