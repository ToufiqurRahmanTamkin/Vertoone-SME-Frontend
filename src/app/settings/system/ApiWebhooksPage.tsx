import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useModulePermission } from "@/hooks/use-permission";
import { formatDateTime, safeDistanceToNow } from "@/lib/date";
import { formatNumber } from "@/lib/amount";
import {
  API_KEY_STATUS_COLORS,
  API_KEY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
  DELIVERY_STATUS_LABELS,
  SAMPLE_API_KEYS,
  SAMPLE_DELIVERIES,
  SAMPLE_WEBHOOKS,
  WEBHOOK_STATUS_COLORS,
  WEBHOOK_STATUS_LABELS,
  mintApiKey,
  mintSigningSecret,
  randomKeyId,
  randomWebhookId,
  type ApiKeyRow,
  type WebhookRow,
} from "./components/apiWebhookData";
import { ApiKeyFormModal, type ApiKeyFormValues } from "./components/ApiKeyFormModal";
import { SecretRevealDialog } from "./components/SecretRevealDialog";
import { WebhookFormModal, type WebhookFormValues } from "./components/WebhookFormModal";
import {
  Ban,
  Hammer,
  KeyRound,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCcw,
  Send,
  Trash2,
  Webhook,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const NOT_WIRED = "Nothing is sent yet — this screen is the interface only.";

export default function ApiWebhooksPage() {
  const access = useModulePermission("/settings/system/api-and-webhooks");

  const [apiKeys, setApiKeys] = React.useState<ApiKeyRow[]>(SAMPLE_API_KEYS);
  const [webhooks, setWebhooks] = React.useState<WebhookRow[]>(SAMPLE_WEBHOOKS);

  const [keyModalOpen, setKeyModalOpen] = React.useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = React.useState(false);
  const [editingWebhook, setEditingWebhook] = React.useState<WebhookRow | null>(null);
  const [pendingRevoke, setPendingRevoke] = React.useState<ApiKeyRow | null>(null);
  const [pendingDeleteHook, setPendingDeleteHook] = React.useState<WebhookRow | null>(null);
  const [revealed, setRevealed] = React.useState<{ title: string; secret: string } | null>(null);

  const activeKeys = apiKeys.filter((key) => key.status === "ACTIVE").length;
  const activeHooks = webhooks.filter((hook) => hook.status === "ACTIVE").length;
  const failingHooks = webhooks.filter((hook) => hook.status === "FAILING").length;
  const deliveredCount = SAMPLE_DELIVERIES.filter(
    (delivery) => delivery.status === "DELIVERED"
  ).length;

  const createKey = (values: ApiKeyFormValues) => {
    const { prefix, secret } = mintApiKey();
    const expiresAt =
      values.expiry === "never"
        ? null
        : new Date(Date.now() + Number(values.expiry) * 86_400_000).toISOString();

    setApiKeys((current) => [
      {
        id: randomKeyId(),
        name: values.name,
        prefix,
        scopes: values.scopes,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        expiresAt,
      },
      ...current,
    ]);

    setRevealed({ title: `${values.name} API key`, secret });
  };

  const revokeKey = () => {
    if (!pendingRevoke) return;

    setApiKeys((current) =>
      current.map((key) =>
        key.id === pendingRevoke.id ? { ...key, status: "REVOKED" as const } : key
      )
    );
    toast.success(`${pendingRevoke.name} revoked`);
    setPendingRevoke(null);
  };

  const rollKey = (key: ApiKeyRow) => {
    const { prefix, secret } = mintApiKey();

    setApiKeys((current) =>
      current.map((entry) =>
        entry.id === key.id
          ? { ...entry, prefix, createdAt: new Date().toISOString(), lastUsedAt: null }
          : entry
      )
    );

    setRevealed({ title: `${key.name} API key`, secret });
  };

  const saveWebhook = (values: WebhookFormValues) => {
    if (editingWebhook) {
      setWebhooks((current) =>
        current.map((hook) =>
          hook.id === editingWebhook.id
            ? {
                ...hook,
                name: values.name,
                url: values.url,
                events: values.events,
                status: values.isActive ? ("ACTIVE" as const) : ("PAUSED" as const),
              }
            : hook
        )
      );
      toast.success(`${values.name} updated`);
      return;
    }

    setWebhooks((current) => [
      {
        id: randomWebhookId(),
        name: values.name,
        url: values.url,
        events: values.events,
        status: values.isActive ? "ACTIVE" : "PAUSED",
        createdAt: new Date().toISOString(),
        lastDeliveryAt: null,
        failureCount: 0,
      },
      ...current,
    ]);

    setRevealed({
      title: `${values.name} signing secret`,
      secret: mintSigningSecret(),
    });
  };

  const toggleWebhook = (hook: WebhookRow) => {
    const paused = hook.status === "PAUSED";

    setWebhooks((current) =>
      current.map((entry) =>
        entry.id === hook.id
          ? { ...entry, status: paused ? ("ACTIVE" as const) : ("PAUSED" as const) }
          : entry
      )
    );
    toast.success(`${hook.name} ${paused ? "resumed" : "paused"}`);
  };

  const deleteWebhook = () => {
    if (!pendingDeleteHook) return;

    setWebhooks((current) => current.filter((hook) => hook.id !== pendingDeleteHook.id));
    toast.success(`${pendingDeleteHook.name} removed`);
    setPendingDeleteHook(null);
  };

  return (
    <>
      <PageHeader
        title="API & webhooks"
        description="Keys that let other systems read your data, and the endpoints we call when something happens."
        actions={
          <Badge variant="secondary" className="px-2.5 py-1">
            <Hammer className="size-3" />
            UI only
          </Badge>
        }
      />

      <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
        This screen is the interface only. Keys shown here are samples, nothing is stored, and no
        webhook is ever called — the service behind it comes in a later step.
      </p>

      <StatGrid>
        <Stat>
          <StatLabel>Active keys</StatLabel>
          <StatValue>{formatNumber(activeKeys)}</StatValue>
          <StatDescription>{formatNumber(apiKeys.length - activeKeys)} revoked</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Endpoints</StatLabel>
          <StatValue>{formatNumber(activeHooks)}</StatValue>
          <StatDescription>
            {formatNumber(webhooks.length - activeHooks)} paused or failing
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Failing</StatLabel>
          <StatValue>{formatNumber(failingHooks)}</StatValue>
          <StatDescription>Endpoints returning errors</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Recent deliveries</StatLabel>
          <StatValue>{formatNumber(deliveredCount)}</StatValue>
          <StatDescription>
            of {formatNumber(SAMPLE_DELIVERIES.length)} attempts shown below
          </StatDescription>
        </Stat>
      </StatGrid>

      <SectionCard
        icon={KeyRound}
        title="API keys"
        description="Each key carries its own permissions. Revoke one and calls using it stop straight away."
        action={
          access.canCreate && (
            <ActionButton icon={Plus} label="New key" onClick={() => setKeyModalOpen(true)} />
          )
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDateTime(key.createdAt)}
                      {key.expiresAt ? ` · expires ${formatDateTime(key.expiresAt)}` : ""}
                    </p>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {key.prefix}…
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.slice(0, 2).map((scope) => (
                        <Badge key={scope} variant="outline" className="text-[10px]">
                          {scope}
                        </Badge>
                      ))}
                      {key.scopes.length > 2 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{key.scopes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {key.lastUsedAt ? safeDistanceToNow(key.lastUsedAt) : "Never"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      color={API_KEY_STATUS_COLORS[key.status]}
                      label={API_KEY_STATUS_LABELS[key.status]}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer"
                            aria-label={`Actions for ${key.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled={!access.canEdit || key.status === "REVOKED"}
                            onSelect={() => rollKey(key)}
                          >
                            <RefreshCcw className="size-4" />
                            Roll key
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={!access.canDelete || key.status === "REVOKED"}
                            onSelect={() => setPendingRevoke(key)}
                          >
                            <Ban className="size-4" />
                            Revoke
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <SectionCard
        icon={Webhook}
        title="Webhook endpoints"
        description="We POST a signed JSON payload to each endpoint when one of its events happens."
        action={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Add endpoint"
              onClick={() => {
                setEditingWebhook(null);
                setWebhookModalOpen(true);
              }}
            />
          )
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Last delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((hook) => (
                <TableRow key={hook.id}>
                  <TableCell>
                    <p className="font-medium">{hook.name}</p>
                    <p className="max-w-70 truncate text-xs text-muted-foreground">{hook.url}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {hook.events.slice(0, 2).map((event) => (
                        <Badge key={event} variant="outline" className="text-[10px]">
                          {event}
                        </Badge>
                      ))}
                      {hook.events.length > 2 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{hook.events.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {hook.lastDeliveryAt ? safeDistanceToNow(hook.lastDeliveryAt) : "Never"}
                    {hook.failureCount > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-500">
                        {hook.failureCount} failed
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      color={WEBHOOK_STATUS_COLORS[hook.status]}
                      label={WEBHOOK_STATUS_LABELS[hook.status]}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer"
                            aria-label={`Actions for ${hook.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled={!access.canEdit}
                            onSelect={() => {
                              setEditingWebhook(hook);
                              setWebhookModalOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!access.canEdit}
                            onSelect={() => toggleWebhook(hook)}
                          >
                            {hook.status === "PAUSED" ? (
                              <Play className="size-4" />
                            ) : (
                              <Pause className="size-4" />
                            )}
                            {hook.status === "PAUSED" ? "Resume" : "Pause"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!access.canEdit}
                            onSelect={() => toast.info(`Test ping for ${hook.name}`, {
                              description: NOT_WIRED,
                            })}
                          >
                            <Send className="size-4" />
                            Send test ping
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={!access.canDelete}
                            onSelect={() => setPendingDeleteHook(hook)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <SectionCard
        icon={Send}
        title="Recent deliveries"
        description="The last attempts we made, and how each endpoint answered."
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Took</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_DELIVERIES.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.webhookName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {delivery.event}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {delivery.responseCode ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {delivery.durationMs > 0 ? `${delivery.durationMs} ms` : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {safeDistanceToNow(delivery.attemptedAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      color={DELIVERY_STATUS_COLORS[delivery.status]}
                      label={DELIVERY_STATUS_LABELS[delivery.status]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <ApiKeyFormModal
        open={keyModalOpen}
        onOpenChange={setKeyModalOpen}
        onCreate={createKey}
      />

      <WebhookFormModal
        open={webhookModalOpen}
        onOpenChange={setWebhookModalOpen}
        webhook={editingWebhook}
        onSave={saveWebhook}
      />

      <SecretRevealDialog
        open={Boolean(revealed)}
        onOpenChange={(open) => !open && setRevealed(null)}
        title={revealed?.title ?? ""}
        description="Store this somewhere safe — we cannot show it again."
        secret={revealed?.secret ?? ""}
      />

      <ConfirmDialog
        open={Boolean(pendingRevoke)}
        onOpenChange={(open) => !open && setPendingRevoke(null)}
        title={`Revoke "${pendingRevoke?.name ?? ""}"?`}
        description="Anything still using this key stops working immediately. This cannot be undone."
        confirmText="Revoke"
        variant="destructive"
        onConfirm={revokeKey}
      />

      <ConfirmDialog
        open={Boolean(pendingDeleteHook)}
        onOpenChange={(open) => !open && setPendingDeleteHook(null)}
        title={`Delete "${pendingDeleteHook?.name ?? ""}"?`}
        description="We stop calling this endpoint and its delivery history goes with it."
        confirmText="Delete"
        variant="destructive"
        onConfirm={deleteWebhook}
      />
    </>
  );
}
