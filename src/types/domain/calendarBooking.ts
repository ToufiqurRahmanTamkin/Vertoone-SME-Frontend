import type {
  CalendarLocationMode,
  CalendarPayment,
  CalendarPaymentPayload,
  CalendarPlace,
  CalendarPlacePayload,
  CalendarStatus,
} from "./calendar";

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const BOOKING_MIN_DURATION_MINUTES = 5;

export const BOOKING_MAX_DURATION_MINUTES = 720;

export const BOOKING_MAX_AVAILABILITY_RULES = 21;

export interface BookingAvailabilityRule {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface CalendarBookingListItem {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  hostName: string;
  locationMode: CalendarLocationMode;
  venue: string;
  durationMinutes: number;
  capacityPerSlot: number;
  capacity: number | null;
  weeklyHours: number;
  availableDays: number;
  accentColor: string;
  coverUrl: string | null;
  status: CalendarStatus;
  isRegistrationOpen: boolean;
  isPaid: boolean;
  price: number;
  currency: string;
  registrationCount: number;
  seatsTaken: number;
  lastRegistrationAt: string | null;
  publicPath: string;
  publicUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarBooking extends CalendarBookingListItem {
  description: string;
  place: CalendarPlace;
  bufferMinutes: number;
  availability: BookingAvailabilityRule[];
  leadTimeHours: number;
  windowDays: number;
  timezoneOffsetMinutes: number;
  coverPublicId: string | null;
  payment: CalendarPayment;
  contactEmail: string;
  contactPhone: string;
  publishedAt: string | null;
}

export interface CalendarBookingOption {
  _id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  status: CalendarStatus;
}

export interface CalendarBookingListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: CalendarStatus;
  isPaid?: boolean;
}

export interface CalendarBookingSummary {
  used: number;
  published: number;
  paid: number;
  requests: number;
  awaitingVerification: number;
  upcoming: number;
  collected: number;
}

export interface BookingSlot {
  start: string;
  end: string;
  capacity: number;
  booked: number;
  available: number;
}

export interface BookingSlotQuery {
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateCalendarBookingPayload {
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  hostName?: string;
  place?: CalendarPlacePayload;
  durationMinutes?: number;
  bufferMinutes?: number;
  capacityPerSlot?: number;
  capacity?: number | null;
  availability?: BookingAvailabilityRule[];
  leadTimeHours?: number;
  windowDays?: number;
  timezoneOffsetMinutes?: number;
  coverUrl?: string | null;
  coverPublicId?: string | null;
  accentColor?: string;
  payment?: CalendarPaymentPayload;
  status?: CalendarStatus;
  isRegistrationOpen?: boolean;
  contactEmail?: string;
  contactPhone?: string;
}

export type UpdateCalendarBookingPayload = Partial<CreateCalendarBookingPayload>;
