CREATE TABLE IF NOT EXISTS ai_audit_actions (
    id BIGSERIAL PRIMARY KEY,
    audit_id BIGINT NOT NULL REFERENCES ai_audit_logs(id),
    tenant_id VARCHAR(36) NOT NULL,
    resource_name VARCHAR(100) NOT NULL,
    recommended_action VARCHAR(30) NOT NULL,
    recommended_instance_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'QUEUED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_actions_tenant_id_created_at
    ON ai_audit_actions (tenant_id, created_at DESC);
