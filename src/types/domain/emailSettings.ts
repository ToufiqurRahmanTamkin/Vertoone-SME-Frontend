import type { StatusColor } from "@/components/shared/status-badge";

export const EMAIL_PROVIDERS = [
  "GMAIL",
  "OUTLOOK",
  "ZOHO",
  "BREVO",
  "SENDGRID",
  "MAILGUN",
  "POSTMARK",
  "RESEND",
  "AMAZON_SES",
  "CUSTOM_SMTP",
] as const;
export type EmailProvider = (typeof EMAIL_PROVIDERS)[number];

export const EMAIL_ENCRYPTIONS = ["STARTTLS", "SSL", "NONE"] as const;
export type EmailEncryption = (typeof EMAIL_ENCRYPTIONS)[number];

export const EMAIL_ENCRYPTION_LABELS: Record<EmailEncryption, string> = {
  STARTTLS: "STARTTLS (port 587)",
  SSL: "SSL/TLS (port 465)",
  NONE: "None (not recommended)",
};

export const EMAIL_HEALTHS = [
  "NOT_CONFIGURED",
  "UNTESTED",
  "WORKING",
  "FAILING",
  "OFF",
] as const;
export type EmailHealth = (typeof EMAIL_HEALTHS)[number];

export const EMAIL_HEALTH_LABELS: Record<EmailHealth, string> = {
  NOT_CONFIGURED: "Not set up",
  UNTESTED: "Not tested yet",
  WORKING: "Working",
  FAILING: "Not working",
  OFF: "Sending off",
};

export const EMAIL_HEALTH_COLORS: Record<EmailHealth, StatusColor> = {
  NOT_CONFIGURED: "zinc",
  UNTESTED: "amber",
  WORKING: "green",
  FAILING: "red",
  OFF: "muted",
};

export interface EmailProviderPreset {
  provider: EmailProvider;
  label: string;
  blurb: string;
  host: string;
  port: number;
  encryption: EmailEncryption;
  usernameLabel: string;
  usernameHint: string;
  passwordLabel: string;
  passwordHint: string;
  fixedUsername: string;
  hostIsEditable: boolean;
  helpUrl: string;
}

export interface EmailSettings {
  _id: string;
  isEnabled: boolean;
  provider: EmailProvider;
  host: string;
  port: number;
  encryption: EmailEncryption;
  username: string;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  footerText: string;
  health: EmailHealth;
  isComplete: boolean;
  verifiedAt: string | null;
  lastTestedAt: string | null;
  lastTestRecipient: string;
  lastError: string;
  usesPlatformFallback: boolean;
  updatedAt: string;
}

export interface EmailSettingsPayload {
  isEnabled?: boolean;
  provider?: EmailProvider;
  host?: string;
  port?: number;
  encryption?: EmailEncryption;
  username?: string;
  password?: string;
  fromName?: string;
  fromEmail?: string;
  replyToEmail?: string;
  footerText?: string;
}

export interface EmailTestResult {
  ok: boolean;
  message: string;
  settings: EmailSettings;
}
