import type { Pagination } from "@/types";
import type {
  LandedCost,
  LandedCostListQuery,
  LandedCostPayload,
  LandedCostSummary,
} from "@/types/domain/landedCost";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface LandedCostListResult {
  data: LandedCost[];
  meta: Pagination;
}

const LANDED_COST_TAGS = [
  "LandedCosts",
  "LandedCostSummary",
  "GoodsReceipts",
  "GoodsReceiptSummary",
  "PurchasesOverview",
  "Stock",
  "StockSummary",
  "Valuation",
  "ValuationSummary",
] as const;

const landedCostApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandedCosts: builder.query<LandedCostListResult, LandedCostListQuery | void>({
      query: (params) => ({
        url: `/sme/landed-costs${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["LandedCosts"],
    }),
    getLandedCostSummary: builder.query<LandedCostSummary, void>({
      query: () => ({ url: "/sme/landed-costs/summary", method: "GET" }),
      providesTags: ["LandedCostSummary"],
    }),
    getLandedCost: builder.query<LandedCost, string>({
      query: (id) => ({ url: `/sme/landed-costs/${id}`, method: "GET" }),
      providesTags: ["LandedCosts"],
    }),
    createLandedCost: builder.mutation<LandedCost, LandedCostPayload>({
      query: (body) => ({ url: "/sme/landed-costs", method: "POST", body }),
      invalidatesTags: [...LANDED_COST_TAGS],
    }),
    updateLandedCost: builder.mutation<
      LandedCost,
      { id: string; body: Partial<LandedCostPayload> }
    >({
      query: ({ id, body }) => ({ url: `/sme/landed-costs/${id}`, method: "PATCH", body }),
      invalidatesTags: [...LANDED_COST_TAGS],
    }),
    allocateLandedCost: builder.mutation<LandedCost, string>({
      query: (id) => ({ url: `/sme/landed-costs/${id}/allocate`, method: "POST" }),
      invalidatesTags: [...LANDED_COST_TAGS],
    }),
    cancelLandedCost: builder.mutation<LandedCost, string>({
      query: (id) => ({ url: `/sme/landed-costs/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...LANDED_COST_TAGS],
    }),
    deleteLandedCost: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/landed-costs/${id}`, method: "DELETE" }),
      invalidatesTags: [...LANDED_COST_TAGS],
    }),
  }),
});

export const {
  useGetLandedCostsQuery,
  useGetLandedCostSummaryQuery,
  useGetLandedCostQuery,
  useCreateLandedCostMutation,
  useUpdateLandedCostMutation,
  useAllocateLandedCostMutation,
  useCancelLandedCostMutation,
  useDeleteLandedCostMutation,
} = landedCostApi;
