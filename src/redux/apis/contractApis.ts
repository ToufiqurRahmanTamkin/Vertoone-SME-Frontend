import type { Pagination } from "@/types";
import type {
  Contract,
  ContractListQuery,
  ContractPayload,
  ContractSummary,
  ContractUpdatePayload,
  PublicContractView,
  SignContractPayload,
} from "@/types/domain/contract";
import { baseApi } from "../baseApi";
import { buildQuery } from "./queryString";

interface ContractListResult {
  data: Contract[];
  meta: Pagination;
}

const CONTRACT_TAGS = ["Contracts", "ContractSummary", "DocumentsOverview"] as const;

const contractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContracts: builder.query<ContractListResult, ContractListQuery | void>({
      query: (params) => ({
        url: `/documents/contracts${buildQuery((params ?? {}) as Record<string, unknown>)}`,
        method: "GET",
      }),
      providesTags: ["Contracts"],
    }),
    getContractSummary: builder.query<ContractSummary, void>({
      query: () => ({ url: "/documents/contracts/summary", method: "GET" }),
      providesTags: ["ContractSummary"],
    }),
    getContract: builder.query<Contract, string>({
      query: (id) => ({ url: `/documents/contracts/${id}`, method: "GET" }),
      providesTags: ["Contracts"],
    }),
    createContract: builder.mutation<Contract, ContractPayload>({
      query: (body) => ({ url: "/documents/contracts", method: "POST", body }),
      invalidatesTags: [...CONTRACT_TAGS],
    }),
    updateContract: builder.mutation<Contract, { id: string; body: ContractUpdatePayload }>({
      query: ({ id, body }) => ({ url: `/documents/contracts/${id}`, method: "PATCH", body }),
      invalidatesTags: [...CONTRACT_TAGS],
    }),
    sendContract: builder.mutation<Contract, string>({
      query: (id) => ({ url: `/documents/contracts/${id}/send`, method: "POST" }),
      invalidatesTags: [...CONTRACT_TAGS],
    }),
    remindContractSigner: builder.mutation<Contract, { id: string; signerId: string }>({
      query: ({ id, signerId }) => ({
        url: `/documents/contracts/${id}/signers/${signerId}/remind`,
        method: "POST",
      }),
      invalidatesTags: ["Contracts"],
    }),
    cancelContract: builder.mutation<Contract, string>({
      query: (id) => ({ url: `/documents/contracts/${id}/cancel`, method: "POST" }),
      invalidatesTags: [...CONTRACT_TAGS],
    }),
    deleteContract: builder.mutation<null, string>({
      query: (id) => ({ url: `/documents/contracts/${id}`, method: "DELETE" }),
      invalidatesTags: [...CONTRACT_TAGS],
    }),

    getPublicContract: builder.query<PublicContractView, string>({
      query: (token) => ({ url: `/public/contracts/${token}`, method: "GET" }),
      providesTags: ["PublicContract"],
    }),
    signPublicContract: builder.mutation<
      { contractNumber: string; title: string; signedAt: string },
      { token: string; body: SignContractPayload }
    >({
      query: ({ token, body }) => ({
        url: `/public/contracts/${token}/sign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PublicContract"],
    }),
    declinePublicContract: builder.mutation<
      { contractNumber: string; title: string },
      { token: string; reason: string }
    >({
      query: ({ token, reason }) => ({
        url: `/public/contracts/${token}/decline`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["PublicContract"],
    }),
  }),
});

export const {
  useGetContractsQuery,
  useGetContractSummaryQuery,
  useGetContractQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useSendContractMutation,
  useRemindContractSignerMutation,
  useCancelContractMutation,
  useDeleteContractMutation,
  useGetPublicContractQuery,
  useSignPublicContractMutation,
  useDeclinePublicContractMutation,
} = contractApi;
