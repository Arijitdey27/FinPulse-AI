# Telemetry Ingestion Service

The Telemetry Ingestion Service powers the telemetry side of FinPulse AI. It generates and stores resource metrics, supports manual ingestion and anomaly simulation, and exposes analytics consumed by the FinOps Core AI Service.

## Responsibilities

- generate simulated telemetry for active cloud resources
- ingest custom telemetry metrics
- inject anomalies for demos and testing
- return telemetry health summaries
- return recent telemetry history for a given resource
- provide internal underutilization and cost-trend analytics for the core service

## Stack

- Java 25
- Spring Boot 3.5
- Spring Data JPA
- Flyway
- springdoc OpenAPI
- PostgreSQL 18

## Ports

- App: `8081`
- Database host port in the service compose file: `5432`

## Key Environment Variables

- `SERVER_PORT` - defaults to `8081`
- `DB_URL` - defaults to `jdbc:postgresql://localhost:5432/telemetry_db`
- `DB_USERNAME` - defaults to `telemetry_user`
- `DB_PASSWORD` - defaults to `telemetry_password`
- `CORE_SERVICE_BASE_URL` - defaults to `http://localhost:8082`
- `APP_CORS_ALLOWED_ORIGINS` - defaults to `http://localhost:5173`

## Main API Endpoints

Public API:

- `POST /api/v1/telemetry/generate`
- `POST /api/v1/telemetry/ingest`
- `POST /api/v1/telemetry/inject-anomaly`
- `GET /api/v1/telemetry/health-metrics`
- `GET /api/v1/telemetry/resource/{resourceId}/recent?page=0&size=10`

Internal analytics API:

- `GET /api/v1/telemetry/internal/analytics/tenants/{tenantId}/underutilized`
- `GET /api/v1/telemetry/internal/analytics/tenants/{tenantId}/cost-trends`

Swagger UI:

- `http://localhost:8081/swagger-ui.html`

## Local Run With Docker

From this directory:

```powershell
docker compose up -d
```

This compose file starts:

- `postgres:18-alpine`
- `telemetry-ingestion-service`

The local service compose maps:

- PostgreSQL to host port `5432`
- the API to host port `8081`

If old database volumes cause startup failures, recreate them:

```powershell
docker compose down -v
docker compose up -d
```

## Local Run Without Docker

Start PostgreSQL first, configure the environment variables, then run:

```powershell
.\mvnw spring-boot:run
```

Or build the jar:

```powershell
.\mvnw clean package
java -jar target/telemetry-ingestion-service-1.0.0.jar
```

## Development Notes

- This service is intended to run alongside the FinOps Core AI Service.
- The internal analytics endpoints are hidden from Swagger and meant for service-to-service use.
- Flyway manages the schema under `src/main/resources/db/migration`.
- The core service base URL defaults to `http://localhost:8082`.
