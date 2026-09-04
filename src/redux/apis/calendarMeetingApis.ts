import type { Pagination } from "@/types";
import type {
  CalendarMeeting,
  CalendarMeetingListItem,
  CalendarMeetingListQuery,
  CalendarMeetingOption,
  CalendarMeetingSummary,
  CreateCalendarMeetingPayload,
  UpdateCalendarMeetingPayload,
} from "@/types/domain/calendarMeeting";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface CalendarMeetingListResult {
  data: CalendarMeetingListItem[];
  meta: Pagination;
}

const MEETING_TAGS = [
  "CalendarMeetings",
  "CalendarMeeting",
  "CalendarMeetingSummary",
  "CalendarMeetingOptions",
  "CalendarSchedule",
  "CalendarOverview",
] as const;

export const CALENDAR_MEETINGS_URL = "/calendar/meetings";

const calendarMeetingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarMeetings: builder.query<CalendarMeetingListResult, CalendarMeetingListQuery | void>({
      query: (params) => ({
        url: `${CALENDAR_MEETINGS_URL}${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["CalendarMeetings"],
    }),
    getCalendarMeetingOptions: builder.query<CalendarMeetingOption[], string | void>({
      query: (search) => ({
        url: `${CALENDAR_MEETINGS_URL}/options${buildQuery({ search: search || undefined })}`,
        method: "GET",
      }),
      providesTags: ["CalendarMeetingOptions"],
    }),
    getCalendarMeetingSummary: builder.query<CalendarMeetingSummary, void>({
      query: () => ({ url: `${CALENDAR_MEETINGS_URL}/summary`, method: "GET" }),
      providesTags: ["CalendarMeetingSummary"],
    }),
    getCalendarMeeting: builder.query<CalendarMeeting, string>({
      query: (id) => ({ url: `${CALENDAR_MEETINGS_URL}/${id}`, method: "GET" }),
      providesTags: ["CalendarMeeting"],
    }),
    createCalendarMeeting: builder.mutation<CalendarMeeting, CreateCalendarMeetingPayload>({
      query: (body) => ({ url: CALENDAR_MEETINGS_URL, method: "POST", body }),
      invalidatesTags: [...MEETING_TAGS],
    }),
    updateCalendarMeeting: builder.mutation<
      CalendarMeeting,
      { id: string; body: UpdateCalendarMeetingPayload }
    >({
      query: ({ id, body }) => ({
        url: `${CALENDAR_MEETINGS_URL}/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...MEETING_TAGS],
    }),
    duplicateCalendarMeeting: builder.mutation<CalendarMeeting, string>({
      query: (id) => ({ url: `${CALENDAR_MEETINGS_URL}/${id}/duplicate`, method: "POST" }),
      invalidatesTags: [...MEETING_TAGS],
    }),
    deleteCalendarMeeting: builder.mutation<null, string>({
      query: (id) => ({ url: `${CALENDAR_MEETINGS_URL}/${id}`, method: "DELETE" }),
      invalidatesTags: [...MEETING_TAGS, "CalendarRegistrations"],
    }),
  }),
});

export const {
  useGetCalendarMeetingsQuery,
  useGetCalendarMeetingOptionsQuery,
  useGetCalendarMeetingSummaryQuery,
  useGetCalendarMeetingQuery,
  useCreateCalendarMeetingMutation,
  useUpdateCalendarMeetingMutation,
  useDuplicateCalendarMeetingMutation,
  useDeleteCalendarMeetingMutation,
} = calendarMeetingApi;
