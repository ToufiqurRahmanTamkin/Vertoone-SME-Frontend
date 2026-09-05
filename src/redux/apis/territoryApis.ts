import type { Pagination } from "@/types";
import type {
  Territory,
  TerritoryListQuery,
  TerritoryOptionQuery,
  TerritoryPayload,
  TerritoryRef,
  TerritorySummary,
} from "@/types/domain/territory";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface TerritoryListResult {
  data: Territory[];
  meta: Pagination;
}

const TERRITORY_TAGS = ["Territories", "TerritorySummary", "TerritoryOptions"] as const;

const territoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTerritories: builder.query<TerritoryListResult, TerritoryListQuery | void>({
      query: (params) => ({
        url: `/crm/territories${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Territories"],
    }),
    getTerritoryOptions: builder.query<TerritoryRef[], TerritoryOptionQuery | void>({
      query: (params) => ({
        url: `/crm/territories/options${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["TerritoryOptions"],
    }),
    getTerritorySummary: builder.query<TerritorySummary, void>({
      query: () => ({ url: "/crm/territories/summary", method: "GET" }),
      providesTags: ["TerritorySummary"],
    }),
    getTerritory: builder.query<Territory, string>({
      query: (id) => ({ url: `/crm/territories/${id}`, method: "GET" }),
      providesTags: ["Territories"],
    }),
    createTerritory: builder.mutation<Territory, TerritoryPayload>({
      query: (body) => ({ url: "/crm/territories", method: "POST", body }),
      invalidatesTags: [...TERRITORY_TAGS],
    }),
    updateTerritory: builder.mutation<Territory, { id: string; body: Partial<TerritoryPayload> }>({
      query: ({ id, body }) => ({ url: `/crm/territories/${id}`, method: "PATCH", body }),
      invalidatesTags: [...TERRITORY_TAGS],
    }),
    deleteTerritory: builder.mutation<null, string>({
      query: (id) => ({ url: `/crm/territories/${id}`, method: "DELETE" }),
      invalidatesTags: [...TERRITORY_TAGS],
    }),
  }),
});

export const {
  useGetTerritoriesQuery,
  useGetTerritoryOptionsQuery,
  useGetTerritorySummaryQuery,
  useGetTerritoryQuery,
  useCreateTerritoryMutation,
  useUpdateTerritoryMutation,
  useDeleteTerritoryMutation,
} = territoryApi;
