$ErrorActionPreference = "Stop"

$platformName = "FinPulse AI Access Seed"
$tenantName = "Acme Corp"
$demoEmail = "admin@acme.com"
$demoPassword = "Admin@123"
$userId = "16f6f8fd-7c93-4fae-a30f-58ba5bbef261"
$tenantId = "b6db5dcc-0dc4-41d7-b12d-cf83aa5f0ae1"
$passwordHash = '$2a$10$HB.PCiaJP8MuLe7yTmQXvOQosWk15oabKOkCw7Kd5GS1l8OaCXFL6'
$postgresContainer = "finops-core-postgres"
$postgresDatabase = "finpulse_core"
$postgresUser = "finops_user"

$seedSql = @"
INSERT INTO tenants (id, name)
VALUES ('$tenantId', '$tenantName')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name;

INSERT INTO users (id, tenant_id, email, password_hash, role)
VALUES ('$userId', '$tenantId', '$demoEmail', '$passwordHash', 'ADMIN')
ON CONFLICT (email) DO UPDATE
SET
    tenant_id = EXCLUDED.tenant_id,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;
"@

Write-Host ""
Write-Host $platformName -ForegroundColor Green
Write-Host ""
Write-Host "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Email: $demoEmail" -ForegroundColor Cyan
Write-Host "Password: $demoPassword" -ForegroundColor Cyan
Write-Host ""
Write-Host "Seeding login user into PostgreSQL container '$postgresContainer'..." -ForegroundColor Yellow

$seedSql | docker exec -i $postgresContainer psql -U $postgresUser -d $postgresDatabase

if ($LASTEXITCODE -ne 0) {
    throw "Failed to seed the login user into PostgreSQL."
}

Write-Host ""
Write-Host "User seed completed successfully." -ForegroundColor Green
