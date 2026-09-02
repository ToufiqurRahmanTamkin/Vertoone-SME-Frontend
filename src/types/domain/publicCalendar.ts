import type {
  CalendarLocationMode,
  CalendarPlace,
  RegistrationPaymentStatus,
  RegistrationStatus,
} from "./calendar";
import type { BookingAvailabilityRule } from "./calendarBooking";
import type { EventCategory } from "./calendarEvent";
import type { MeetingType } from "./calendarMeeting";

export interface PublicCalendarPayment {
  isPaid: boolean;
  price: number;
  currency: string;
  instructions: string;
  qrUrl: string | null;
}

export interface PublicCalendarBase {
  slug: string;
  title: string;
  summary: string;
  description: string;
  coverUrl: string | null;
  accentColor: string;
  place: CalendarPlace;
  locationMode: CalendarLocationMode;
  payment: PublicCalendarPayment;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  isOpen: boolean;
  closedReason: string;
}

export interface PublicEvent extends PublicCalendarBase {
  category: EventCategory;
  organiserName: string;
  startAt: string;
  endAt: string;
  registrationClosesAt: string | null;
  capacity: number | null;
  seatsLeft: number | null;
}

export interface PublicMeeting extends PublicCalendarBase {
  meetingType: MeetingType;
  hostName: string;
  roomName: string;
  startAt: string;
  endAt: string;
  registrationClosesAt: string | null;
  capacity: number | null;
  seatsLeft: number | null;
}

export interface PublicBooking extends PublicCalendarBase {
  hostName: string;
  durationMinutes: number;
  capacityPerSlot: number;
  availability: BookingAvailabilityRule[];
  leadTimeHours: number;
  windowDays: number;
  timezoneOffsetMinutes: number;
}

export interface PublicRegistrationPayload {
  name: string;
  email: string;
  phone: string;
  note?: string;
  seats?: number;
  transactionId?: string;
}

export interface PublicBookingPayload extends PublicRegistrationPayload {
  slotStart: string;
}

export interface RegistrationReceipt {
  reference: string;
  name: string;
  email: string;
  seats: number;
  slotStart: string | null;
  slotEnd: string | null;
  amount: number;
  currency: string;
  transactionId: string;
  paymentStatus: RegistrationPaymentStatus;
  status: RegistrationStatus;
  resourceTitle: string;
  message: string;
}
