import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { env } from "@/config/env";
import type { AuthUser, PaginationMeta } from "@/types";
import { logOut, setCredentials } from "./authSlice";

/** The envelope every endpoint returns. */
export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { token: string | null } }).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

type QueryResult = Awaited<ReturnType<typeof rawBaseQuery>>;

/**
 * Collapses `{ success, message, data, meta }` down to what the endpoint asked
 * for. Lists keep `{ data, meta }`; everything else becomes the bare payload,
 * so components never reach through an envelope.
 */
const unwrap = (result: QueryResult): void => {
  if (!result.data) return;
  const envelope = result.data as ApiEnvelope;
  if (!envelope.success) return;
  result.data = envelope.meta ? { data: envelope.data, meta: envelope.meta } : envelope.data;
};

// A single in-flight refresh, shared by every 401 that arrives while it runs.
let refreshPromise: Promise<string | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  unwrap(result);

  if (result.error?.status !== 401) {
    return result;
  }

  const state = api.getState() as { auth: { refreshToken: string | null; user: AuthUser | null } };
  const { refreshToken, user } = state.auth;

  if (!refreshToken || !user) {
    api.dispatch(logOut());
    return result;
  }

  // Concurrent 401s must not each burn a refresh token — the first one starts
  // the refresh and the rest await the same promise.
  refreshPromise ??= (async () => {
    try {
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions
      );
      const envelope = refreshResult.data as
        | ApiEnvelope<{ accessToken: string; refreshToken: string }>
        | undefined;

      if (!envelope?.success) return null;

      api.dispatch(
        setCredentials({
          user,
          accessToken: envelope.data.accessToken,
          refreshToken: envelope.data.refreshToken,
        })
      );
      return envelope.data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  const newToken = await refreshPromise;

  if (!newToken) {
    api.dispatch(logOut());
    return result;
  }

  result = await rawBaseQuery(args, api, extraOptions);
  unwrap(result);
  return result;
};

export const TAG_TYPES = [
  "Auth",
  "Dashboard",
  "SystemConfig",
  "SubscriptionPlans",
  "SoldSubscriptions",
  "UserGuides",
] as const;

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
});
