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
  paymentQrUrl: string;
  paymentQrPublicId: string;
  paymentInstructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSystemConfig {
  appName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  allowSignups: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  paymentQrUrl: string;
  paymentInstructions: string;
}

export type SystemConfigPayload = Partial<Omit<SystemConfig, "key" | "createdAt" | "updatedAt">>;
