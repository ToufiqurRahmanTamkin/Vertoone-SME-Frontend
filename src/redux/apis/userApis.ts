import type { UserOption, UserOptionQuery } from "@/types/domain/userOption";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserOptions: builder.query<UserOption[], UserOptionQuery | void>({
      query: (params) => ({
        url: `/users/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["UserOptions"],
    }),
  }),
});

export const { useGetUserOptionsQuery } = userApi;
