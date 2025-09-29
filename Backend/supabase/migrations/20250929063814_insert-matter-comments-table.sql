CREATE TABLE matter_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matter_comments_matter_id
    ON matter_comments (matter_id);

CREATE INDEX IF NOT EXISTS idx_matter_comments_author_id
    ON matter_comments (author_id);