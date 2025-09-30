import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error("SUPABASE_DB_URL / DATABASE_URL not set");
}
console.log("Connecting to database:", url);
const client = postgres(url, {
  max: 5,
  prepare: false,
});

export const db = drizzle(client, { schema });

// Optional helper for graceful shutdown
export async function closeDb() {
  await client.end({ timeout: 5 });
}
