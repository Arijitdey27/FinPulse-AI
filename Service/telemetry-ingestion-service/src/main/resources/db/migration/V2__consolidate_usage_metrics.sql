ALTER TABLE usage_metrics ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36);
ALTER TABLE usage_metrics ADD COLUMN IF NOT EXISTS resource_name VARCHAR(100);
ALTER TABLE usage_metrics ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50);
ALTER TABLE usage_metrics ADD COLUMN IF NOT EXISTS instance_type VARCHAR(50);
ALTER TABLE usage_metrics ADD COLUMN IF NOT EXISTS hourly_cost NUMERIC(10,4);
ALTER TABLE usage_metrics ADD COLUMN IF NOT EXISTS resource_status VARCHAR(20) DEFAULT 'ACTIVE';

UPDATE usage_metrics um
SET tenant_id = cr.tenant_id,
    resource_name = cr.resource_name,
    resource_type = cr.resource_type,
    instance_type = cr.instance_type,
    hourly_cost = cr.hourly_cost,
    resource_status = cr.status
FROM cloud_resources cr
WHERE um.resource_id = cr.id
  AND (um.tenant_id IS NULL
       OR um.resource_name IS NULL
       OR um.resource_type IS NULL
       OR um.instance_type IS NULL
       OR um.hourly_cost IS NULL
       OR um.resource_status IS NULL);

ALTER TABLE usage_metrics ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE usage_metrics ALTER COLUMN resource_name SET NOT NULL;
ALTER TABLE usage_metrics ALTER COLUMN resource_type SET NOT NULL;
ALTER TABLE usage_metrics ALTER COLUMN instance_type SET NOT NULL;
ALTER TABLE usage_metrics ALTER COLUMN hourly_cost SET NOT NULL;
ALTER TABLE usage_metrics ALTER COLUMN resource_status SET NOT NULL;

ALTER TABLE usage_metrics DROP CONSTRAINT IF EXISTS usage_metrics_resource_id_fkey;

CREATE INDEX IF NOT EXISTS idx_usage_metrics_tenant_id_recorded_at
    ON usage_metrics (tenant_id, recorded_at DESC);

DROP TABLE IF EXISTS cloud_resources;
DROP TABLE IF EXISTS tenants;
