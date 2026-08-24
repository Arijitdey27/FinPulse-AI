ALTER TABLE ai_audit_logs
    ADD COLUMN IF NOT EXISTS recommendations_json TEXT;
