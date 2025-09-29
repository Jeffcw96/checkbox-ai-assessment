import { defineConfig } from "drizzle-kit";

declare const process: { env: { [key: string]: string | undefined } }; // Temporary put this to avoid TS weird error . . .

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  strict: true,
  verbose: true,
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL!,
  },
});
