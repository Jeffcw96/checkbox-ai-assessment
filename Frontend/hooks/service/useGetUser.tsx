import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../../lib/axios";

export interface User {
  id: string;
  email: string;
  picture?: string;
  name: string;
}

export const USER_QUERY_KEY: QueryKey = ["user"];

async function fetchUser(): Promise<User> {
  const res = await api.get<User>("/user");
  return res.data;
}

export function useGetUser(
  options?: Omit<
    UseQueryOptions<User, AxiosError, User, QueryKey>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<User, AxiosError>({
    queryKey: USER_QUERY_KEY,
    queryFn: fetchUser,
    ...options,
  });
}
