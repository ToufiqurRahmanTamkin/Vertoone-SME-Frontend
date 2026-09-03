import type { TasksGoalsOverview } from "@/types/domain/tasksGoalsOverview";
import { baseApi } from "../baseApi";

const tasksGoalsOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasksGoalsOverview: builder.query<TasksGoalsOverview, void>({
      query: () => ({ url: "/tasks-goals/overview", method: "GET" }),
      providesTags: ["TasksGoalsOverview"],
    }),
  }),
});

export const { useGetTasksGoalsOverviewQuery } = tasksGoalsOverviewApi;
