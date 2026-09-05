import type { Pagination } from "@/types";
import type {
  Promotion,
  PromotionListQuery,
  PromotionPayload,
  PromotionSummary,
} from "@/types/domain/promotion";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface PromotionListResult {
  data: Promotion[];
  meta: Pagination;
}

const PROMOTION_TAGS = ["Promotions", "PromotionSummary", "ProductOverview"] as const;

const promotionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPromotions: builder.query<PromotionListResult, PromotionListQuery | void>({
      query: (params) => ({
        url: `/sme/promotions${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Promotions"],
    }),
    getPromotionSummary: builder.query<PromotionSummary, void>({
      query: () => ({ url: "/sme/promotions/summary", method: "GET" }),
      providesTags: ["PromotionSummary"],
    }),
    getPromotion: builder.query<Promotion, string>({
      query: (id) => ({ url: `/sme/promotions/${id}`, method: "GET" }),
      providesTags: ["Promotions"],
    }),
    createPromotion: builder.mutation<Promotion, PromotionPayload>({
      query: (body) => ({ url: "/sme/promotions", method: "POST", body }),
      invalidatesTags: [...PROMOTION_TAGS],
    }),
    updatePromotion: builder.mutation<Promotion, { id: string; body: Partial<PromotionPayload> }>({
      query: ({ id, body }) => ({ url: `/sme/promotions/${id}`, method: "PATCH", body }),
      invalidatesTags: [...PROMOTION_TAGS],
    }),
    deletePromotion: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/promotions/${id}`, method: "DELETE" }),
      invalidatesTags: [...PROMOTION_TAGS],
    }),
  }),
});

export const {
  useGetPromotionsQuery,
  useGetPromotionSummaryQuery,
  useGetPromotionQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} = promotionApi;
