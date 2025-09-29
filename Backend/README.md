## TODO:

1. Handle status update event
2. Handle comment added event
3. Cache get matters listing and matter details in Redis

## Supabase handy commands:

1. `supabase migration new <name>` - create a new migration file

## Drizzle ORM

Setup steps:

1. Install deps: npm i drizzle-orm drizzle-kit postgres
2. Add env SUPABASE_DB_URL=postgres://user:pass@localhost:54322/database
3. Schema defined at: src/db/schema/index.ts
4. Config: drizzle.config.ts
5. Generate migration (from schema changes):
   npx drizzle-kit generate
6. Apply migrations (local):
   npx drizzle-kit push
   (or run SQL files under ./drizzle/migrations manually)
7. Introspect (if starting from existing DB instead of hand schema):
   npx drizzle-kit introspect
8. Use client:
   import { db } from "./src/db/client";
   await db.select().from(matters);

Transition plan:

- Keep Supabase JS client for auth/storage.
- Gradually replace RPC + postgrest calls with Drizzle queries/transactions.
- Remove legacy RPC (insert_contract) after Drizzle path stable.

Idempotency pattern:

- Insert webhook_events first (unique event_id) inside a transaction, skip if exists.

## Drizzle -> Supabase migration workflow

1. Set env:
   Local Supabase (Docker): SUPABASE_DB_URL=postgres://postgres:postgres@localhost:54322/postgres
   Hosted Supabase: Use service_role connection string from Project Settings > Database > Connection string (URI). Example:
   export SUPABASE_DB_URL='postgres://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres'

2. Change schema in: src/db/schema/\*.ts

3. Generate migration (creates SQL under drizzle/migrations):
   npx drizzle-kit generate

4. Apply (push) directly to the target DB:
   npx drizzle-kit push
   (Uses SUPABASE_DB_URL; this executes only new migration files.)

## Schema:

```
-- Matters
CREATE TABLE matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rank NUMERIC(30,10),
  status TEXT NOT NULL,
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  requester_id UUID REFERENCES users(id),
  assignee_id UUID REFERENCES users(id)
);


-- Matters history table (for reporting)
CREATE TABLE matter_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_at TIMESTAMP DEFAULT now()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Webhook events (idempotency tracking)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMP DEFAULT now()
);
```

## Production-grade Architecture ideas

1. Able to replay
2. Able to deduped & idempotent
3. Able to audit trace (when a card was changed from webhook or dashboard)
4. Able to retry SQS
