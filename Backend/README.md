## Supabase handy commands:

1. `supabase migration new <name>` - create a new migration file

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
