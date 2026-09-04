import type { Pagination } from "@/types";
import type {
  BookingSlot,
  BookingSlotQuery,
  CalendarBooking,
  CalendarBookingListItem,
  CalendarBookingListQuery,
  CalendarBookingOption,
  CalendarBookingSummary,
  CreateCalendarBookingPayload,
  UpdateCalendarBookingPayload,
} from "@/types/domain/calendarBooking";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface CalendarBookingListResult {
  data: CalendarBookingListItem[];
  meta: Pagination;
}

const BOOKING_TAGS = [
  "CalendarBookings",
  "CalendarBooking",
  "CalendarBookingSummary",
  "CalendarBookingOptions",
  "CalendarBookingSlots",
  "CalendarSchedule",
  "CalendarOverview",
] as const;

export const CALENDAR_BOOKINGS_URL = "/calendar/bookings";

const calendarBookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarBookings: builder.query<CalendarBookingListResult, CalendarBookingListQuery | void>({
      query: (params) => ({
        url: `${CALENDAR_BOOKINGS_URL}${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["CalendarBookings"],
    }),
    getCalendarBookingOptions: builder.query<CalendarBookingOption[], string | void>({
      query: (search) => ({
        url: `${CALENDAR_BOOKINGS_URL}/options${buildQuery({ search: search || undefined })}`,
        method: "GET",
      }),
      providesTags: ["CalendarBookingOptions"],
    }),
    getCalendarBookingSummary: builder.query<CalendarBookingSummary, void>({
      query: () => ({ url: `${CALENDAR_BOOKINGS_URL}/summary`, method: "GET" }),
      providesTags: ["CalendarBookingSummary"],
    }),
    getCalendarBooking: builder.query<CalendarBooking, string>({
      query: (id) => ({ url: `${CALENDAR_BOOKINGS_URL}/${id}`, method: "GET" }),
      providesTags: ["CalendarBooking"],
    }),
    getCalendarBookingSlots: builder.query<
      BookingSlot[],
      { id: string; query?: BookingSlotQuery }
    >({
      query: ({ id, query }) => ({
        url: `${CALENDAR_BOOKINGS_URL}/${id}/slots${buildQuery(
          (query ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["CalendarBookingSlots"],
    }),
    createCalendarBooking: builder.mutation<CalendarBooking, CreateCalendarBookingPayload>({
      query: (body) => ({ url: CALENDAR_BOOKINGS_URL, method: "POST", body }),
      invalidatesTags: [...BOOKING_TAGS],
    }),
    updateCalendarBooking: builder.mutation<
      CalendarBooking,
      { id: string; body: UpdateCalendarBookingPayload }
    >({
      query: ({ id, body }) => ({
        url: `${CALENDAR_BOOKINGS_URL}/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...BOOKING_TAGS],
    }),
    duplicateCalendarBooking: builder.mutation<CalendarBooking, string>({
      query: (id) => ({ url: `${CALENDAR_BOOKINGS_URL}/${id}/duplicate`, method: "POST" }),
      invalidatesTags: [...BOOKING_TAGS],
    }),
    deleteCalendarBooking: builder.mutation<null, string>({
      query: (id) => ({ url: `${CALENDAR_BOOKINGS_URL}/${id}`, method: "DELETE" }),
      invalidatesTags: [...BOOKING_TAGS, "CalendarRegistrations"],
    }),
  }),
});

export const {
  useGetCalendarBookingsQuery,
  useGetCalendarBookingOptionsQuery,
  useGetCalendarBookingSummaryQuery,
  useGetCalendarBookingQuery,
  useGetCalendarBookingSlotsQuery,
  useCreateCalendarBookingMutation,
  useUpdateCalendarBookingMutation,
  useDuplicateCalendarBookingMutation,
  useDeleteCalendarBookingMutation,
} = calendarBookingApi;
