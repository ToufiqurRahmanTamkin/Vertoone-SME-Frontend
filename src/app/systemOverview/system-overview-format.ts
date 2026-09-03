import type { StatusColor } from "@/components/shared/status-badge";
import type {
  DbConnectionState,
  IntegrationStatus,
  SystemActivityRow,
} from "@/types/domain/systemOverview";

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

export const formatBytes = (bytes: number | null | undefined): string => {
  const value = typeof bytes === "number" && isFinite(bytes) && bytes > 0 ? bytes : 0;
  if (value === 0) return "0 B";

  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), BYTE_UNITS.length - 1);
  const scaled = value / 1024 ** exponent;

  return `${scaled.toLocaleString(undefined, {
    maximumFractionDigits: scaled >= 100 || exponent === 0 ? 0 : 1,
  })} ${BYTE_UNITS[exponent]}`;
};

export const formatDuration = (seconds: number | null | undefined): string => {
  const total = typeof seconds === "number" && isFinite(seconds) && seconds > 0 ? seconds : 0;
  if (total < 60) return `${Math.round(total)}s`;

  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const formatMillis = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined) return "—";
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
};

export const DB_STATE_LABELS: Record<DbConnectionState, string> = {
  CONNECTED: "Connected",
  CONNECTING: "Connecting",
  DISCONNECTING: "Disconnecting",
  DISCONNECTED: "Disconnected",
  UNINITIALISED: "Not initialised",
};

export const DB_STATE_COLORS: Record<DbConnectionState, StatusColor> = {
  CONNECTED: "green",
  CONNECTING: "amber",
  DISCONNECTING: "amber",
  DISCONNECTED: "red",
  UNINITIALISED: "muted",
};

export const INTEGRATION_LABELS: Record<IntegrationStatus, string> = {
  READY: "Ready",
  STARTING: "Starting",
  NOT_CONFIGURED: "Not configured",
  DISABLED: "Disabled",
};

export const INTEGRATION_COLORS: Record<IntegrationStatus, StatusColor> = {
  READY: "green",
  STARTING: "amber",
  NOT_CONFIGURED: "amber",
  DISABLED: "muted",
};

export const SEVERITY_COLORS: Record<string, StatusColor> = {
  INFO: "blue",
  SUCCESS: "green",
  WARNING: "amber",
  CRITICAL: "red",
};

export const activityColor = (row: SystemActivityRow): StatusColor =>
  SEVERITY_COLORS[row.severity] ?? "muted";
