import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../../lib/axios";

export interface Document {
  id: string;
  contractId: string;
  documentId: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
}

export const DOCUMENT_QUERY_KEY: QueryKey = ["documents"];

async function fetchDocuments(contractId: string): Promise<Document[]> {
  const res = await api.get<Document[]>(`/contracts/${contractId}/documents`);
  return res.data;
}

export function useGetContractDocuments(
  contractId: string,
  options?: Omit<
    UseQueryOptions<Document[], AxiosError, Document[], QueryKey>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<Document[], AxiosError>({
    queryKey: [...DOCUMENT_QUERY_KEY, contractId],
    queryFn: () => fetchDocuments(contractId),
    ...options,
  });
}
