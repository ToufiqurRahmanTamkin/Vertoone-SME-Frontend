import type { Pagination } from "@/types";
import type {
  UnitOfMeasure,
  UnitOfMeasureListQuery,
  UnitOfMeasureOptionQuery,
  UnitOfMeasurePayload,
  UnitOfMeasureRef,
  UnitOfMeasureSummary,
} from "@/types/domain/unitOfMeasure";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface UnitListResult {
  data: UnitOfMeasure[];
  meta: Pagination;
}

const UNIT_TAGS = ["Units", "UnitSummary", "UnitOptions", "Products", "ProductOverview"] as const;

const unitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnits: builder.query<UnitListResult, UnitOfMeasureListQuery | void>({
      query: (params) => ({
        url: `/sme/units${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Units"],
    }),
    getUnitOptions: builder.query<UnitOfMeasureRef[], UnitOfMeasureOptionQuery | void>({
      query: (params) => ({
        url: `/sme/units/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["UnitOptions"],
    }),
    getUnitSummary: builder.query<UnitOfMeasureSummary, void>({
      query: () => ({ url: "/sme/units/summary", method: "GET" }),
      providesTags: ["UnitSummary"],
    }),
    getUnit: builder.query<UnitOfMeasure, string>({
      query: (id) => ({ url: `/sme/units/${id}`, method: "GET" }),
      providesTags: ["Units"],
    }),
    createUnit: builder.mutation<UnitOfMeasure, UnitOfMeasurePayload>({
      query: (body) => ({ url: "/sme/units", method: "POST", body }),
      invalidatesTags: [...UNIT_TAGS],
    }),
    updateUnit: builder.mutation<
      UnitOfMeasure,
      { id: string; body: Partial<UnitOfMeasurePayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/units/${id}`, method: "PATCH", body }),
      invalidatesTags: [...UNIT_TAGS],
    }),
    deleteUnit: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/units/${id}`, method: "DELETE" }),
      invalidatesTags: [...UNIT_TAGS],
    }),
  }),
});

export const {
  useGetUnitsQuery,
  useGetUnitOptionsQuery,
  useGetUnitSummaryQuery,
  useGetUnitQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = unitApi;
