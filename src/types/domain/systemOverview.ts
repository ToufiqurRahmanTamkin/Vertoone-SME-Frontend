export const DB_CONNECTION_STATES = [
  "DISCONNECTED",
  "CONNECTED",
  "CONNECTING",
  "DISCONNECTING",
  "UNINITIALISED",
] as const;
export type DbConnectionState = (typeof DB_CONNECTION_STATES)[number];

export const INTEGRATION_STATUSES = ["READY", "STARTING", "NOT_CONFIGURED", "DISABLED"] as const;
export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];

export interface RuntimeInfo {
  appName: string;
  environment: string;
  nodeVersion: string;
  platform: string;
  apiPrefix: string;
  uptimeSeconds: number;
  serverless: boolean;
  memoryUsedBytes: number;
  memoryTotalBytes: number;
}

export interface DatabaseInfo {
  state: DbConnectionState;
  name: string;
  host: string;
  collections: number;
  documents: number;
  dataSizeBytes: number;
  storageSizeBytes: number;
  indexSizeBytes: number;
  statsAvailable: boolean;
}

export interface RealtimeInfo {
  enabled: boolean;
  ready: boolean;
  path: string;
  connections: number;
}

export interface IntegrationInfo {
  key: string;
  label: string;
  status: IntegrationStatus;
  detail: string;
}

export interface RecordCounts {
  companies: number;
  concerns: number;
  users: number;
  maintainers: number;
  plans: number;
  subscriptions: number;
  invoices: number;
  incomes: number;
  expenses: number;
  emails: number;
  activities: number;
}

export interface JobInfo {
  key: string;
  label: string;
  description: string;
  scheduled: boolean;
  intervalMinutes: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  lastDurationMs: number | null;
  runCount: number;
  lastError: string | null;
  lastSummary: string;
}

export interface EmailHealth {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  lastSentAt: string | null;
  configured: boolean;
  fromAddress: string;
}

export interface SecurityInfo {
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  passwordHashRounds: number;
  rateLimitEnabled: boolean;
  apiRequestsPerWindow: number;
  apiWindowMinutes: number;
  loginAttemptsPerWindow: number;
  activeSessions: number;
  signInsLast24h: number;
  failedSignInsLast24h: number;
}

export interface StorageInfo {
  provider: string;
  configured: boolean;
  folder: string;
  maxFileSizeBytes: number;
}

export interface ConfigurationSnapshot {
  appName: string;
  defaultCurrency: string;
  defaultTimezone: string;
  trialDays: number;
  allowSignups: boolean;
  maintenanceMode: boolean;
  enabledPaymentMethods: string[];
  defaultPaymentMethod: string;
}

export interface SystemActivityRow {
  _id: string;
  action: string;
  category: string;
  severity: string;
  message: string;
  actorName: string;
  createdAt: string;
}

export interface SystemOverview {
  generatedAt: string;
  runtime: RuntimeInfo;
  database: DatabaseInfo;
  realtime: RealtimeInfo;
  integrations: IntegrationInfo[];
  records: RecordCounts;
  jobs: JobInfo[];
  email: EmailHealth;
  security: SecurityInfo;
  storage: StorageInfo;
  configuration: ConfigurationSnapshot;
  recentActivity: SystemActivityRow[];
}
