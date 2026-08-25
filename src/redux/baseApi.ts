import config from "@/config/envConfig";
import type { Pagination } from "@/types";
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { logOut, setCredentials, type User } from "./authSlice";

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: config.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: Pagination;
}

export interface ApiErrorResponse {
  status: number;
  data: {
    success: boolean;
    message: string;
  };
}

// The backend answers every route with `{ success, message, data, meta? }`.
// Unwrap it to the inner payload so endpoints type against the domain shape,
// and fold `meta` in alongside `data` for paginated lists.
const unwrapEnvelope = (result: Awaited<ReturnType<typeof baseQuery>>) => {
  if (!result.data) return;
  const envelope = result.data as ApiResponse;
  if (!envelope.success) return;
  result.data = envelope.meta ? { data: envelope.data, meta: envelope.meta } : envelope.data;
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  unwrapEnvelope(result);

  if (result.error?.status !== 401) {
    return result;
  }

  // Another request is already refreshing — wait for it, then replay with the
  // token it obtained rather than firing a second refresh.
  if (mutex.isLocked()) {
    await mutex.waitForUnlock();
    result = await baseQuery(args, api, extraOptions);
    unwrapEnvelope(result);
    return result;
  }

  const release = await mutex.acquire();
  try {
    const state = api.getState() as {
      auth: { refreshToken: string | null; user: User | null };
    };
    const refreshToken = state.auth.refreshToken;

    if (!refreshToken || !state.auth.user) {
      throw new Error("No refresh token available");
    }

    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST", body: { refreshToken } },
      api,
      extraOptions
    );

    if (!refreshResult.data) {
      throw new Error("Refresh rejected");
    }

    const tokens = (
      refreshResult.data as ApiResponse<{ accessToken: string; refreshToken: string }>
    ).data;

    api.dispatch(
      setCredentials({
        user: state.auth.user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    );

    result = await baseQuery(args, api, extraOptions);
    unwrapEnvelope(result);
  } catch {
    api.dispatch(logOut());
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  } finally {
    release();
  }

  return result;
};

// Cache tag types. Each new module adds its own here.
export const ALL_TAG_TYPES = [
  "Me",
  "Dashboard",
  "SystemConfig",
  "SubscriptionPlans",
  "SoldSubscriptions",
  "UserGuides",
] as const;


export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ALL_TAG_TYPES,
  endpoints: () => ({}),
});
