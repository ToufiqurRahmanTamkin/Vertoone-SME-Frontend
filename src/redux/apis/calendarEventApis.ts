import type { Pagination } from "@/types";
import type {
  CalendarEvent,
  CalendarEventListItem,
  CalendarEventListQuery,
  CalendarEventOption,
  CalendarEventSummary,
  CreateCalendarEventPayload,
  UpdateCalendarEventPayload,
} from "@/types/domain/calendarEvent";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface CalendarEventListResult {
  data: CalendarEventListItem[];
  meta: Pagination;
}

const EVENT_TAGS = [
  "CalendarEvents",
  "CalendarEvent",
  "CalendarEventSummary",
  "CalendarEventOptions",
  "CalendarSchedule",
  "CalendarOverview",
] as const;

export const CALENDAR_EVENTS_URL = "/calendar/events";

const calendarEventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarEvents: builder.query<CalendarEventListResult, CalendarEventListQuery | void>({
      query: (params) => ({
        url: `${CALENDAR_EVENTS_URL}${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["CalendarEvents"],
    }),
    getCalendarEventOptions: builder.query<CalendarEventOption[], string | void>({
      query: (search) => ({
        url: `${CALENDAR_EVENTS_URL}/options${buildQuery({ search: search || undefined })}`,
        method: "GET",
      }),
      providesTags: ["CalendarEventOptions"],
    }),
    getCalendarEventSummary: builder.query<CalendarEventSummary, void>({
      query: () => ({ url: `${CALENDAR_EVENTS_URL}/summary`, method: "GET" }),
      providesTags: ["CalendarEventSummary"],
    }),
    getCalendarEvent: builder.query<CalendarEvent, string>({
      query: (id) => ({ url: `${CALENDAR_EVENTS_URL}/${id}`, method: "GET" }),
      providesTags: ["CalendarEvent"],
    }),
    createCalendarEvent: builder.mutation<CalendarEvent, CreateCalendarEventPayload>({
      query: (body) => ({ url: CALENDAR_EVENTS_URL, method: "POST", body }),
      invalidatesTags: [...EVENT_TAGS],
    }),
    updateCalendarEvent: builder.mutation<
      CalendarEvent,
      { id: string; body: UpdateCalendarEventPayload }
    >({
      query: ({ id, body }) => ({
        url: `${CALENDAR_EVENTS_URL}/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...EVENT_TAGS],
    }),
    duplicateCalendarEvent: builder.mutation<CalendarEvent, string>({
      query: (id) => ({ url: `${CALENDAR_EVENTS_URL}/${id}/duplicate`, method: "POST" }),
      invalidatesTags: [...EVENT_TAGS],
    }),
    deleteCalendarEvent: builder.mutation<null, string>({
      query: (id) => ({ url: `${CALENDAR_EVENTS_URL}/${id}`, method: "DELETE" }),
      invalidatesTags: [...EVENT_TAGS, "CalendarRegistrations"],
    }),
  }),
});

export const {
  useGetCalendarEventsQuery,
  useGetCalendarEventOptionsQuery,
  useGetCalendarEventSummaryQuery,
  useGetCalendarEventQuery,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
  useDuplicateCalendarEventMutation,
  useDeleteCalendarEventMutation,
} = calendarEventApi;
