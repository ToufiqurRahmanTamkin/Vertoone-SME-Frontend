export const PAYMENT_GATEWAYS = ["MANUAL", "STRIPE", "NMI", "VALOR", "PAYPAL"] as const;
export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];

export const GATEWAY_ENVIRONMENTS = ["SANDBOX", "PRODUCTION"] as const;
export type GatewayEnvironment = (typeof GATEWAY_ENVIRONMENTS)[number];

export const PAYMENT_GATEWAY_LABELS: Record<PaymentGateway, string> = {
  MANUAL: "Manual / QR",
  STRIPE: "Stripe",
  NMI: "NMI",
  VALOR: "Valor PayTech",
  PAYPAL: "PayPal",
};

export const GATEWAY_ENVIRONMENT_LABELS: Record<GatewayEnvironment, string> = {
  SANDBOX: "Sandbox",
  PRODUCTION: "Production",
};

interface GatewayBase {
  enabled: boolean;
  environment: GatewayEnvironment;
}

export interface StripeGateway extends GatewayBase {
  publishableKey: string;
  accountId: string;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
}

export interface NmiGateway extends GatewayBase {
  username: string;
  tokenizationKey: string;
  endpoint: string;
  hasPassword: boolean;
  hasSecurityKey: boolean;
}

export interface ValorGateway extends GatewayBase {
  merchantId: string;
  appId: string;
  epi: string;
  hasAppKey: boolean;
}

export interface PaypalGateway extends GatewayBase {
  clientId: string;
  webhookId: string;
  hasClientSecret: boolean;
}

export interface PaymentGateways {
  defaultGateway: PaymentGateway;
  stripe: StripeGateway;
  nmi: NmiGateway;
  valor: ValorGateway;
  paypal: PaypalGateway;
}

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
  paymentQrEnabled: boolean;
  paymentQrUrl: string;
  paymentQrPublicId: string;
  paymentInstructions: string;
  paymentGateways: PaymentGateways;
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
  paymentQrEnabled: boolean;
  paymentQrUrl: string;
  paymentInstructions: string;
  enabledGateways: PaymentGateway[];
}

export interface PaymentGatewaysPayload {
  defaultGateway?: PaymentGateway;
  stripe?: {
    enabled?: boolean;
    environment?: GatewayEnvironment;
    publishableKey?: string;
    accountId?: string;
    secretKey?: string;
    webhookSecret?: string;
  };
  nmi?: {
    enabled?: boolean;
    environment?: GatewayEnvironment;
    username?: string;
    tokenizationKey?: string;
    endpoint?: string;
    password?: string;
    securityKey?: string;
  };
  valor?: {
    enabled?: boolean;
    environment?: GatewayEnvironment;
    merchantId?: string;
    appId?: string;
    epi?: string;
    appKey?: string;
  };
  paypal?: {
    enabled?: boolean;
    environment?: GatewayEnvironment;
    clientId?: string;
    webhookId?: string;
    clientSecret?: string;
  };
}

export type SystemConfigPayload = Partial<
  Omit<SystemConfig, "key" | "createdAt" | "updatedAt" | "paymentGateways">
> & {
  paymentGateways?: PaymentGatewaysPayload;
};
