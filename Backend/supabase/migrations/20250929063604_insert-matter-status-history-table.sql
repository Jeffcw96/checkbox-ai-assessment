CREATE TABLE matter_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matter_status_history_matter_id
    ON matter_status_history (matter_id);