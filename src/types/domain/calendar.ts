export const CALENDAR_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"] as const;
export type CalendarStatus = (typeof CALENDAR_STATUSES)[number];

export const CALENDAR_LOCATION_MODES = ["IN_PERSON", "ONLINE", "HYBRID"] as const;
export type CalendarLocationMode = (typeof CALENDAR_LOCATION_MODES)[number];

export const CALENDAR_RESOURCE_TYPES = ["EVENT", "MEETING", "BOOKING"] as const;
export type CalendarResourceType = (typeof CALENDAR_RESOURCE_TYPES)[number];

export const REGISTRATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "ATTENDED",
  "NO_SHOW",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const REGISTRATION_PAYMENT_STATUSES = [
  "NOT_REQUIRED",
  "AWAITING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "REFUNDED",
] as const;
export type RegistrationPaymentStatus = (typeof REGISTRATION_PAYMENT_STATUSES)[number];

export const PAYMENT_REVIEW_DECISIONS = ["VERIFIED", "REJECTED", "REFUNDED"] as const;
export type PaymentReviewDecision = (typeof PAYMENT_REVIEW_DECISIONS)[number];

export const REGISTRATION_SOURCES = ["PUBLIC", "INTERNAL"] as const;
export type RegistrationSource = (typeof REGISTRATION_SOURCES)[number];

export const DEFAULT_CALENDAR_COLOR = "#4f46e5";

export const DEFAULT_CALENDAR_CURRENCY = "BDT";

export const CALENDAR_MAX_SEATS_PER_REGISTRATION = 20;

export const CALENDAR_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CALENDAR_SLUG_MIN_LENGTH = 3;

export const CALENDAR_SLUG_MAX_LENGTH = 60;

export interface CalendarPayment {
  isPaid: boolean;
  price: number;
  currency: string;
  instructions: string;
  qrUrl: string | null;
  qrPublicId: string | null;
}

export interface CalendarPaymentPayload {
  isPaid?: boolean;
  price?: number;
  currency?: string;
  instructions?: string;
  qrUrl?: string | null;
  qrPublicId?: string | null;
}

export interface CalendarPlace {
  mode: CalendarLocationMode;
  venue: string;
  address: string;
  onlineUrl: string;
}

export type CalendarPlacePayload = Partial<CalendarPlace>;

export interface CalendarRegistration {
  _id: string;
  resourceType: CalendarResourceType;
  resourceId: string;
  resourceTitle: string;
  resourceSlug: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  note: string;
  seats: number;
  slotStart: string | null;
  slotEnd: string | null;
  amount: number;
  currency: string;
  transactionId: string;
  paymentStatus: RegistrationPaymentStatus;
  status: RegistrationStatus;
  source: RegistrationSource;
  reviewNote: string;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarRegistrationListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: RegistrationStatus;
  paymentStatus?: RegistrationPaymentStatus;
}

export interface CalendarRegistrationSummary {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  attended: number;
  seatsTaken: number;
  awaitingVerification: number;
  verifiedAmount: number;
  outstandingAmount: number;
  currency: string;
}

export interface UpdateRegistrationPayload {
  status?: RegistrationStatus;
  note?: string;
  reviewNote?: string;
}

export interface ReviewRegistrationPaymentPayload {
  paymentStatus: PaymentReviewDecision;
  reviewNote?: string;
}

export const isPaymentSettled = (status: RegistrationPaymentStatus): boolean =>
  status === "NOT_REQUIRED" || status === "VERIFIED";

export const needsPaymentReview = (status: RegistrationPaymentStatus): boolean =>
  status === "AWAITING_VERIFICATION";
