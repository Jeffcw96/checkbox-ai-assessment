import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../../lib/axios";

export interface Contract {
  id: string;
  title: string;
  description: string;
  status: "Draft" | "In Review" | "Done";
  createdAt: string;
  updatedAt: string;
  requester?: { id: string; name: string; image: string };
  assignee?: { id: string; name: string; image: string };
  rank?: number | null;
  version: number;
}

export const CONTRACT_QUERY_KEY: QueryKey = ["contracts"];

async function fetchContractById(contractId: string): Promise<Contract> {
  const res = await api.get<Contract>(`/contracts/${contractId}/contract`);
  return res.data;
}

export function useGetContractById(
  contractId: string,
  options?: Omit<
    UseQueryOptions<Contract, AxiosError, Contract, QueryKey>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<Contract, AxiosError>({
    queryKey: [...CONTRACT_QUERY_KEY, contractId],
    queryFn: () => fetchContractById(contractId),
    ...options,
  });
}
