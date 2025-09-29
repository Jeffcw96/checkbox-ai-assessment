import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  throw new Error("SUPABASE_DB_URL not set");
}

const client = postgres(url, {
  max: 5,
  prepare: false,
});

export const db = drizzle(client, { schema });

// Optional helper for graceful shutdown
export async function closeDb() {
  await client.end({ timeout: 5 });
}
