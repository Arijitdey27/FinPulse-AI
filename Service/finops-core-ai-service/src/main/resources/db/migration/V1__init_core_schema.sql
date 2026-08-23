CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cloud_resources (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id),
    resource_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    instance_type VARCHAR(50) NOT NULL,
    hourly_cost NUMERIC(10,4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS usage_metrics (
    id BIGSERIAL PRIMARY KEY,
    resource_id VARCHAR(36) NOT NULL REFERENCES cloud_resources(id),
    cpu_utilization_pct NUMERIC(5,2) NOT NULL,
    memory_utilization_pct NUMERIC(5,2) NOT NULL,
    storage_iops INT NOT NULL DEFAULT 0,
    recorded_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    total_potential_savings NUMERIC(10,2),
    audit_summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_cloud_resources_tenant_id ON cloud_resources (tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_resource_id_recorded_at ON usage_metrics (resource_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_tenant_id_created_at ON ai_audit_logs (tenant_id, created_at DESC);
