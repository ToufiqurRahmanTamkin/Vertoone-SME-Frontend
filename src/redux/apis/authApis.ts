import type {
  AuthTokens,
  ChangePasswordInput,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  LoginInput,
  LoginResponse,
  ResetPasswordInput,
  UpdateProfileInput,
  User,
  VerifyOtpInput,
  VerifyOtpResponse,
} from "@/types/domain/auth";
import { setCredentials, setUser } from "../authSlice";
import { baseApi } from "../baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginInput>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          setCredentials({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
        );
      },
    }),
    getMe: builder.query<User, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
      providesTags: ["Me"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {
          // A failed /me is handled by the 401 refresh flow in baseApi.
        }
      },
    }),
    updateProfile: builder.mutation<User, UpdateProfileInput>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Me"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setUser(data));
      },
    }),
    changePassword: builder.mutation<null, ChangePasswordInput>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "PATCH",
        body,
      }),
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordInput>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    verifyPasswordOtp: builder.mutation<VerifyOtpResponse, VerifyOtpInput>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<null, ResetPasswordInput>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    refreshToken: builder.mutation<AuthTokens, { refreshToken: string }>({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<null, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useVerifyPasswordOtpMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;
