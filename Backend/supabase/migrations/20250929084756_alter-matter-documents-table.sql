ALTER TABLE "public"."matter_documents"
ADD COLUMN document_id TEXT NOT NULL;

CREATE INDEX IF NOT EXISTS idx_matter_documents_document_id
    ON matter_documents (document_id);