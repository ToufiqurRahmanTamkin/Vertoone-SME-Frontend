import type {
  DataWipePayload,
  DataWipePreview,
  DataWipePreviewQuery,
  DataWipeResult,
} from "@/types/domain/dataWipe";
import { ALL_TAG_TYPES, baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const dataWipeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDataWipePreview: builder.query<DataWipePreview, DataWipePreviewQuery | void>({
      query: (params) => ({
        url: `/data-wipe/preview${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["DataWipe"],
    }),
    executeDataWipe: builder.mutation<DataWipeResult, DataWipePayload>({
      query: (body) => ({ url: "/data-wipe", method: "POST", body }),
      invalidatesTags: [...ALL_TAG_TYPES],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(baseApi.util.resetApiState());
      },
    }),
  }),
});

export const { useGetDataWipePreviewQuery, useExecuteDataWipeMutation } = dataWipeApi;
