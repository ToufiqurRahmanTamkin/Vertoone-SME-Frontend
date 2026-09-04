import type { StatusColor } from "@/components/shared/status-badge";

export const API_KEY_SCOPES = [
  "read:contacts",
  "write:contacts",
  "read:invoices",
  "write:invoices",
  "read:products",
  "write:products",
  "read:orders",
  "write:orders",
  "read:employees",
  "read:reports",
] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export const WEBHOOK_EVENTS = [
  "invoice.paid",
  "invoice.overdue",
  "order.created",
  "order.fulfilled",
  "contact.created",
  "lead.converted",
  "product.stock_low",
  "employee.joined",
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export type ApiKeyStatus = "ACTIVE" | "REVOKED";

export const API_KEY_STATUS_LABELS: Record<ApiKeyStatus, string> = {
  ACTIVE: "Active",
  REVOKED: "Revoked",
};

export const API_KEY_STATUS_COLORS: Record<ApiKeyStatus, StatusColor> = {
  ACTIVE: "green",
  REVOKED: "zinc",
};

export type WebhookStatus = "ACTIVE" | "PAUSED" | "FAILING";

export const WEBHOOK_STATUS_LABELS: Record<WebhookStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  FAILING: "Failing",
};

export const WEBHOOK_STATUS_COLORS: Record<WebhookStatus, StatusColor> = {
  ACTIVE: "green",
  PAUSED: "zinc",
  FAILING: "red",
};

export type DeliveryStatus = "DELIVERED" | "FAILED" | "RETRYING";

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  DELIVERED: "Delivered",
  FAILED: "Failed",
  RETRYING: "Retrying",
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, StatusColor> = {
  DELIVERED: "green",
  FAILED: "red",
  RETRYING: "amber",
};

export interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  scopes: ApiKeyScope[];
  status: ApiKeyStatus;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

export interface WebhookRow {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  createdAt: string;
  lastDeliveryAt: string | null;
  failureCount: number;
}

export interface DeliveryRow {
  id: string;
  webhookName: string;
  event: WebhookEvent;
  status: DeliveryStatus;
  responseCode: number | null;
  durationMs: number;
  attemptedAt: string;
}

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 86_400_000).toISOString();

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

export const SAMPLE_API_KEYS: ApiKeyRow[] = [
  {
    id: "key_storefront",
    name: "Storefront sync",
    prefix: "vk_live_7f21",
    scopes: ["read:products", "write:orders", "read:invoices"],
    status: "ACTIVE",
    createdAt: daysAgo(64),
    lastUsedAt: hoursAgo(3),
    expiresAt: null,
  },
  {
    id: "key_reporting",
    name: "Reporting warehouse",
    prefix: "vk_live_b904",
    scopes: ["read:invoices", "read:orders", "read:reports"],
    status: "ACTIVE",
    createdAt: daysAgo(21),
    lastUsedAt: daysAgo(1),
    expiresAt: daysAgo(-180),
  },
  {
    id: "key_legacy",
    name: "Old import script",
    prefix: "vk_live_1c55",
    scopes: ["write:contacts"],
    status: "REVOKED",
    createdAt: daysAgo(240),
    lastUsedAt: daysAgo(96),
    expiresAt: null,
  },
];

export const SAMPLE_WEBHOOKS: WebhookRow[] = [
  {
    id: "hook_accounting",
    name: "Accounting bridge",
    url: "https://hooks.yourcompany.com/vertoone/invoices",
    events: ["invoice.paid", "invoice.overdue"],
    status: "ACTIVE",
    createdAt: daysAgo(45),
    lastDeliveryAt: hoursAgo(1),
    failureCount: 0,
  },
  {
    id: "hook_fulfilment",
    name: "Fulfilment queue",
    url: "https://ops.yourcompany.com/api/vertoone/orders",
    events: ["order.created", "order.fulfilled"],
    status: "FAILING",
    createdAt: daysAgo(12),
    lastDeliveryAt: hoursAgo(6),
    failureCount: 14,
  },
  {
    id: "hook_crm",
    name: "CRM mirror",
    url: "https://crm.yourcompany.com/inbound/vertoone",
    events: ["contact.created", "lead.converted"],
    status: "PAUSED",
    createdAt: daysAgo(88),
    lastDeliveryAt: daysAgo(9),
    failureCount: 2,
  },
];

export const SAMPLE_DELIVERIES: DeliveryRow[] = [
  {
    id: "dlv_1",
    webhookName: "Accounting bridge",
    event: "invoice.paid",
    status: "DELIVERED",
    responseCode: 200,
    durationMs: 184,
    attemptedAt: hoursAgo(1),
  },
  {
    id: "dlv_2",
    webhookName: "Fulfilment queue",
    event: "order.created",
    status: "FAILED",
    responseCode: 503,
    durationMs: 5_012,
    attemptedAt: hoursAgo(6),
  },
  {
    id: "dlv_3",
    webhookName: "Fulfilment queue",
    event: "order.created",
    status: "RETRYING",
    responseCode: null,
    durationMs: 0,
    attemptedAt: hoursAgo(6),
  },
  {
    id: "dlv_4",
    webhookName: "Accounting bridge",
    event: "invoice.overdue",
    status: "DELIVERED",
    responseCode: 200,
    durationMs: 221,
    attemptedAt: hoursAgo(20),
  },
  {
    id: "dlv_5",
    webhookName: "CRM mirror",
    event: "contact.created",
    status: "DELIVERED",
    responseCode: 201,
    durationMs: 402,
    attemptedAt: daysAgo(9),
  },
];

export const randomKeyId = (): string =>
  `key_${Math.random().toString(36).slice(2, 10)}`;

export const randomWebhookId = (): string =>
  `hook_${Math.random().toString(36).slice(2, 10)}`;

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

const randomChunk = (length: number): string =>
  Array.from(
    { length },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  ).join("");

export const mintApiKey = (): { prefix: string; secret: string } => {
  const prefix = `vk_live_${randomChunk(4)}`;
  return { prefix, secret: `${prefix}_${randomChunk(24)}` };
};

export const mintSigningSecret = (): string => `whsec_${randomChunk(32)}`;
