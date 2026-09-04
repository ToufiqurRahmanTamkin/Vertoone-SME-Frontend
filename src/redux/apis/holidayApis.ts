import type { Pagination } from "@/types";
import type {
  CopyHolidaysPayload,
  CountryHolidayQuery,
  CountryHolidayResult,
  ImportCountryHolidaysPayload,
  Holiday,
  HolidayListQuery,
  HolidayPayload,
  HolidaySummary,
} from "@/types/domain/holiday";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface HolidayListResult {
  data: Holiday[];
  meta: Pagination;
}

const HOLIDAY_TAGS = ["Holidays", "HolidaySummary", "HrmsSettingsSummary"] as const;

const holidayApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHolidays: builder.query<HolidayListResult, HolidayListQuery | void>({
      query: (params) => ({
        url: `/hrms/holidays${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Holidays"],
    }),
    getHolidaySummary: builder.query<HolidaySummary, { year?: number } | void>({
      query: (params) => ({
        url: `/hrms/holidays/summary${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["HolidaySummary"],
    }),
    getCountryHolidays: builder.query<CountryHolidayResult, CountryHolidayQuery>({
      query: (params) => ({
        url: `/hrms/holidays/country-suggestions${buildQuery({ ...params })}`,
        method: "GET",
      }),
      providesTags: ["CountryHolidays"],
    }),
    importCountryHolidays: builder.mutation<Holiday[], ImportCountryHolidaysPayload>({
      query: (body) => ({ url: "/hrms/holidays/import-country", method: "POST", body }),
      invalidatesTags: [...HOLIDAY_TAGS, "CountryHolidays"],
    }),
    createHoliday: builder.mutation<Holiday, HolidayPayload>({
      query: (body) => ({ url: "/hrms/holidays", method: "POST", body }),
      invalidatesTags: [...HOLIDAY_TAGS],
    }),
    copyHolidayYear: builder.mutation<Holiday[], CopyHolidaysPayload>({
      query: (body) => ({ url: "/hrms/holidays/copy-year", method: "POST", body }),
      invalidatesTags: [...HOLIDAY_TAGS],
    }),
    updateHoliday: builder.mutation<Holiday, { id: string; body: Partial<HolidayPayload> }>({
      query: ({ id, body }) => ({ url: `/hrms/holidays/${id}`, method: "PATCH", body }),
      invalidatesTags: [...HOLIDAY_TAGS],
    }),
    deleteHoliday: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/holidays/${id}`, method: "DELETE" }),
      invalidatesTags: [...HOLIDAY_TAGS],
    }),
  }),
});

export const {
  useGetHolidaysQuery,
  useGetHolidaySummaryQuery,
  useGetCountryHolidaysQuery,
  useImportCountryHolidaysMutation,
  useCreateHolidayMutation,
  useCopyHolidayYearMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
} = holidayApi;
