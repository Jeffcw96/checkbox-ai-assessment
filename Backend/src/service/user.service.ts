import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";

export const getUserByEmailService = async (email: string) => {
  const data = await db.select().from(users).where(eq(users.email, email));
  return { data };
};
