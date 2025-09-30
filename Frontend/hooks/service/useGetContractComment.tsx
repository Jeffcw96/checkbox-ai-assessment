import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../../lib/axios";

export interface Comment {
  id: string;
  contractId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
}

export const COMMENT_QUERY_KEY: QueryKey = ["comments"];

async function fetchComments(contractId: string): Promise<Comment[]> {
  const res = await api.get<Comment[]>(`/contracts/${contractId}/comments`);
  return res.data;
}

export function useGetContractComments(
  contractId: string,
  options?: Omit<
    UseQueryOptions<Comment[], AxiosError, Comment[], QueryKey>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<Comment[], AxiosError>({
    queryKey: [...COMMENT_QUERY_KEY, contractId],
    queryFn: () => fetchComments(contractId),
    ...options,
  });
}
