import type { Pagination } from "@/types";
import type {
  Forecast,
  ForecastQuery,
  ForecastTarget,
  ForecastTargetListQuery,
  ForecastTargetPayload,
  ForecastTargetUpdatePayload,
} from "@/types/domain/forecast";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ForecastTargetListResult {
  data: ForecastTarget[];
  meta: Pagination;
}

const FORECAST_TAGS = ["Forecast", "ForecastTargets"] as const;

const forecastApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getForecast: builder.query<Forecast, ForecastQuery | void>({
      query: (params) => ({
        url: `/crm/forecasts${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Forecast"],
    }),
    getForecastTargets: builder.query<ForecastTargetListResult, ForecastTargetListQuery | void>({
      query: (params) => ({
        url: `/crm/forecasts/targets${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ForecastTargets"],
    }),
    createForecastTarget: builder.mutation<ForecastTarget, ForecastTargetPayload>({
      query: (body) => ({ url: "/crm/forecasts/targets", method: "POST", body }),
      invalidatesTags: [...FORECAST_TAGS],
    }),
    updateForecastTarget: builder.mutation<
      ForecastTarget,
      { id: string; body: ForecastTargetUpdatePayload }
    >({
      query: ({ id, body }) => ({
        url: `/crm/forecasts/targets/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...FORECAST_TAGS],
    }),
    deleteForecastTarget: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/forecasts/targets/${id}`, method: "DELETE" }),
      invalidatesTags: [...FORECAST_TAGS],
    }),
  }),
});

export const {
  useGetForecastQuery,
  useGetForecastTargetsQuery,
  useCreateForecastTargetMutation,
  useUpdateForecastTargetMutation,
  useDeleteForecastTargetMutation,
} = forecastApi;
