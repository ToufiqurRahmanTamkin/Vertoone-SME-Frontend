import type {
  CalendarLocationMode,
  CalendarResourceType,
  CalendarStatus,
  RegistrationPaymentStatus,
  RegistrationStatus,
} from "./calendar";
import type { EventCategory } from "./calendarEvent";
import type { MeetingType } from "./calendarMeeting";

export interface CalendarVisibility {
  events: boolean;
  meetings: boolean;
  bookings: boolean;
}

export interface CalendarScheduleEntry {
  _id: string;
  type: CalendarResourceType;
  resourceId: string;
  title: string;
  subtitle: string;
  category: EventCategory | null;
  meetingType: MeetingType | null;
  startAt: string;
  endAt: string;
  accentColor: string;
  status: CalendarStatus;
  registrationStatus: RegistrationStatus | null;
  paymentStatus: RegistrationPaymentStatus | null;
  locationMode: CalendarLocationMode;
  venue: string;
  onlineUrl: string;
  hostName: string;
  reference: string;
  seats: number;
  seatsTaken: number;
  capacity: number | null;
  isPaid: boolean;
  price: number;
  amount: number;
  currency: string;
  publicPath: string;
  publicUrl: string;
}

export interface CalendarScheduleCounts {
  events: number;
  meetings: number;
  bookings: number;
  total: number;
}

export interface CalendarSchedule {
  entries: CalendarScheduleEntry[];
  counts: CalendarScheduleCounts;
  visibility: CalendarVisibility;
  currency: string;
  truncated: boolean;
}

export interface CalendarScheduleQuery {
  dateFrom: string;
  dateTo: string;
  type?: CalendarResourceType;
  status?: CalendarStatus;
  registrationStatus?: RegistrationStatus;
  locationMode?: CalendarLocationMode;
  isPaid?: boolean;
  search?: string;
}

export const RESOURCE_TYPE_LABELS: Record<CalendarResourceType, string> = {
  EVENT: "Event",
  MEETING: "Meeting",
  BOOKING: "Booking",
};

export const RESOURCE_TYPE_PLURAL: Record<CalendarResourceType, string> = {
  EVENT: "Events",
  MEETING: "Meetings",
  BOOKING: "Bookings",
};

export const RESOURCE_LIST_PATH: Record<CalendarResourceType, string> = {
  EVENT: "/company/calendar/events",
  MEETING: "/company/calendar/meetings",
  BOOKING: "/company/calendar/bookings",
};

export const registrationsPathFor = (
  type: CalendarResourceType,
  resourceId: string
): string =>
  type === "BOOKING"
    ? `/company/calendar/bookings/${resourceId}/requests`
    : `${RESOURCE_LIST_PATH[type]}/${resourceId}/registrations`;
