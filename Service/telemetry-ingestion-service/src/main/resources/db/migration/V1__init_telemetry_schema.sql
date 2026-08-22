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

INSERT INTO tenants (id, name)
VALUES
    ('b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'Acme Corp'),
    ('7c5e73b6-60b3-42ba-81de-9a6b9148f7ab', 'Stark Industries')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cloud_resources (id, tenant_id, resource_name, resource_type, instance_type, hourly_cost, status)
VALUES
    ('4aa03bb6-53d0-43aa-98cf-b0fab75b6151', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-api-prod-01', 'EC2', 'm6i.large', 0.1920, 'ACTIVE'),
    ('c4b84620-faed-4a43-ad36-18ad89d6d35d', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-idle-analytics-02', 'EC2', 'r6i.xlarge', 0.2520, 'ACTIVE'),
    ('f4a48dfe-a5d1-4280-9d52-a0916f8f8054', '7c5e73b6-60b3-42ba-81de-9a6b9148f7ab', 'stark-payments-prod-03', 'EKS', 'c6i.2xlarge', 0.3400, 'ACTIVE'),
    ('0a3fe15b-1bcf-43eb-a68b-4fc7f131f347', '7c5e73b6-60b3-42ba-81de-9a6b9148f7ab', 'stark-waste-sandbox-01', 'EC2', 't3.large', 0.0832, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
