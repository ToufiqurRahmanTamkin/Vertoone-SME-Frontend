import type { Pagination } from "@/types";
import type {
  Goal,
  GoalCheckInPayload,
  GoalListQuery,
  GoalOptionQuery,
  GoalPayload,
  GoalRef,
  GoalSummary,
  MyGoalSummary,
} from "@/types/domain/goal";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface GoalListResult {
  data: Goal[];
  meta: Pagination;
}

const GOAL_TAGS = ["Goals", "GoalSummary", "GoalOptions"] as const;

const goalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGoals: builder.query<GoalListResult, GoalListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/goals${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Goals"],
    }),
    getMyGoals: builder.query<GoalListResult, GoalListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/goals/mine${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MyGoals"],
    }),
    getMyGoalSummary: builder.query<MyGoalSummary, void>({
      query: () => ({ url: "/tasks-goals/goals/mine/summary", method: "GET" }),
      providesTags: ["MyGoalSummary"],
    }),
    getGoalOptions: builder.query<GoalRef[], GoalOptionQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/goals/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["GoalOptions"],
    }),
    getGoalSummary: builder.query<GoalSummary, void>({
      query: () => ({ url: "/tasks-goals/goals/summary", method: "GET" }),
      providesTags: ["GoalSummary"],
    }),
    getGoal: builder.query<Goal, string>({
      query: (id) => ({ url: `/tasks-goals/goals/${id}`, method: "GET" }),
      providesTags: ["Goals"],
    }),
    createGoal: builder.mutation<Goal, GoalPayload>({
      query: (body) => ({ url: "/tasks-goals/goals", method: "POST", body }),
      invalidatesTags: [...GOAL_TAGS],
    }),
    updateGoal: builder.mutation<Goal, { id: string; body: Partial<GoalPayload> }>({
      query: ({ id, body }) => ({ url: `/tasks-goals/goals/${id}`, method: "PATCH", body }),
      invalidatesTags: [...GOAL_TAGS],
    }),
    recordGoalCheckIn: builder.mutation<Goal, { id: string; body: GoalCheckInPayload }>({
      query: ({ id, body }) => ({
        url: `/tasks-goals/goals/${id}/check-ins`,
        method: "POST",
        body,
      }),
      invalidatesTags: [...GOAL_TAGS],
    }),
    deleteGoal: builder.mutation<null, string>({
      query: (id) => ({ url: `/tasks-goals/goals/${id}`, method: "DELETE" }),
      invalidatesTags: [...GOAL_TAGS],
    }),
  }),
});

export const {
  useGetGoalsQuery,
  useGetGoalOptionsQuery,
  useGetMyGoalsQuery,
  useGetMyGoalSummaryQuery,
  useGetGoalSummaryQuery,
  useGetGoalQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useRecordGoalCheckInMutation,
  useDeleteGoalMutation,
} = goalApi;
