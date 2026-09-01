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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import {
  useSearchEmailRecipientsQuery,
  useSendEmailTemplateMutation,
} from "@/redux/apis/emailBuilderApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type {
  EmailRecipientRef,
  EmailTemplateListItem,
  SendEmailTemplateResult,
} from "@/types/domain/emailBuilder";
import { Loader2, Search, Send, Trash2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { parseEmailList } from "../emailBuilder.utils";

type DirectorySource = "CONTACT" | "LEAD" | "EMPLOYEE";

const SOURCE_LABELS: Record<DirectorySource, string> = {
  CONTACT: "Contacts",
  LEAD: "Leads",
  EMPLOYEE: "Employees",
};

interface SendEmailDialogProps {
  template: EmailTemplateListItem | null;
  onOpenChange: (open: boolean) => void;
}

function DirectoryPicker({
  source,
  selected,
  onToggle,
}: {
  source: DirectorySource;
  selected: Map<string, EmailRecipientRef>;
  onToggle: (person: EmailRecipientRef) => void;
}) {
  const [search, setSearch] = React.useState("");
  const debounced = useDebounce(search, 300);

  const { data: people = [], isFetching } = useSearchEmailRecipientsQuery({
    source,
    search: debounced || undefined,
  });

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search ${SOURCE_LABELS[source].toLowerCase()}...`}
          className="pl-8"
        />
      </div>

      <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-1.5">
        {isFetching && people.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">Loading…</p>
        )}

        {!isFetching && people.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Nobody here has an email address on file yet.
          </p>
        )}

        {people.map((person) => {
          const checked = selected.has(person.email);

          return (
            <button
              key={`${person.source}-${person._id}`}
              type="button"
              onClick={() => onToggle(person)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                checked ? "bg-primary/10 text-foreground" : "hover:bg-muted"
              )}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{person.name || person.email}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {person.email}
                </span>
              </span>
              {person.contactCompany && (
                <span className="shrink-0 truncate text-[11px] text-muted-foreground">
                  {person.contactCompany}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SendEmailForm({
  template,
  onOpenChange,
}: {
  template: EmailTemplateListItem;
  onOpenChange: (open: boolean) => void;
}) {
  const [sendTemplate, { isLoading }] = useSendEmailTemplateMutation();

  const [selected, setSelected] = React.useState<Map<string, EmailRecipientRef>>(new Map());
  const [manualText, setManualText] = React.useState("");
  const [subject, setSubject] = React.useState(template.subject);
  const [senderName, setSenderName] = React.useState("");
  const [replyTo, setReplyTo] = React.useState("");
  const [result, setResult] = React.useState<SendEmailTemplateResult | null>(null);

  const toggle = (person: EmailRecipientRef) => {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(person.email)) next.delete(person.email);
      else next.set(person.email, person);
      return next;
    });
  };

  const manualEmails = React.useMemo(() => parseEmailList(manualText), [manualText]);

  const directoryPeople = React.useMemo(() => [...selected.values()], [selected]);

  const totalRecipients = React.useMemo(() => {
    const seen = new Set(directoryPeople.map((person) => person.email));
    return directoryPeople.length + manualEmails.filter((email) => !seen.has(email)).length;
  }, [directoryPeople, manualEmails]);

  const send = async () => {
    const chosen = directoryPeople.reduce<{
      contactIds: string[];
      leadIds: string[];
      employeeIds: string[];
    }>(
      (accumulator, person) => {
        if (person.source === "CONTACT") accumulator.contactIds.push(person._id);
        if (person.source === "LEAD") accumulator.leadIds.push(person._id);
        if (person.source === "EMPLOYEE") accumulator.employeeIds.push(person._id);
        return accumulator;
      },
      { contactIds: [], leadIds: [], employeeIds: [] }
    );

    try {
      const outcome = await sendTemplate({
        id: template._id,
        body: {
          recipients: manualEmails.map((email) => ({ email })),
          ...chosen,
          subject: subject.trim() || undefined,
          senderName: senderName.trim() || undefined,
          replyTo: replyTo.trim() || undefined,
        },
      }).unwrap();

      setResult(outcome);

      if (outcome.sent > 0) {
        toast.success(
          `Sent to ${outcome.sent} recipient${outcome.sent === 1 ? "" : "s"}`,
          outcome.failed > 0 ? { description: `${outcome.failed} could not be delivered.` } : undefined
        );
      } else if (outcome.skipped > 0) {
        toast.warning("Nothing was delivered", {
          description: "No SMTP server is configured, so the emails were recorded but not sent.",
        });
      } else {
        toast.error("None of the emails went out");
      }
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send this email");
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Send &ldquo;{template.name}&rdquo;</DialogTitle>
        <DialogDescription>
          Pick who gets this. Everyone receives their own copy with personalisation filled in.
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="space-y-5">
        {result ? (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sent</p>
                <p className="text-xl font-semibold tabular-nums">{result.sent}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Failed
                </p>
                <p className="text-xl font-semibold tabular-nums">{result.failed}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Not delivered
                </p>
                <p className="text-xl font-semibold tabular-nums">{result.skipped}</p>
              </div>
            </div>

            {!result.isMailConfigured && (
              <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
                No SMTP server is configured on this deployment, so these were recorded in your
                history but not actually delivered.
              </p>
            )}

            <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-1.5">
              {result.results.map((row) => (
                <div
                  key={row.email}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs"
                >
                  <span className="min-w-0 truncate">{row.email}</span>
                  <StatusBadge
                    color={
                      row.status === "SENT" ? "green" : row.status === "FAILED" ? "red" : "amber"
                    }
                    label={row.status === "SENT" ? "Sent" : row.status === "FAILED" ? "Failed" : "Not sent"}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="send-subject" className="text-xs font-medium text-muted-foreground">
                Subject line
              </Label>
              <Input
                id="send-subject"
                value={subject}
                maxLength={200}
                onChange={(event) => setSubject(event.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="send-from" className="text-xs font-medium text-muted-foreground">
                  From name
                </Label>
                <Input
                  id="send-from"
                  value={senderName}
                  maxLength={80}
                  placeholder="Uses your Business Tools setting"
                  onChange={(event) => setSenderName(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="send-reply" className="text-xs font-medium text-muted-foreground">
                  Reply-to
                </Label>
                <Input
                  id="send-reply"
                  value={replyTo}
                  maxLength={120}
                  placeholder="Uses your Business Tools setting"
                  onChange={(event) => setReplyTo(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm">Recipients</Label>
                <Badge variant="secondary" className="tabular-nums">
                  {totalRecipients} selected
                </Badge>
              </div>

              <Tabs defaultValue="CONTACT">
                <TabsList className="w-full">
                  <TabsTrigger value="CONTACT" className="flex-1">
                    Contacts
                  </TabsTrigger>
                  <TabsTrigger value="LEAD" className="flex-1">
                    Leads
                  </TabsTrigger>
                  <TabsTrigger value="EMPLOYEE" className="flex-1">
                    Employees
                  </TabsTrigger>
                  <TabsTrigger value="MANUAL" className="flex-1">
                    Type in
                  </TabsTrigger>
                </TabsList>

                {(["CONTACT", "LEAD", "EMPLOYEE"] as DirectorySource[]).map((source) => (
                  <TabsContent key={source} value={source} className="pt-3">
                    <DirectoryPicker source={source} selected={selected} onToggle={toggle} />
                  </TabsContent>
                ))}

                <TabsContent value="MANUAL" className="space-y-2 pt-3">
                  <Textarea
                    value={manualText}
                    rows={5}
                    placeholder="ayesha@example.com, sam@example.com"
                    onChange={(event) => setManualText(event.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Separate addresses with commas, spaces or new lines. We found{" "}
                    {manualEmails.length} valid address{manualEmails.length === 1 ? "" : "es"}.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {directoryPeople.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Picked from your records
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setSelected(new Map())}
                  >
                    <Trash2 className="mr-1.5 size-3.5" />
                    Clear
                  </Button>
                </div>
                <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                  {directoryPeople.map((person) => (
                    <button
                      key={person.email}
                      type="button"
                      onClick={() => toggle(person)}
                      className="flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-[11px] transition-colors hover:bg-muted"
                    >
                      {person.name || person.email}
                      <X className="size-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          {result ? "Done" : "Cancel"}
        </Button>
        {!result && (
          <Button type="button" onClick={send} disabled={isLoading || totalRecipients === 0}>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Send to {totalRecipients}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

export function SendEmailDialog({ template, onOpenChange }: SendEmailDialogProps) {
  return (
    <Dialog open={Boolean(template)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {template && (
          <SendEmailForm key={template._id} template={template} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  );
}
