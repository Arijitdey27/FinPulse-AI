CREATE TABLE IF NOT EXISTS ai_audit_dismissals (
    id BIGSERIAL PRIMARY KEY,
    audit_id BIGINT NOT NULL REFERENCES ai_audit_logs(id),
    tenant_id VARCHAR(36) NOT NULL,
    resource_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ai_audit_dismissals_audit_tenant_resource
        UNIQUE (audit_id, tenant_id, resource_name)
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_dismissals_tenant_audit
    ON ai_audit_dismissals (tenant_id, audit_id);
