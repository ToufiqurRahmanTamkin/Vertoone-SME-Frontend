import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import {
  WIPE_SCOPE_COLORS,
  WIPE_SCOPE_COMPANY_DESCRIPTIONS,
  WIPE_SCOPE_DESCRIPTIONS,
  WIPE_SCOPE_LABELS,
} from "@/constant";
import { formatNumber } from "@/lib/amount";
import { cn } from "@/lib/utils";
import { useGetCompaniesQuery } from "@/redux/apis/companyApis";
import {
  useExecuteDataWipeMutation,
  useGetDataWipePreviewQuery,
} from "@/redux/apis/dataWipeApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import { WIPE_SCOPES, type DataWipeResult, type WipeScope } from "@/types/domain/dataWipe";
import { Building2, Check, ChevronsUpDown, Globe2, ShieldAlert, TriangleAlert } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

type WipeTarget = "SYSTEM" | "COMPANY";

const TARGET_OPTIONS: { value: WipeTarget; label: string; description: string; icon: typeof Globe2 }[] =
  [
    {
      value: "SYSTEM",
      label: "The whole system",
      description: "Every company, every ledger and, at the widest setting, the platform catalog.",
      icon: Globe2,
    },
    {
      value: "COMPANY",
      label: "One specific company",
      description:
        "Only the records that belong to the company you pick. Nothing owned by any other company is touched.",
      icon: Building2,
    },
  ];

