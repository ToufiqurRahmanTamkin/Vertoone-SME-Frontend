import type { Pagination } from "@/types";
import type {
  CreateMeetingRoomPayload,
  MeetingRoom,
  MeetingRoomListQuery,
  MeetingRoomOptionQuery,
  MeetingRoomRef,
  MeetingRoomSummary,
  UpdateMeetingRoomPayload,
} from "@/types/domain/meetingRoom";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface MeetingRoomListResult {
  data: MeetingRoom[];
  meta: Pagination;
}

const MEETING_ROOM_TAGS = [
  "MeetingRooms",
  "MeetingRoomSummary",
  "MeetingRoomOptions",
  "MeetingRoomFloors",
] as const;

const BASE_URL = "/calendar/meeting-rooms";

const meetingRoomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeetingRooms: builder.query<MeetingRoomListResult, MeetingRoomListQuery | void>({
      query: (params) => ({
        url: `${BASE_URL}${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MeetingRooms"],
    }),
    getMeetingRoomOptions: builder.query<MeetingRoomRef[], MeetingRoomOptionQuery | void>({
      query: (params) => ({
        url: `${BASE_URL}/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["MeetingRoomOptions"],
    }),
    getMeetingRoomFloors: builder.query<string[], void>({
      query: () => ({ url: `${BASE_URL}/floors`, method: "GET" }),
      providesTags: ["MeetingRoomFloors"],
    }),
    getMeetingRoomSummary: builder.query<MeetingRoomSummary, void>({
      query: () => ({ url: `${BASE_URL}/summary`, method: "GET" }),
      providesTags: ["MeetingRoomSummary"],
    }),
    getMeetingRoom: builder.query<MeetingRoom, string>({
      query: (id) => ({ url: `${BASE_URL}/${id}`, method: "GET" }),
      providesTags: ["MeetingRooms"],
    }),
    createMeetingRoom: builder.mutation<MeetingRoom, CreateMeetingRoomPayload>({
      query: (body) => ({ url: BASE_URL, method: "POST", body }),
      invalidatesTags: [...MEETING_ROOM_TAGS],
    }),
    updateMeetingRoom: builder.mutation<
      MeetingRoom,
      { id: string; body: UpdateMeetingRoomPayload }
    >({
      query: ({ id, body }) => ({ url: `${BASE_URL}/${id}`, method: "PATCH", body }),
      invalidatesTags: [...MEETING_ROOM_TAGS],
    }),
    deleteMeetingRoom: builder.mutation<null, string>({
      query: (id) => ({ url: `${BASE_URL}/${id}`, method: "DELETE" }),
      invalidatesTags: [...MEETING_ROOM_TAGS],
    }),
  }),
});

export const {
  useGetMeetingRoomsQuery,
  useGetMeetingRoomOptionsQuery,
  useGetMeetingRoomFloorsQuery,
  useGetMeetingRoomSummaryQuery,
  useGetMeetingRoomQuery,
  useCreateMeetingRoomMutation,
  useUpdateMeetingRoomMutation,
  useDeleteMeetingRoomMutation,
} = meetingRoomApi;
