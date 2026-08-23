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

INSERT INTO tenants (id, name)
VALUES
    ('b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'Acme Corp'),
    ('7c5e73b6-60b3-42ba-81de-9a6b9148f7ab', 'Globex Manufacturing')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, tenant_id, email, password_hash, role)
VALUES
    ('16f6f8fd-7c93-4fae-a30f-58ba5bbef261', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'admin@acme.com', '$2a$10$HB.PCiaJP8MuLe7yTmQXvOQosWk15oabKOkCw7Kd5GS1l8OaCXFL6', 'ADMIN')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cloud_resources (id, tenant_id, resource_name, resource_type, instance_type, hourly_cost, status)
VALUES
    ('4aa03bb6-53d0-43aa-98cf-b0fab75b6151', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-api-prod-01', 'EC2', 'm6i.large', 0.1920, 'ACTIVE'),
    ('c4b84620-faed-4a43-ad36-18ad89d6d35d', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-idle-analytics-02', 'EC2', 'r6i.xlarge', 0.2520, 'ACTIVE'),
    ('f9f4a5d2-ecf5-4423-9780-6f57d43f9754', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-batch-optimizer-03', 'RDS', 'db.r6g.large', 0.3120, 'ACTIVE'),
    ('0a3fe15b-1bcf-43eb-a68b-4fc7f131f347', '7c5e73b6-60b3-42ba-81de-9a6b9148f7ab', 'globex-sandbox-01', 'EC2', 't3.large', 0.0832, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO usage_metrics (resource_id, cpu_utilization_pct, memory_utilization_pct, storage_iops, recorded_at)
VALUES
    ('4aa03bb6-53d0-43aa-98cf-b0fab75b6151', 42.10, 58.00, 330, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('4aa03bb6-53d0-43aa-98cf-b0fab75b6151', 39.80, 54.20, 320, CURRENT_TIMESTAMP - INTERVAL '4 days'),
    ('4aa03bb6-53d0-43aa-98cf-b0fab75b6151', 45.90, 60.80, 345, CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('4aa03bb6-53d0-43aa-98cf-b0fab75b6151', 48.50, 63.40, 360, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('4aa03bb6-53d0-43aa-98cf-b0fab75b6151', 44.20, 59.10, 350, CURRENT_TIMESTAMP - INTERVAL '1 day'),

    ('c4b84620-faed-4a43-ad36-18ad89d6d35d', 3.90, 11.20, 35, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('c4b84620-faed-4a43-ad36-18ad89d6d35d', 4.40, 12.10, 33, CURRENT_TIMESTAMP - INTERVAL '4 days'),
    ('c4b84620-faed-4a43-ad36-18ad89d6d35d', 5.10, 13.00, 34, CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('c4b84620-faed-4a43-ad36-18ad89d6d35d', 4.20, 11.80, 31, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('c4b84620-faed-4a43-ad36-18ad89d6d35d', 3.70, 10.90, 30, CURRENT_TIMESTAMP - INTERVAL '1 day'),

    ('f9f4a5d2-ecf5-4423-9780-6f57d43f9754', 8.60, 14.10, 90, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('f9f4a5d2-ecf5-4423-9780-6f57d43f9754', 9.10, 14.60, 86, CURRENT_TIMESTAMP - INTERVAL '4 days'),
    ('f9f4a5d2-ecf5-4423-9780-6f57d43f9754', 8.20, 13.80, 88, CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('f9f4a5d2-ecf5-4423-9780-6f57d43f9754', 8.90, 14.30, 89, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('f9f4a5d2-ecf5-4423-9780-6f57d43f9754', 8.40, 14.00, 91, CURRENT_TIMESTAMP - INTERVAL '1 day'),

    ('0a3fe15b-1bcf-43eb-a68b-4fc7f131f347', 17.40, 24.20, 110, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('0a3fe15b-1bcf-43eb-a68b-4fc7f131f347', 19.60, 27.10, 108, CURRENT_TIMESTAMP - INTERVAL '1 day');
