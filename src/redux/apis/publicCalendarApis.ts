import type { BookingSlot, BookingSlotQuery } from "@/types/domain/calendarBooking";
import type {
  PublicBooking,
  PublicBookingPayload,
  PublicEvent,
  PublicMeeting,
  PublicRegistrationPayload,
  RegistrationReceipt,
} from "@/types/domain/publicCalendar";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const BASE_URL = "/public/calendar";

const publicCalendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicEvent: builder.query<PublicEvent, string>({
      query: (slug) => ({ url: `${BASE_URL}/events/${slug}`, method: "GET" }),
    }),
    getPublicMeeting: builder.query<PublicMeeting, string>({
      query: (slug) => ({ url: `${BASE_URL}/meetings/${slug}`, method: "GET" }),
    }),
    getPublicBooking: builder.query<PublicBooking, string>({
      query: (slug) => ({ url: `${BASE_URL}/bookings/${slug}`, method: "GET" }),
    }),
    getPublicBookingSlots: builder.query<
      BookingSlot[],
      { slug: string; query?: BookingSlotQuery }
    >({
      query: ({ slug, query }) => ({
        url: `${BASE_URL}/bookings/${slug}/slots${buildQuery(
          (query ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
    }),
    registerForPublicEvent: builder.mutation<
      RegistrationReceipt,
      { slug: string; body: PublicRegistrationPayload }
    >({
      query: ({ slug, body }) => ({
        url: `${BASE_URL}/events/${slug}/register`,
        method: "POST",
        body,
      }),
    }),
    registerForPublicMeeting: builder.mutation<
      RegistrationReceipt,
      { slug: string; body: PublicRegistrationPayload }
    >({
      query: ({ slug, body }) => ({
        url: `${BASE_URL}/meetings/${slug}/register`,
        method: "POST",
        body,
      }),
    }),
    bookPublicSlot: builder.mutation<
      RegistrationReceipt,
      { slug: string; body: PublicBookingPayload }
    >({
      query: ({ slug, body }) => ({
        url: `${BASE_URL}/bookings/${slug}/book`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetPublicEventQuery,
  useGetPublicMeetingQuery,
  useGetPublicBookingQuery,
  useGetPublicBookingSlotsQuery,
  useRegisterForPublicEventMutation,
  useRegisterForPublicMeetingMutation,
  useBookPublicSlotMutation,
} = publicCalendarApi;
