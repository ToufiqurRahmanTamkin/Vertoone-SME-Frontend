import type { Pagination } from "@/types";
import type {
  AppNotification,
  NotificationListQuery,
  UnreadCount,
} from "@/types/domain/notification";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface NotificationListResult {
  data: AppNotification[];
  meta: Pagination;
}

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationListResult, NotificationListQuery | void>({
      query: (params) => ({
        url: `/notifications${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),
    getUnreadNotificationCount: builder.query<UnreadCount, void>({
      query: () => ({ url: "/notifications/unread-count", method: "GET" }),
      providesTags: ["NotificationsUnread"],
    }),
    markNotificationRead: builder.mutation<AppNotification, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notifications", "NotificationsUnread"],
    }),
    markAllNotificationsRead: builder.mutation<UnreadCount, void>({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notifications", "NotificationsUnread"],
    }),
    deleteNotification: builder.mutation<null, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notifications", "NotificationsUnread"],
    }),
    clearNotifications: builder.mutation<null, void>({
      query: () => ({ url: "/notifications", method: "DELETE" }),
      invalidatesTags: ["Notifications", "NotificationsUnread"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useClearNotificationsMutation,
} = notificationApi;
