# Telemetry Ingestion Service

This service powers the telemetry side of FinPulse AI. It generates and stores resource metrics, exposes recent telemetry for dashboards and demos, and provides internal analytics consumed by the FinOps Core AI service.

## Responsibilities

- Generate simulated telemetry for active cloud resources
- Ingest custom telemetry metrics
- Inject anomalies for demos and testing
- Return health summaries and recent telemetry history
- Provide internal underutilization and cost-trend analytics

## Stack

- Java 25
- Spring Boot 3.5
- Spring Data JPA
- Flyway
- PostgreSQL

## Default Port

- App: `8081`
- Local database host port in the root compose stack: `5432`

## Important Environment Variables

- `SERVER_PORT`: defaults to `8081`
- `DB_URL`: defaults to `jdbc:postgresql://localhost:5432/telemetry_db`
- `DB_USERNAME`: defaults to `telemetry_user`
- `DB_PASSWORD`: defaults to `telemetry_password`
- `CORE_SERVICE_BASE_URL`: defaults to `http://localhost:8082`

## Main API Endpoints

- `POST /api/v1/telemetry/generate`
- `POST /api/v1/telemetry/ingest`
- `POST /api/v1/telemetry/inject-anomaly`
- `GET /api/v1/telemetry/health-metrics`
- `GET /api/v1/telemetry/resource/{resourceId}/recent`

Internal analytics endpoints used by the FinOps service:

- `GET /api/v1/telemetry/internal/analytics/tenants/{tenantId}/underutilized`
- `GET /api/v1/telemetry/internal/analytics/tenants/{tenantId}/cost-trends`

## Swagger

- `http://localhost:8081/swagger-ui.html`

## Local Run With Docker

From this directory:

```powershell
docker compose up -d
```

This starts:

- `postgres:18-alpine`
- `telemetry-ingestion-service`

If you are upgrading from older PostgreSQL volumes and the database becomes unhealthy, recreate the volume:

```powershell
docker compose down -v
docker compose up -d
```

PostgreSQL 18 in this repo uses the `/var/lib/postgresql` volume mount layout.

## Local Run Without Docker

Start a PostgreSQL database and configure the environment variables, then run:

```powershell
.\mvnw spring-boot:run
```

Or build the jar:

```powershell
.\mvnw clean package
java -jar target/telemetry-ingestion-service-1.0.0.jar
```

## Notes

- This service is designed to work alongside the FinOps Core AI service.
- The internal analytics endpoints are intended for service-to-service use.
