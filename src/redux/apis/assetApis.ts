import type { Pagination } from "@/types";
import type {
  Asset,
  AssetAssignment,
  AssetAssignmentListQuery,
  AssetAssignmentSummary,
  AssetCategory,
  AssetCategoryListQuery,
  AssetCategoryPayload,
  AssetHolderOption,
  AssetListQuery,
  AssetMaintenance,
  AssetMaintenanceListQuery,
  AssetMaintenanceSummary,
  AssetOverview,
  AssetPayload,
  AssetSummary,
  AssignAssetPayload,
  MaintenancePayload,
  ReturnAssetPayload,
} from "@/types/domain/asset";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ListResult<T> {
  data: T[];
  meta: Pagination;
}

const ASSET_TAGS = [
  "Assets",
  "AssetSummary",
  "AssetOverview",
  "AssetAssignments",
  "AssetAssignmentSummary",
  "MyAssetAssignments",
  "AssetHolders",
] as const;

const CATEGORY_TAGS = ["AssetCategories", "AssetSummary", "AssetOverview"] as const;

const MAINTENANCE_TAGS = [
  "AssetMaintenance",
  "AssetMaintenanceSummary",
  "AssetOverview",
  "Assets",
] as const;

const assetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query<ListResult<Asset>, AssetListQuery | void>({
      query: (params) => ({
        url: `/hrms/assets${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["Assets"],
    }),
    getAsset: builder.query<Asset, string>({
      query: (id) => ({ url: `/hrms/assets/${id}`, method: "GET" }),
      providesTags: ["Assets"],
    }),
    getAssetSummary: builder.query<AssetSummary, void>({
      query: () => ({ url: "/hrms/assets/summary", method: "GET" }),
      providesTags: ["AssetSummary"],
    }),
    getAssetOverview: builder.query<AssetOverview, void>({
      query: () => ({ url: "/hrms/assets/overview", method: "GET" }),
      providesTags: ["AssetOverview"],
    }),
    getAssetHolders: builder.query<AssetHolderOption[], void>({
      query: () => ({ url: "/hrms/assets/holders", method: "GET" }),
      providesTags: ["AssetHolders"],
    }),
    createAsset: builder.mutation<Asset, AssetPayload>({
      query: (body) => ({ url: "/hrms/assets", method: "POST", body }),
      invalidatesTags: [...ASSET_TAGS],
    }),
    updateAsset: builder.mutation<Asset, { id: string; body: Partial<AssetPayload> }>({
      query: ({ id, body }) => ({ url: `/hrms/assets/${id}`, method: "PATCH", body }),
      invalidatesTags: [...ASSET_TAGS],
    }),
    deleteAsset: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/assets/${id}`, method: "DELETE" }),
      invalidatesTags: [...ASSET_TAGS],
    }),
    assignAsset: builder.mutation<Asset, { id: string; body: AssignAssetPayload }>({
      query: ({ id, body }) => ({ url: `/hrms/assets/${id}/assign`, method: "POST", body }),
      invalidatesTags: [...ASSET_TAGS],
    }),
    returnAsset: builder.mutation<Asset, { id: string; body: ReturnAssetPayload }>({
      query: ({ id, body }) => ({ url: `/hrms/assets/${id}/return`, method: "POST", body }),
      invalidatesTags: [...ASSET_TAGS],
    }),

    getAssetCategories: builder.query<ListResult<AssetCategory>, AssetCategoryListQuery | void>({
      query: (params) => ({
        url: `/hrms/asset-categories${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["AssetCategories"],
    }),
    createAssetCategory: builder.mutation<AssetCategory, AssetCategoryPayload>({
      query: (body) => ({ url: "/hrms/asset-categories", method: "POST", body }),
      invalidatesTags: [...CATEGORY_TAGS],
    }),
    updateAssetCategory: builder.mutation<
      AssetCategory,
      { id: string; body: Partial<AssetCategoryPayload> }
    >({
      query: ({ id, body }) => ({ url: `/hrms/asset-categories/${id}`, method: "PATCH", body }),
      invalidatesTags: [...CATEGORY_TAGS],
    }),
    deleteAssetCategory: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/asset-categories/${id}`, method: "DELETE" }),
      invalidatesTags: [...CATEGORY_TAGS],
    }),

    getAssetAssignments: builder.query<
      ListResult<AssetAssignment>,
      AssetAssignmentListQuery | void
    >({
      query: (params) => ({
        url: `/hrms/asset-assignments${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["AssetAssignments"],
    }),
    getMyAssetAssignments: builder.query<
      ListResult<AssetAssignment>,
      AssetAssignmentListQuery | void
    >({
      query: (params) => ({
        url: `/hrms/asset-assignments/mine${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["MyAssetAssignments"],
    }),
    getAssetAssignmentSummary: builder.query<AssetAssignmentSummary, void>({
      query: () => ({ url: "/hrms/asset-assignments/summary", method: "GET" }),
      providesTags: ["AssetAssignmentSummary"],
    }),

    getAssetMaintenance: builder.query<
      ListResult<AssetMaintenance>,
      AssetMaintenanceListQuery | void
    >({
      query: (params) => ({
        url: `/hrms/asset-maintenance${buildQuery({ ...(params ?? {}) })}`,
        method: "GET",
      }),
      providesTags: ["AssetMaintenance"],
    }),
    getAssetMaintenanceSummary: builder.query<AssetMaintenanceSummary, void>({
      query: () => ({ url: "/hrms/asset-maintenance/summary", method: "GET" }),
      providesTags: ["AssetMaintenanceSummary"],
    }),
    createMaintenance: builder.mutation<AssetMaintenance, MaintenancePayload>({
      query: (body) => ({ url: "/hrms/asset-maintenance", method: "POST", body }),
      invalidatesTags: [...MAINTENANCE_TAGS],
    }),
    updateMaintenance: builder.mutation<
      AssetMaintenance,
      { id: string; body: Partial<Omit<MaintenancePayload, "assetId">> }
    >({
      query: ({ id, body }) => ({ url: `/hrms/asset-maintenance/${id}`, method: "PATCH", body }),
      invalidatesTags: [...MAINTENANCE_TAGS],
    }),
    deleteMaintenance: builder.mutation<null, string>({
      query: (id) => ({ url: `/hrms/asset-maintenance/${id}`, method: "DELETE" }),
      invalidatesTags: [...MAINTENANCE_TAGS],
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssetQuery,
  useGetAssetSummaryQuery,
  useGetAssetOverviewQuery,
  useGetAssetHoldersQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useAssignAssetMutation,
  useReturnAssetMutation,
  useGetAssetCategoriesQuery,
  useCreateAssetCategoryMutation,
  useUpdateAssetCategoryMutation,
  useDeleteAssetCategoryMutation,
  useGetAssetAssignmentsQuery,
  useGetMyAssetAssignmentsQuery,
  useGetAssetAssignmentSummaryQuery,
  useGetAssetMaintenanceQuery,
  useGetAssetMaintenanceSummaryQuery,
  useCreateMaintenanceMutation,
  useUpdateMaintenanceMutation,
  useDeleteMaintenanceMutation,
} = assetApi;
