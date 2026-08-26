import type {
  CustomerReport,
  FinanceReport,
  PlanReport,
  ReportDefinition,
  ReportRangeQuery,
  ReportSummary,
  RevenueReport,
  SecurityReport,
  SubscriptionReport,
} from "@/types/domain/report";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

const rangeUrl = (path: string, params: ReportRangeQuery | void): string =>
  `/reports/${path}${buildQuery((params ?? {}) as Record<string, unknown>)}`;

const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportCatalog: builder.query<ReportDefinition[], void>({
      query: () => ({ url: "/reports", method: "GET" }),
      providesTags: ["Reports"],
    }),
    getReportSummary: builder.query<ReportSummary, ReportRangeQuery | void>({
      query: (params) => ({ url: rangeUrl("summary", params), method: "GET" }),
      providesTags: ["Reports"],
    }),
    getRevenueReport: builder.query<RevenueReport, ReportRangeQuery | void>({
      query: (params) => ({ url: rangeUrl("revenue", params), method: "GET" }),
      providesTags: ["Reports"],
    }),
    getSubscriptionReport: builder.query<SubscriptionReport, ReportRangeQuery | void>({
      query: (params) => ({ url: rangeUrl("subscriptions", params), method: "GET" }),
      providesTags: ["Reports"],
    }),
    getPlanReport: builder.query<PlanReport, ReportRangeQuery | void>({
      query: (params) => ({ url: rangeUrl("plans", params), method: "GET" }),
      providesTags: ["Reports"],
    }),
    getFinanceReport: builder.query<FinanceReport, ReportRangeQuery | void>({
      query: (params) => ({ url: rangeUrl("finance", params), method: "GET" }),
      providesTags: ["Reports"],
    }),
    getCustomerReport: builder.query<CustomerReport, ReportRangeQuery | void>({
      query: (params) => ({ url: rangeUrl("customers", params), method: "GET" }),
      providesTags: ["Reports"],
    }),
    getSecurityReport: builder.query<SecurityReport, ReportRangeQuery | void>({
      query: (params) => ({ url: rangeUrl("security", params), method: "GET" }),
      providesTags: ["Reports"],
    }),
  }),
});

export const {
  useGetReportCatalogQuery,
  useGetReportSummaryQuery,
  useGetRevenueReportQuery,
  useGetSubscriptionReportQuery,
  useGetPlanReportQuery,
  useGetFinanceReportQuery,
  useGetCustomerReportQuery,
  useGetSecurityReportQuery,
} = reportApi;
