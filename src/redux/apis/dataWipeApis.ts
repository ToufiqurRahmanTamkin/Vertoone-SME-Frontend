import type { DataWipePayload, DataWipePreview, DataWipeResult } from "@/types/domain/dataWipe";
import { ALL_TAG_TYPES, baseApi } from "../baseApi";

const dataWipeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDataWipePreview: builder.query<DataWipePreview, void>({
      query: () => ({ url: "/data-wipe/preview", method: "GET" }),
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
