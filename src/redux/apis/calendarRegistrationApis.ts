import type { Pagination } from "@/types";
import type {
  CalendarRegistration,
  CalendarRegistrationListQuery,
  CalendarRegistrationSummary,
  CalendarResourceType,
  ReviewRegistrationPaymentPayload,
  UpdateRegistrationPayload,
} from "@/types/domain/calendar";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface CalendarRegistrationListResult {
  data: CalendarRegistration[];
  meta: Pagination;
}

interface ResourceRef {
  resourceType: CalendarResourceType;
  resourceId: string;
}

const REGISTRATION_TAGS = [
  "CalendarRegistrations",
  "CalendarRegistration",
  "CalendarRegistrationSummary",
  "CalendarEvents",
  "CalendarEvent",
  "CalendarEventSummary",
  "CalendarMeetings",
  "CalendarMeeting",
  "CalendarMeetingSummary",
  "CalendarBookings",
  "CalendarBooking",
  "CalendarBookingSummary",
  "CalendarBookingSlots",
  "CalendarSchedule",
  "CalendarOverview",
] as const;

const BASE_BY_TYPE: Record<CalendarResourceType, (resourceId: string) => string> = {
  EVENT: (resourceId) => `/calendar/events/${resourceId}/registrations`,
  MEETING: (resourceId) => `/calendar/meetings/${resourceId}/registrations`,
  BOOKING: (resourceId) => `/calendar/bookings/${resourceId}/requests`,
};

export const registrationsBaseUrl = ({ resourceType, resourceId }: ResourceRef): string =>
  BASE_BY_TYPE[resourceType](resourceId);

const calendarRegistrationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarRegistrations: builder.query<
      CalendarRegistrationListResult,
      ResourceRef & { query?: CalendarRegistrationListQuery }
    >({
      query: ({ query, ...ref }) => ({
        url: `${registrationsBaseUrl(ref)}${buildQuery(
          (query ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["CalendarRegistrations"],
    }),
    getCalendarRegistrationSummary: builder.query<CalendarRegistrationSummary, ResourceRef>({
      query: (ref) => ({ url: `${registrationsBaseUrl(ref)}/summary`, method: "GET" }),
      providesTags: ["CalendarRegistrationSummary"],
    }),
    getCalendarRegistration: builder.query<CalendarRegistration, ResourceRef & { id: string }>({
      query: ({ id, ...ref }) => ({
        url: `${registrationsBaseUrl(ref)}/${id}`,
        method: "GET",
      }),
      providesTags: ["CalendarRegistration"],
    }),
    updateCalendarRegistration: builder.mutation<
      CalendarRegistration,
      ResourceRef & { id: string; body: UpdateRegistrationPayload }
    >({
      query: ({ id, body, ...ref }) => ({
        url: `${registrationsBaseUrl(ref)}/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...REGISTRATION_TAGS],
    }),
    reviewCalendarRegistrationPayment: builder.mutation<
      CalendarRegistration,
      ResourceRef & { id: string; body: ReviewRegistrationPaymentPayload }
    >({
      query: ({ id, body, ...ref }) => ({
        url: `${registrationsBaseUrl(ref)}/${id}/payment`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...REGISTRATION_TAGS],
    }),
    deleteCalendarRegistration: builder.mutation<null, ResourceRef & { id: string }>({
      query: ({ id, ...ref }) => ({
        url: `${registrationsBaseUrl(ref)}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [...REGISTRATION_TAGS],
    }),
  }),
});

export const {
  useGetCalendarRegistrationsQuery,
  useGetCalendarRegistrationSummaryQuery,
  useGetCalendarRegistrationQuery,
  useUpdateCalendarRegistrationMutation,
  useReviewCalendarRegistrationPaymentMutation,
  useDeleteCalendarRegistrationMutation,
} = calendarRegistrationApi;
