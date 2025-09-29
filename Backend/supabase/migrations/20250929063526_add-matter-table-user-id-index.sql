CREATE INDEX IF NOT EXISTS idx_matters_requester_id
  ON matters (requester_id);

CREATE INDEX IF NOT EXISTS idx_matters_assignee_id
  ON matters (assignee_id);
