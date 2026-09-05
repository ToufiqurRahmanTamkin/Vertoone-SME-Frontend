import type { Pagination } from "@/types";
import type {
  ReorderRule,
  ReorderRuleListQuery,
  ReorderRulePayload,
  ReorderRuleSummary,
} from "@/types/domain/reorderRule";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ReorderRuleListResult {
  data: ReorderRule[];
  meta: Pagination;
}

const REORDER_TAGS = ["ReorderRules", "ReorderRuleSummary", "InventoryOverview"] as const;

const reorderRuleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReorderRules: builder.query<ReorderRuleListResult, ReorderRuleListQuery | void>({
      query: (params) => ({
        url: `/sme/reorder-rules${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["ReorderRules"],
    }),
    getReorderRuleSummary: builder.query<ReorderRuleSummary, void>({
      query: () => ({ url: "/sme/reorder-rules/summary", method: "GET" }),
      providesTags: ["ReorderRuleSummary"],
    }),
    createReorderRule: builder.mutation<ReorderRule, ReorderRulePayload>({
      query: (body) => ({ url: "/sme/reorder-rules", method: "POST", body }),
      invalidatesTags: [...REORDER_TAGS],
    }),
    updateReorderRule: builder.mutation<
      ReorderRule,
      { id: string; body: Partial<Omit<ReorderRulePayload, "productId">> }
    >({
      query: ({ id, body }) => ({ url: `/sme/reorder-rules/${id}`, method: "PATCH", body }),
      invalidatesTags: [...REORDER_TAGS],
    }),
    deleteReorderRule: builder.mutation<null, string>({
      query: (id) => ({ url: `/sme/reorder-rules/${id}`, method: "DELETE" }),
      invalidatesTags: [...REORDER_TAGS],
    }),
  }),
});

export const {
  useGetReorderRulesQuery,
  useGetReorderRuleSummaryQuery,
  useCreateReorderRuleMutation,
  useUpdateReorderRuleMutation,
  useDeleteReorderRuleMutation,
} = reorderRuleApi;
