import type { Pagination } from "@/types";
import type {
  BinLocation,
  BinLocationListQuery,
  BinLocationPayload,
  BinLocationSummary,
} from "@/types/domain/binLocation";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface BinLocationListResult {
  data: BinLocation[];
  meta: Pagination;
}

const BIN_TAGS = ["BinLocations", "BinLocationSummary", "InventoryOverview"] as const;

const binLocationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBinLocations: builder.query<BinLocationListResult, BinLocationListQuery | void>({
      query: (params) => ({
        url: `/sme/bin-locations${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["BinLocations"],
    }),
    getBinLocationSummary: builder.query<BinLocationSummary, void>({
      query: () => ({ url: "/sme/bin-locations/summary", method: "GET" }),
      providesTags: ["BinLocationSummary"],
    }),
    createBinLocation: builder.mutation<BinLocation, BinLocationPayload>({
      query: (body) => ({ url: "/sme/bin-locations", method: "POST", body }),
      invalidatesTags: [...BIN_TAGS],
    }),
    updateBinLocation: builder.mutation<
      BinLocation,
      { id: string; body: Partial<BinLocationPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/bin-locations/${id}`, method: "PATCH", body }),
      invalidatesTags: [...BIN_TAGS],
    }),
    deleteBinLocation: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/bin-locations/${id}`, method: "DELETE" }),
      invalidatesTags: [...BIN_TAGS],
    }),
  }),
});

export const {
  useGetBinLocationsQuery,
  useGetBinLocationSummaryQuery,
  useCreateBinLocationMutation,
  useUpdateBinLocationMutation,
  useDeleteBinLocationMutation,
} = binLocationApi;
