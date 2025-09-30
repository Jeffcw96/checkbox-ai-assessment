import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../../lib/axios";

export interface Report {
  totalContracts: number;
  contractsByStatus: { status: string; count: number }[];
  averageStatusCycleTime: {
    status: string;
    averageDurationSeconds: number;
    averageDurationLabel: string;
  }[];
}

export const REPORT_QUERY_KEY: QueryKey = ["report"];

async function fetchReport(): Promise<Report> {
  const res = await api.get<Report>("/report");
  return res.data;
}

export function useGetReport(
  options?: Omit<
    UseQueryOptions<Report, AxiosError, Report, QueryKey>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<Report, AxiosError>({
    queryKey: REPORT_QUERY_KEY,
    queryFn: fetchReport,
    ...options,
  });
}
