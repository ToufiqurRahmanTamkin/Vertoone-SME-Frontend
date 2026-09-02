import type {
  AiAllowance,
  AiCompanyDraft,
  AiGeneratedCategory,
  AiPlanCopy,
  GenerateCategoriesPayload,
  GeneratePlanCopyPayload,
} from "@/types/domain/ai";
import { baseApi } from "../baseApi";

const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAiAllowance: builder.query<AiAllowance, void>({
      query: () => ({ url: "/ai/allowance", method: "GET" }),
      providesTags: ["AiAllowance"],
    }),
    generateFinanceCategories: builder.mutation<AiGeneratedCategory[], GenerateCategoriesPayload>({
      query: (body) => ({ url: "/ai/finance-categories", method: "POST", body }),
      invalidatesTags: ["AiAllowance"],
    }),
    generatePlanCopy: builder.mutation<AiPlanCopy, GeneratePlanCopyPayload>({
      query: (body) => ({ url: "/ai/plan-copy", method: "POST", body }),
      invalidatesTags: ["AiAllowance"],
    }),
    generateCompanyDraft: builder.mutation<AiCompanyDraft, { prompt: string }>({
      query: (body) => ({ url: "/ai/company-draft", method: "POST", body }),
      invalidatesTags: ["AiAllowance"],
    }),
  }),
});

export const {
  useGetAiAllowanceQuery,
  useGenerateFinanceCategoriesMutation,
  useGeneratePlanCopyMutation,
  useGenerateCompanyDraftMutation,
} = aiApi;