export default function DataWipePage() {
  const [target, setTarget] = React.useState<WipeTarget>("SYSTEM");
  const [companyId, setCompanyId] = React.useState("");
  const [companyPickerOpen, setCompanyPickerOpen] = React.useState(false);
  const [scope, setScope] = React.useState<WipeScope>("SOFT_DELETED");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [result, setResult] = React.useState<DataWipeResult | null>(null);

  const isCompanyWipe = target === "COMPANY";
  const awaitingCompany = isCompanyWipe && !companyId;

  const { data: companyData, isLoading: isCompaniesLoading } = useGetCompaniesQuery(
    { limit: 100 },
    { skip: !isCompanyWipe }
  );
  const companies = React.useMemo(() => companyData?.data ?? [], [companyData]);
  const selectedCompany = companies.find((company) => company._id === companyId) ?? null;

  const { data: preview, isLoading, isFetching } = useGetDataWipePreviewQuery(
    isCompanyWipe ? { companyId } : undefined,
    { skip: awaitingCompany }
  );
  const [executeWipe, { isLoading: isWiping }] = useExecuteDataWipeMutation();

  const phrase = preview?.confirmationPhrase ?? "";
  const targets = preview?.targets ?? [];
  const affected = targets.filter((entry) => entry.scopes.includes(scope));

  const erasedCountFor = (liveCount: number, softDeletedCount: number): number =>
    scope === "SOFT_DELETED" ? softDeletedCount : liveCount + softDeletedCount;

  const affectedCount = affected.reduce(
    (sum, entry) => sum + erasedCountFor(entry.liveCount, entry.softDeletedCount),
    0
  );

  const isCounting = isLoading || isFetching;

  const selectTarget = (value: WipeTarget) => {
    setTarget(value);
    if (value === "SYSTEM") setCompanyId("");
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setPassword("");
    setConfirmation("");
  };

  const submit = async () => {
    try {
      const wiped = await executeWipe({
        scope,
        password,
        confirmation,
        ...(isCompanyWipe ? { companyId } : {}),
      }).unwrap();
      setResult(wiped);
      toast.success(`${formatNumber(wiped.totalDeleted)} record(s) permanently removed`);
      if (isCompanyWipe) {
        setTarget("SYSTEM");
        setCompanyId("");
      }
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
          <CardTitle>Choose what to erase from</CardTitle>
          <CardDescription>
            Narrow the wipe to a single company when you only need that customer gone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={target}
            onValueChange={(value) => selectTarget(value as WipeTarget)}
            className="gap-3 sm:grid sm:grid-cols-2"
          >
            {TARGET_OPTIONS.map((option) => (
              <Label
                key={option.value}
                htmlFor={`target-${option.value}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/40"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`target-${option.value}`}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <span className="flex items-center gap-2 font-medium">
                    <option.icon className="size-4 text-muted-foreground" />
                    {option.label}
                  </span>
                  <p className="text-xs font-normal text-muted-foreground">{option.description}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>

          {isCompanyWipe && (
            <div className="space-y-2">
              <Label htmlFor="wipe-company">Company</Label>
              <Popover open={companyPickerOpen} onOpenChange={setCompanyPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="wipe-company"
                    variant="outline"
                    role="combobox"
                    aria-expanded={companyPickerOpen}
                    disabled={isCompaniesLoading}
                    className={cn(
                      "w-full cursor-pointer justify-between font-normal sm:max-w-md",
                      !selectedCompany && "text-muted-foreground"
                    )}
                  >
                    <span className="min-w-0 truncate">
                      {selectedCompany
                        ? `${selectedCompany.name} — ${selectedCompany.ownerEmail}`
                        : "Select the company to erase"}
                    </span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search companies..." />
                    <CommandList>
                      <CommandEmpty>No companies found.</CommandEmpty>
                      <CommandGroup>
                        {companies.map((company) => (
                          <CommandItem
                            key={company._id}
                            value={`${company.name} ${company.ownerEmail}`}
                            className={cn(companyId === company._id && "bg-primary/10")}
                            onSelect={() => {
                              setCompanyId(company._id);
                              setCompanyPickerOpen(false);
                            }}
                          >
                            <span className="min-w-0 truncate">
                              {company.name}
                              <span className="text-muted-foreground"> — {company.ownerEmail}</span>
                            </span>
                            <Check
                              className={cn(
                                "ml-auto size-4",
                                companyId === company._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Platform-wide records — the plan catalog, user guides and system settings — are
                never part of a company wipe.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose how much to erase</CardTitle>
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
                    {isCompanyWipe
                      ? WIPE_SCOPE_COMPANY_DESCRIPTIONS[option]
                      : WIPE_SCOPE_DESCRIPTIONS[option]}
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
            {awaitingCompany
              ? "Pick a company to see exactly what would be erased."
              : isCounting
                ? "Counting records..."
                : `${formatNumber(affectedCount)} record(s) across ${affected.length} collection(s) will be permanently deleted${
                    preview?.companyName ? ` for ${preview.companyName}` : ""
                  }.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {awaitingCompany ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No company selected yet.
            </div>
          ) : isCounting ? (
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
                  {targets.map((entry) => {
                    const included = entry.scopes.includes(scope);
                    return (
                      <TableRow key={entry.key} className={included ? undefined : "opacity-50"}>
                        <TableCell>
                          <p className="font-medium">{entry.label}</p>
                          <p className="max-w-[28rem] text-xs text-muted-foreground">
                            {entry.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(entry.liveCount)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatNumber(entry.softDeletedCount)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {included
                            ? formatNumber(erasedCountFor(entry.liveCount, entry.softDeletedCount))
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
            disabled={awaitingCompany || isCounting || affectedCount === 0}
            onClick={() => setConfirmOpen(true)}
          >
            <TriangleAlert className="size-4" />
            {WIPE_SCOPE_LABELS[scope]}
            {preview?.companyName ? ` — ${preview.companyName}` : ""}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Last wipe</CardTitle>
            <CardDescription>
              {WIPE_SCOPE_LABELS[result.scope]}
              {result.companyName ? ` for ${result.companyName}` : ""} removed{" "}
              {formatNumber(result.totalDeleted)} record(s).
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
              {formatNumber(affectedCount)} record(s)
              {preview?.companyName ? ` belonging to ${preview.companyName}` : ""} will be
              permanently deleted. This cannot be undone.
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
