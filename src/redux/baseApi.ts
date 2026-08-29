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

const unwrapEnvelope = (result: Awaited<ReturnType<typeof baseQuery>>) => {
  if (!result.data) return;
  const envelope = result.data as ApiResponse;
  if (!envelope.success) return;
  result.data = envelope.meta ? { data: envelope.data, meta: envelope.meta } : envelope.data;
};

const PUBLIC_ENDPOINT_PATHS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/verify-otp",
  "/auth/reset-password",
  "/companies/register",
  "/companies/check-availability",
  "/subscription-plans/public",
  "/system-config/public",
];

const requestPath = (args: string | FetchArgs): string => {
  const url = typeof args === "string" ? args : args.url;
  return url.split("?")[0];
};

const isPublicRequest = (args: string | FetchArgs): boolean => {
  const path = requestPath(args);
  return PUBLIC_ENDPOINT_PATHS.some((publicPath) => path.startsWith(publicPath));
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  const basename = (import.meta.env.VITE_BASENAME || "").replace(/\/+$/, "");
  const loginPath = `${basename}/login`;
  if (window.location.pathname === loginPath) return;
  window.location.href = loginPath;
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  unwrapEnvelope(result);

  if (result.error?.status !== 401 || isPublicRequest(args)) {
    return result;
  }

  if (mutex.isLocked()) {
    await mutex.waitForUnlock();
    result = await baseQuery(args, api, extraOptions);
    unwrapEnvelope(result);
    return result;
  }

  const state = api.getState() as {
    auth: { refreshToken: string | null; user: User | null };
  };

  if (!state.auth.refreshToken || !state.auth.user) {
    api.dispatch(logOut());
    redirectToLogin();
    return result;
  }

  const release = await mutex.acquire();
  try {
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST", body: { refreshToken: state.auth.refreshToken } },
      api,
      extraOptions
    );

    const envelope = refreshResult.data as
      | ApiResponse<{ accessToken: string; refreshToken: string }>
      | undefined;

    if (!envelope?.success || !envelope.data?.accessToken) {
      throw new Error("Refresh rejected");
    }

    api.dispatch(
      setCredentials({
        user: state.auth.user,
        accessToken: envelope.data.accessToken,
        refreshToken: envelope.data.refreshToken,
      })
    );

    result = await baseQuery(args, api, extraOptions);
    unwrapEnvelope(result);
  } catch {
    api.dispatch(logOut());
    redirectToLogin();
  } finally {
    release();
  }

  return result;
};

export const ALL_TAG_TYPES = [
  "Me",
  "Dashboard",
  "SystemConfig",
  "SubscriptionPlans",
  "SoldSubscriptions",
  "UserGuides",
  "FinanceCategories",
  "Incomes",
  "Expenses",
  "Invoices",
  "LinkableEntries",
  "Notifications",
  "NotificationsUnread",
  "LoginHistory",
  "Reports",
  "Emails",
  "Companies",
  "CompanySummary",
  "MyCompany",
  "Activities",
  "DataWipe",
  "Permissions",
  "ModuleCatalogue",
  "TeamMembers",
  "TeamSummary",
  "Concerns",
  "ConcernSummary",
  "AllUsers",
  "Tags",
  "TagSummary",
  "TagOptions",
  "Employees",
  "EmployeeSummary",
  "EmployeeOptions",
  "Teams",
  "TeamsSummary",
  "Departments",
  "DepartmentSummary",
  "DepartmentOptions",
  "Designations",
  "DesignationSummary",
  "DesignationOptions",
  "LeadSources",
  "LeadSourceSummary",
] as const;

export type TagType = (typeof ALL_TAG_TYPES)[number];

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ALL_TAG_TYPES,
  endpoints: () => ({}),
});
