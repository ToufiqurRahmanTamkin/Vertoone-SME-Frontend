import type {
  AttendanceSettings,
  HrmsSettings,
  HrmsSettingsSummary,
  LateFineSettings,
  LeaveSettings,
  OvertimeSettings,
  PayrollSettings,
  ProvidentFundSettings,
  WeekSettings,
} from "@/types/domain/hrmsSettings";
import { baseApi } from "../baseApi";

const SETTINGS_TAGS = ["HrmsSettings", "HrmsSettingsSummary"] as const;

const hrmsSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHrmsSettings: builder.query<HrmsSettings, void>({
      query: () => ({ url: "/hrms/settings", method: "GET" }),
      providesTags: ["HrmsSettings"],
    }),
    getHrmsSettingsSummary: builder.query<HrmsSettingsSummary, void>({
      query: () => ({ url: "/hrms/settings/summary", method: "GET" }),
      providesTags: ["HrmsSettingsSummary"],
    }),
    updateWeekSettings: builder.mutation<HrmsSettings, Partial<WeekSettings>>({
      query: (body) => ({ url: "/hrms/settings/week", method: "PATCH", body }),
      invalidatesTags: [...SETTINGS_TAGS],
    }),
    updateLeaveSettings: builder.mutation<HrmsSettings, Partial<LeaveSettings>>({
      query: (body) => ({ url: "/hrms/settings/leave", method: "PATCH", body }),
      invalidatesTags: [...SETTINGS_TAGS],
    }),
    updateAttendanceSettings: builder.mutation<HrmsSettings, Partial<AttendanceSettings>>({
      query: (body) => ({ url: "/hrms/settings/attendance", method: "PATCH", body }),
      invalidatesTags: [...SETTINGS_TAGS],
    }),
    updateLateFineSettings: builder.mutation<HrmsSettings, Partial<LateFineSettings>>({
      query: (body) => ({ url: "/hrms/settings/late-fine", method: "PATCH", body }),
      invalidatesTags: [...SETTINGS_TAGS],
    }),
    updateOvertimeSettings: builder.mutation<HrmsSettings, Partial<OvertimeSettings>>({
      query: (body) => ({ url: "/hrms/settings/overtime", method: "PATCH", body }),
      invalidatesTags: [...SETTINGS_TAGS],
    }),
    updatePayrollSettings: builder.mutation<HrmsSettings, Partial<PayrollSettings>>({
      query: (body) => ({ url: "/hrms/settings/payroll", method: "PATCH", body }),
      invalidatesTags: [...SETTINGS_TAGS],
    }),
    updateProvidentFundSettings: builder.mutation<
      HrmsSettings,
      Partial<ProvidentFundSettings>
    >({
      query: (body) => ({ url: "/hrms/settings/provident-fund", method: "PATCH", body }),
      invalidatesTags: [...SETTINGS_TAGS],
    }),
  }),
});

export const {
  useGetHrmsSettingsQuery,
  useGetHrmsSettingsSummaryQuery,
  useUpdateWeekSettingsMutation,
  useUpdateLeaveSettingsMutation,
  useUpdateAttendanceSettingsMutation,
  useUpdateLateFineSettingsMutation,
  useUpdateOvertimeSettingsMutation,
  useUpdatePayrollSettingsMutation,
  useUpdateProvidentFundSettingsMutation,
} = hrmsSettingsApi;
