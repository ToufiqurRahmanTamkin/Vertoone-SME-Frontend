import type {
  AiAllowance,
  AiBoardDraft,
  AiCompanyDraft,
  AiDepartmentDraft,
  AiDesignationDraft,
  AiGeneratedCategory,
  AiGoalDraft,
  AiNoteDraft,
  AiPlanCopy,
  GenerateBoardPayload,
  GenerateCategoriesPayload,
  GenerateDepartmentsPayload,
  GenerateDesignationsPayload,
  GenerateGoalPayload,
  GenerateNotePayload,
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
    generateBoardDraft: builder.mutation<AiBoardDraft, GenerateBoardPayload>({
      query: (body) => ({ url: "/ai/task-board-draft", method: "POST", body }),
      invalidatesTags: ["AiAllowance"],
    }),
    generateGoalDraft: builder.mutation<AiGoalDraft, GenerateGoalPayload>({
      query: (body) => ({ url: "/ai/goal-draft", method: "POST", body }),
      invalidatesTags: ["AiAllowance"],
    }),
    generateNoteDraft: builder.mutation<AiNoteDraft, GenerateNotePayload>({
      query: (body) => ({ url: "/ai/note-draft", method: "POST", body }),
      invalidatesTags: ["AiAllowance"],
    }),
    generateDepartments: builder.mutation<AiDepartmentDraft[], GenerateDepartmentsPayload>({
      query: (body) => ({ url: "/ai/departments", method: "POST", body }),
      invalidatesTags: ["AiAllowance"],
    }),
    generateDesignations: builder.mutation<AiDesignationDraft[], GenerateDesignationsPayload>({
      query: (body) => ({ url: "/ai/designations", method: "POST", body }),
      invalidatesTags: ["AiAllowance"],
    }),
  }),
});

export const {
  useGetAiAllowanceQuery,
  useGenerateFinanceCategoriesMutation,
  useGeneratePlanCopyMutation,
  useGenerateCompanyDraftMutation,
  useGenerateBoardDraftMutation,
  useGenerateGoalDraftMutation,
  useGenerateNoteDraftMutation,
  useGenerateDepartmentsMutation,
  useGenerateDesignationsMutation,
} = aiApi;
