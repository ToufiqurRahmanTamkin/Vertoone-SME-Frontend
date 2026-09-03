import type { Pagination } from "@/types";
import type {
  CreateMaintainerPayload,
  Maintainer,
  MaintainerListQuery,
  MaintainerSummary,
  UpdateMaintainerPayload,
} from "@/types/domain/maintainer";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface MaintainerListResult {
  data: Maintainer[];
  meta: Pagination;
}

const MAINTAINER_TAGS = ["Maintainers", "MaintainerSummary", "Activities"] as const;

const maintainerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaintainers: builder.query<MaintainerListResult, MaintainerListQuery | void>({
      query: (params) => ({
        url: `/maintainers${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Maintainers"],
    }),
    getMaintainerSummary: builder.query<MaintainerSummary, void>({
      query: () => ({ url: "/maintainers/summary", method: "GET" }),
      providesTags: ["MaintainerSummary"],
    }),
    createMaintainer: builder.mutation<Maintainer, CreateMaintainerPayload>({
      query: (body) => ({ url: "/maintainers", method: "POST", body }),
      invalidatesTags: [...MAINTAINER_TAGS],
    }),
    updateMaintainer: builder.mutation<Maintainer, { id: string; body: UpdateMaintainerPayload }>({
      query: ({ id, body }) => ({ url: `/maintainers/${id}`, method: "PATCH", body }),
      invalidatesTags: [...MAINTAINER_TAGS],
    }),
    deleteMaintainer: builder.mutation<null, string>({
      query: (id) => ({ url: `/maintainers/${id}`, method: "DELETE" }),
      invalidatesTags: [...MAINTAINER_TAGS],
    }),
  }),
});

export const {
  useGetMaintainersQuery,
  useGetMaintainerSummaryQuery,
  useCreateMaintainerMutation,
  useUpdateMaintainerMutation,
  useDeleteMaintainerMutation,
} = maintainerApi;
