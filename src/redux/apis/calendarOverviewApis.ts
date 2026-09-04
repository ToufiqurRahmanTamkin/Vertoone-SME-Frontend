import type { CalendarOverview } from "@/types/domain/calendarOverview";
import type { CalendarSchedule, CalendarScheduleQuery } from "@/types/domain/calendarSchedule";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const calendarOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarOverview: builder.query<CalendarOverview, void>({
      query: () => ({ url: "/calendar/overview", method: "GET" }),
      providesTags: ["CalendarOverview"],
    }),
    getCalendarSchedule: builder.query<CalendarSchedule, CalendarScheduleQuery>({
      query: (params) => ({
        url: `/calendar/schedule${buildQuery(params as unknown as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["CalendarSchedule"],
    }),
  }),
});

export const { useGetCalendarOverviewQuery, useGetCalendarScheduleQuery } = calendarOverviewApi;
