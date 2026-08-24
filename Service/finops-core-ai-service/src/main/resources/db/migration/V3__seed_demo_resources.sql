INSERT INTO tenants (id, name)
VALUES ('b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'Acme Corp')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name;

INSERT INTO cloud_resources (
    id,
    tenant_id,
    resource_name,
    resource_type,
    instance_type,
    hourly_cost,
    status
)
VALUES
    ('4aa03bb6-53d0-43aa-98cf-b0fab75b6151', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-api-prod-01', 'EC2', 'm5.2xlarge', 0.4600, 'ACTIVE'),
    ('8fd2d977-4ea7-44c6-b0f0-59535a58f59d', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-batch-idle-02', 'EC2', 'm5.xlarge', 0.2400, 'ACTIVE'),
    ('d3df2ba4-097f-4f84-af49-e6af72f80bc3', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-analytics-cache', 'Redis', 'cache.r6g.large', 0.1900, 'ACTIVE'),
    ('e5d84541-b7ef-4bb4-8df7-d17f9cc77d83', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-dev-waste-kafka', 'MSK', 'kafka.m5.large', 0.3300, 'ACTIVE'),
    ('74b3c3af-8fcd-498a-ae2f-1afe7509e0a5', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-orders-db', 'RDS', 'db.r6g.xlarge', 0.5800, 'ACTIVE'),
    ('fd4c93f9-f00f-47da-b2d6-14fd0f0b38e3', 'b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1', 'acme-reporting-api', 'EC2', 'c6i.xlarge', 0.2720, 'ACTIVE')
ON CONFLICT (id) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    resource_name = EXCLUDED.resource_name,
    resource_type = EXCLUDED.resource_type,
    instance_type = EXCLUDED.instance_type,
    hourly_cost = EXCLUDED.hourly_cost,
    status = EXCLUDED.status;
