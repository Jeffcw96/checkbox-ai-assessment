import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";

export const getUserByEmail = async (email: string) => {
  const data = await db.select().from(users).where(eq(users.email, email));
  return { data };
};

export const getUsers = async () => {
  const data = await db.select().from(users);
  return { data };
};

export const createUser = async (email: string, name: string) => {
  const [user] = await db.insert(users).values({ email, name }).returning();
  return { data: user };
};
