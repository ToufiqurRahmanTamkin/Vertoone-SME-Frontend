import type {
  CalendarLocationMode,
  CalendarResourceType,
  CalendarStatus,
  RegistrationPaymentStatus,
  RegistrationStatus,
} from "./calendar";
import type { CalendarVisibility } from "./calendarSchedule";

export interface CalendarResourceKpis {
  total: number;
  published: number;
  draft: number;
  cancelled: number;
  upcoming: number;
  paid: number;
  registrations: number;
  seatsTaken: number;
  addedThisMonth: number;
  addedChangePercent: number;
  limit: number | null;
  remaining: number | null;
}

export interface CalendarMoneyKpis {
  collected: number;
  awaitingAmount: number;
  refunded: number;
  currency: string;
}

export interface CalendarRegistrationKpis {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  attended: number;
  noShow: number;
  seatsTaken: number;
  awaitingVerification: number;
  thisMonth: number;
  changePercent: number;
  attendanceRate: number;
}

export interface CalendarRoomKpis {
  total: number;
  active: number;
  totalCapacity: number;
  booked: number;
}

export interface CalendarOverviewKpis {
  events: CalendarResourceKpis;
  meetings: CalendarResourceKpis;
  bookings: CalendarResourceKpis;
  registrations: CalendarRegistrationKpis;
  money: CalendarMoneyKpis;
  rooms: CalendarRoomKpis;
}

export interface CalendarTrendPoint {
  month: string;
  events: number;
  meetings: number;
  bookings: number;
}

export interface CalendarStatusPoint {
  status: RegistrationStatus;
  count: number;
}

export interface CalendarPaymentPoint {
  paymentStatus: RegistrationPaymentStatus;
  count: number;
  amount: number;
}

export interface CalendarTypePoint {
  type: CalendarResourceType;
  published: number;
  total: number;
  registrations: number;
  collected: number;
}

export interface CalendarUpcomingRow {
  _id: string;
  type: CalendarResourceType;
  title: string;
  subtitle: string;
  startAt: string;
  endAt: string;
  status: CalendarStatus;
  accentColor: string;
  locationMode: CalendarLocationMode;
  venue: string;
  seatsTaken: number;
  capacity: number | null;
  isPaid: boolean;
  price: number;
  currency: string;
}

export interface CalendarAwaitingRow {
  _id: string;
  type: CalendarResourceType;
  reference: string;
  name: string;
  email: string;
  resourceId: string;
  resourceTitle: string;
  seats: number;
  amount: number;
  currency: string;
  transactionId: string;
  slotStart: string | null;
  createdAt: string;
}

export interface CalendarTopRow {
  _id: string;
  type: CalendarResourceType;
  title: string;
  startAt: string | null;
  status: CalendarStatus;
  accentColor: string;
  registrationCount: number;
  seatsTaken: number;
  capacity: number | null;
  fillRate: number | null;
}

export interface CalendarRoomRow {
  _id: string;
  name: string;
  code: string;
  color: string;
  capacity: number;
  isActive: boolean;
  meetingCount: number;
  upcomingCount: number;
}

export interface CalendarOverview {
  kpis: CalendarOverviewKpis;
  trend: CalendarTrendPoint[];
  registrationStatuses: CalendarStatusPoint[];
  paymentStatuses: CalendarPaymentPoint[];
  types: CalendarTypePoint[];
  upcoming: CalendarUpcomingRow[];
  awaitingPayments: CalendarAwaitingRow[];
  topResources: CalendarTopRow[];
  rooms: CalendarRoomRow[];
  visibility: CalendarVisibility;
  currency: string;
  generatedAt: string;
}
