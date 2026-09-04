import type { Pagination } from "@/types";
import type {
  Announcement,
  AnnouncementListQuery,
  AnnouncementOverview,
  AnnouncementPayload,
  AnnouncementReader,
  AnnouncementSummary,
} from "@/types/domain/announcement";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ListResult<T> {
  data: T[];
  meta: Pagination;
}

const ANNOUNCEMENT_TAGS = [
  "Announcements",
  "AnnouncementFeed",
  "AnnouncementSummary",
  "AnnouncementOverview",
] as const;

const announcementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query<ListResult<Announcement>, AnnouncementListQuery | void>({
      query: (params) => ({
        url: `/hrms/announcements${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["Announcements"],
    }),
    getAnnouncementFeed: builder.query<ListResult<Announcement>, AnnouncementListQuery | void>({
      query: (params) => ({
        url: `/hrms/announcements/feed${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["AnnouncementFeed"],
    }),
    getAnnouncement: builder.query<Announcement, string>({
      query: (id) => ({ url: `/hrms/announcements/${id}`, method: "GET" }),
      providesTags: ["Announcements"],
    }),
    getAnnouncementSummary: builder.query<AnnouncementSummary, void>({
      query: () => ({ url: "/hrms/announcements/summary", method: "GET" }),
      providesTags: ["AnnouncementSummary"],
    }),
    getAnnouncementOverview: builder.query<AnnouncementOverview, void>({
      query: () => ({ url: "/hrms/announcements/overview", method: "GET" }),
      providesTags: ["AnnouncementOverview"],
    }),
    getAnnouncementReaders: builder.query<AnnouncementReader[], string>({
      query: (id) => ({ url: `/hrms/announcements/${id}/readers`, method: "GET" }),
      providesTags: ["AnnouncementReaders"],
    }),
    createAnnouncement: builder.mutation<Announcement, AnnouncementPayload>({
      query: (body) => ({ url: "/hrms/announcements", method: "POST", body }),
      invalidatesTags: [...ANNOUNCEMENT_TAGS],
    }),
    updateAnnouncement: builder.mutation<
      Announcement,
      { id: string; body: Partial<AnnouncementPayload> }
    >({
      query: ({ id, body }) => ({ url: `/hrms/announcements/${id}`, method: "PATCH", body }),
      invalidatesTags: [...ANNOUNCEMENT_TAGS],
    }),
    publishAnnouncement: builder.mutation<Announcement, string>({
      query: (id) => ({ url: `/hrms/announcements/${id}/publish`, method: "POST" }),
      invalidatesTags: [...ANNOUNCEMENT_TAGS],
    }),
    markAnnouncementRead: builder.mutation<Announcement, string>({
      query: (id) => ({ url: `/hrms/announcements/${id}/read`, method: "POST" }),
      invalidatesTags: [...ANNOUNCEMENT_TAGS, "AnnouncementReaders"],
    }),
    deleteAnnouncement: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/announcements/${id}`, method: "DELETE" }),
      invalidatesTags: [...ANNOUNCEMENT_TAGS],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementFeedQuery,
  useGetAnnouncementQuery,
  useGetAnnouncementSummaryQuery,
  useGetAnnouncementOverviewQuery,
  useGetAnnouncementReadersQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  usePublishAnnouncementMutation,
  useMarkAnnouncementReadMutation,
  useDeleteAnnouncementMutation,
} = announcementApi;
