import type { Pagination } from "@/types";
import type {
  MyTaskSummary,
  Task,
  TaskActivity,
  TaskActivityListQuery,
  TaskActivityPayload,
  TaskActivitySummary,
  TaskActivityUpdatePayload,
  TaskAssigneeOption,
  TaskAssigneeOptionQuery,
  TaskBoardListQuery,
  TaskBoardPayload,
  TaskBoardRef,
  TaskBoardSummary,
  TaskBoardView,
  TaskBoardViewQuery,
  TaskBoardWithStats,
  TaskListQuery,
  TaskMovePayload,
  TaskPayload,
  TaskReorderPayload,
  TaskSummary,
  TaskUpdatePayload,
} from "@/types/domain/task";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface TaskBoardListResult {
  data: TaskBoardWithStats[];
  meta: Pagination;
}

interface TaskListResult {
  data: Task[];
  meta: Pagination;
}

interface TaskActivityListResult {
  data: TaskActivity[];
  meta: Pagination;
}

const BOARD_TAGS = [
  "TaskBoards",
  "TaskBoardSummary",
  "TaskBoardOptions",
  "TaskBoardView",
] as const;

const TASK_TAGS = [
  "Tasks",
  "TaskSummary",
  "TaskBoardView",
  "TaskBoards",
  "TaskBoardSummary",
  "TaskActivities",
  "TaskActivitySummary",
] as const;

const TASK_ACTIVITY_TAGS = [
  "TaskActivities",
  "TaskActivitySummary",
  "Tasks",
  "TaskBoardView",
] as const;

