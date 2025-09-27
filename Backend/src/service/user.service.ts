import { db } from "../utils/database";

export const getUserByEmailService = async (email: string) => {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  return { data };
};
