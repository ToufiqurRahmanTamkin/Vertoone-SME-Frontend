import type {
  CalendarLocationMode,
  CalendarPayment,
  CalendarPaymentPayload,
  CalendarPlace,
  CalendarPlacePayload,
  CalendarStatus,
} from "./calendar";

export const EVENT_CATEGORIES = [
  "CONFERENCE",
  "WORKSHOP",
  "WEBINAR",
  "TRAINING",
  "NETWORKING",
  "LAUNCH",
  "OTHER",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface CalendarEventListItem {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  category: EventCategory;
  locationMode: CalendarLocationMode;
  venue: string;
  startAt: string;
  endAt: string;
  capacity: number | null;
  seatsTaken: number;
  seatsLeft: number | null;
  accentColor: string;
  coverUrl: string | null;
  status: CalendarStatus;
  isRegistrationOpen: boolean;
  isPaid: boolean;
  price: number;
  currency: string;
  registrationCount: number;
  lastRegistrationAt: string | null;
  publicPath: string;
  publicUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent extends CalendarEventListItem {
  description: string;
  place: CalendarPlace;
  registrationClosesAt: string | null;
  coverPublicId: string | null;
  payment: CalendarPayment;
  organiserName: string;
  contactEmail: string;
  contactPhone: string;
  publishedAt: string | null;
}

export interface CalendarEventOption {
  _id: string;
  title: string;
  slug: string;
  startAt: string;
  status: CalendarStatus;
}

export interface CalendarEventListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: CalendarStatus;
  category?: EventCategory;
  isPaid?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface CalendarEventSummary {
  used: number;
  published: number;
  upcoming: number;
  paid: number;
  registrations: number;
  awaitingVerification: number;
  collected: number;
}

export interface CreateCalendarEventPayload {
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  category?: EventCategory;
  place?: CalendarPlacePayload;
  startAt: string;
  endAt: string;
  registrationClosesAt?: string | null;
  capacity?: number | null;
  coverUrl?: string | null;
  coverPublicId?: string | null;
  accentColor?: string;
  payment?: CalendarPaymentPayload;
  status?: CalendarStatus;
  isRegistrationOpen?: boolean;
  organiserName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export type UpdateCalendarEventPayload = Partial<CreateCalendarEventPayload>;
