export interface SystemConfig {
  key: "GLOBAL";
  appName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  defaultTimezone: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowSignups: boolean;
  trialDays: number;
  createdAt: string;
  updatedAt: string;
}

export type SystemConfigPayload = Partial<Omit<SystemConfig, "key" | "createdAt" | "updatedAt">>;
