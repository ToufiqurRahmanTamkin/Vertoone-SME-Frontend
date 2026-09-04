import type { Pagination } from "@/types";
import type {
  WorkHistoryEntry,
  WorkHistoryListQuery,
  WorkHistoryPayload,
  WorkHistorySummary,
} from "@/types/domain/workHistory";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface WorkHistoryListResult {
  data: WorkHistoryEntry[];
  meta: Pagination;
}

const WORK_HISTORY_TAGS = [
  "WorkHistories",
  "WorkHistorySummary",
  "MyWorkHistory",
] as const;

const workHistoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkHistories: builder.query<WorkHistoryListResult, WorkHistoryListQuery | void>({
      query: (params) => ({
        url: `/hrms/work-histories${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["WorkHistories"],
    }),
    getWorkHistorySummary: builder.query<WorkHistorySummary, WorkHistoryListQuery | void>({
      query: (params) => ({
        url: `/hrms/work-histories/summary${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["WorkHistorySummary"],
    }),
    getMyWorkHistory: builder.query<WorkHistoryListResult, WorkHistoryListQuery | void>({
      query: (params) => ({
        url: `/hrms/work-histories/mine${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MyWorkHistory"],
    }),
    createWorkHistory: builder.mutation<WorkHistoryEntry, WorkHistoryPayload>({
      query: (body) => ({ url: "/hrms/work-histories", method: "POST", body }),
      invalidatesTags: [...WORK_HISTORY_TAGS],
    }),
    updateWorkHistory: builder.mutation<
      WorkHistoryEntry,
      { id: string; body: Partial<Omit<WorkHistoryPayload, "employeeId">> }
    >({
      query: ({ id, body }) => ({ url: `/hrms/work-histories/${id}`, method: "PATCH", body }),
      invalidatesTags: [...WORK_HISTORY_TAGS],
    }),
    deleteWorkHistory: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/work-histories/${id}`, method: "DELETE" }),
      invalidatesTags: [...WORK_HISTORY_TAGS],
    }),
  }),
});

export const {
  useGetWorkHistoriesQuery,
  useGetWorkHistorySummaryQuery,
  useGetMyWorkHistoryQuery,
  useCreateWorkHistoryMutation,
  useUpdateWorkHistoryMutation,
  useDeleteWorkHistoryMutation,
} = workHistoryApi;
