import type {
  EmailProviderPreset,
  EmailSettings,
  EmailSettingsPayload,
  EmailTestResult,
} from "@/types/domain/emailSettings";
import { baseApi } from "../baseApi";

const emailSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailProviders: builder.query<EmailProviderPreset[], void>({
      query: () => ({ url: "/settings/email/providers", method: "GET" }),
      providesTags: ["EmailProviders"],
    }),
    getEmailSettings: builder.query<EmailSettings, void>({
      query: () => ({ url: "/settings/email", method: "GET" }),
      providesTags: ["EmailSettings"],
    }),
    updateEmailSettings: builder.mutation<EmailSettings, EmailSettingsPayload>({
      query: (body) => ({ url: "/settings/email", method: "PATCH", body }),
      invalidatesTags: ["EmailSettings"],
    }),
    testEmailConnection: builder.mutation<EmailTestResult, void>({
      query: () => ({ url: "/settings/email/test-connection", method: "POST" }),
      invalidatesTags: ["EmailSettings"],
    }),
    sendTestEmail: builder.mutation<EmailTestResult, { recipient: string }>({
      query: (body) => ({ url: "/settings/email/test-send", method: "POST", body }),
      invalidatesTags: ["EmailSettings", "Emails"],
    }),
    disconnectEmailServer: builder.mutation<EmailSettings, void>({
      query: () => ({ url: "/settings/email/disconnect", method: "POST" }),
      invalidatesTags: ["EmailSettings"],
    }),
  }),
});

export const {
  useGetEmailProvidersQuery,
  useGetEmailSettingsQuery,
  useUpdateEmailSettingsMutation,
  useTestEmailConnectionMutation,
  useSendTestEmailMutation,
  useDisconnectEmailServerMutation,
} = emailSettingsApi;
