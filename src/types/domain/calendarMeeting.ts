import type {
  CalendarLocationMode,
  CalendarPayment,
  CalendarPaymentPayload,
  CalendarPlace,
  CalendarPlacePayload,
  CalendarStatus,
} from "./calendar";
import type { MeetingRoomRef } from "./meetingRoom";

export const MEETING_TYPES = [
  "INTERNAL",
  "CLIENT",
  "INTERVIEW",
  "DEMO",
  "CONSULTATION",
  "OTHER",
] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export interface CalendarMeetingListItem {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  meetingType: MeetingType;
  hostName: string;
  locationMode: CalendarLocationMode;
  venue: string;
  room: MeetingRoomRef | null;
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

export interface CalendarMeeting extends CalendarMeetingListItem {
  agenda: string;
  place: CalendarPlace;
  meetingRoomId: string | null;
  registrationClosesAt: string | null;
  coverPublicId: string | null;
  payment: CalendarPayment;
  contactEmail: string;
  contactPhone: string;
  publishedAt: string | null;
}

export interface CalendarMeetingOption {
  _id: string;
  title: string;
  slug: string;
  startAt: string;
  status: CalendarStatus;
}

export interface CalendarMeetingListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: CalendarStatus;
  meetingType?: MeetingType;
  meetingRoomId?: string;
  isPaid?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface CalendarMeetingSummary {
  used: number;
  published: number;
  upcoming: number;
  paid: number;
  registrations: number;
  awaitingVerification: number;
  collected: number;
}

export interface CreateCalendarMeetingPayload {
  title: string;
  slug?: string;
  summary?: string;
  agenda?: string;
  meetingType?: MeetingType;
  hostName?: string;
  meetingRoomId?: string | null;
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
  contactEmail?: string;
  contactPhone?: string;
}

export type UpdateCalendarMeetingPayload = Partial<CreateCalendarMeetingPayload>;
