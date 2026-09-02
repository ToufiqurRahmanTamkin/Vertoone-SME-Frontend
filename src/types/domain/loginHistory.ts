export type LoginStatus = "SUCCESS" | "FAILED";

export type LoginDeviceType = "DESKTOP" | "MOBILE" | "TABLET" | "BOT" | "UNKNOWN";

export type LoginFailureReason =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_INACTIVE"
  | "ACCOUNT_PENDING_APPROVAL"
  | "ACCOUNT_REJECTED"
  | "UNKNOWN_ACCOUNT"
  | "SUBSCRIPTION_INACTIVE";

export interface LoginHistoryEntry {
  _id: string;
  userId: string | null;
  email: string;
  status: LoginStatus;
  failureReason: LoginFailureReason | null;
  ipAddress: string;
  userAgent: string;
  deviceType: LoginDeviceType;
  deviceName: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  isNewDevice: boolean;
  loginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginHistoryListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: LoginStatus;
  deviceType?: LoginDeviceType;
  from?: string;
  to?: string;
}

export interface LoginHistorySummary {
  total: number;
  successful: number;
  failed: number;
  distinctDevices: number;
  lastSuccessfulAt: string | null;
}