const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTaskBoards: builder.query<TaskBoardListResult, TaskBoardListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/boards${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["TaskBoards"],
    }),
    getTaskBoardOptions: builder.query<TaskBoardRef[], { search?: string } | void>({
      query: (params) => ({
        url: `/tasks-goals/boards/options${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["TaskBoardOptions"],
    }),
    getTaskBoardSummary: builder.query<TaskBoardSummary, void>({
      query: () => ({ url: "/tasks-goals/boards/summary", method: "GET" }),
      providesTags: ["TaskBoardSummary"],
    }),
    getTaskBoard: builder.query<TaskBoardWithStats, string>({
      query: (id) => ({ url: `/tasks-goals/boards/${id}`, method: "GET" }),
      providesTags: ["TaskBoards"],
    }),
    createTaskBoard: builder.mutation<TaskBoardWithStats, TaskBoardPayload>({
      query: (body) => ({ url: "/tasks-goals/boards", method: "POST", body }),
      invalidatesTags: [...BOARD_TAGS],
    }),
    updateTaskBoard: builder.mutation<
      TaskBoardWithStats,
      { id: string; body: Partial<TaskBoardPayload> }
    >({
      query: ({ id, body }) => ({ url: `/tasks-goals/boards/${id}`, method: "PATCH", body }),
      invalidatesTags: [...BOARD_TAGS, "Tasks"],
    }),
    deleteTaskBoard: builder.mutation<null, string>({
      query: (id) => ({ url: `/tasks-goals/boards/${id}`, method: "DELETE" }),
      invalidatesTags: [...BOARD_TAGS, "Tasks", "TaskSummary", "TaskActivities"],
    }),

    getTaskBoardView: builder.query<TaskBoardView, TaskBoardViewQuery>({
      query: (params) => ({
        url: `/tasks-goals/tasks/board${buildQuery(params as unknown as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["TaskBoardView"],
    }),
    getTasks: builder.query<TaskListResult, TaskListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/tasks${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Tasks"],
    }),
    getTaskSummary: builder.query<TaskSummary, TaskListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/tasks/summary${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["TaskSummary"],
    }),
    getMyTasks: builder.query<TaskListResult, TaskListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/tasks/mine${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MyTasks"],
    }),
    getMyTaskSummary: builder.query<MyTaskSummary, TaskListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/tasks/mine/summary${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["MyTaskSummary"],
    }),
    setMyTaskCompletion: builder.mutation<Task, { id: string; isCompleted: boolean }>({
      query: ({ id, isCompleted }) => ({
        url: `/tasks-goals/tasks/mine/${id}/completion`,
        method: "PATCH",
        body: { isCompleted },
      }),
      invalidatesTags: [...TASK_TAGS, "MyTasks", "MyTaskSummary"],
    }),
    getTaskAssigneeOptions: builder.query<TaskAssigneeOption[], TaskAssigneeOptionQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/tasks/assignees${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["TaskAssigneeOptions"],
    }),
    getTask: builder.query<Task, string>({
      query: (id) => ({ url: `/tasks-goals/tasks/${id}`, method: "GET" }),
      providesTags: ["Tasks"],
    }),
    createTask: builder.mutation<Task, TaskPayload>({
      query: (body) => ({ url: "/tasks-goals/tasks", method: "POST", body }),
      invalidatesTags: [...TASK_TAGS],
    }),
    updateTask: builder.mutation<Task, { id: string; body: TaskUpdatePayload }>({
      query: ({ id, body }) => ({ url: `/tasks-goals/tasks/${id}`, method: "PATCH", body }),
      invalidatesTags: [...TASK_TAGS],
    }),
    moveTask: builder.mutation<Task, { id: string; body: TaskMovePayload }>({
      query: ({ id, body }) => ({ url: `/tasks-goals/tasks/${id}/move`, method: "PATCH", body }),
      invalidatesTags: [...TASK_TAGS],
    }),
    reorderTasks: builder.mutation<null, { boardId: string; body: TaskReorderPayload }>({
      query: ({ boardId, body }) => ({
        url: `/tasks-goals/tasks/reorder/${boardId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["TaskBoardView", "Tasks"],
    }),
    deleteTask: builder.mutation<null, string>({
      query: (id) => ({ url: `/tasks-goals/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: [...TASK_TAGS],
    }),

    getTaskActivities: builder.query<TaskActivityListResult, TaskActivityListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/task-activities${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["TaskActivities"],
    }),
    getTaskActivitySummary: builder.query<TaskActivitySummary, TaskActivityListQuery | void>({
      query: (params) => ({
        url: `/tasks-goals/task-activities/summary${buildQuery(
          (params ?? {}) as Record<string, unknown>
        )}`,
        method: "GET",
      }),
      providesTags: ["TaskActivitySummary"],
    }),
    createTaskActivity: builder.mutation<TaskActivity, TaskActivityPayload>({
      query: (body) => ({ url: "/tasks-goals/task-activities", method: "POST", body }),
      invalidatesTags: [...TASK_ACTIVITY_TAGS],
    }),
    updateTaskActivity: builder.mutation<
      TaskActivity,
      { id: string; body: TaskActivityUpdatePayload }
    >({
      query: ({ id, body }) => ({
        url: `/tasks-goals/task-activities/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [...TASK_ACTIVITY_TAGS],
    }),
    deleteTaskActivity: builder.mutation<null, string>({
      query: (id) => ({ url: `/tasks-goals/task-activities/${id}`, method: "DELETE" }),
      invalidatesTags: [...TASK_ACTIVITY_TAGS],
    }),
  }),
});

export const {
  useGetTaskBoardsQuery,
  useGetTaskBoardOptionsQuery,
  useGetTaskBoardSummaryQuery,
  useGetTaskBoardQuery,
  useCreateTaskBoardMutation,
  useUpdateTaskBoardMutation,
  useDeleteTaskBoardMutation,
  useGetTaskBoardViewQuery,
  useGetTasksQuery,
  useGetTaskSummaryQuery,
  useGetMyTasksQuery,
  useGetMyTaskSummaryQuery,
  useSetMyTaskCompletionMutation,
  useGetTaskAssigneeOptionsQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useMoveTaskMutation,
  useReorderTasksMutation,
  useDeleteTaskMutation,
  useGetTaskActivitiesQuery,
  useGetTaskActivitySummaryQuery,
  useCreateTaskActivityMutation,
  useUpdateTaskActivityMutation,
  useDeleteTaskActivityMutation,
} = taskApi;
