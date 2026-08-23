CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_cloud_resources_tenant_id
    ON cloud_resources (tenant_id);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_resource_id_recorded_at
    ON usage_metrics (resource_id, recorded_at DESC);
