# FinOps Core AI Service

This service is the primary user-facing backend for FinPulse AI. It handles authentication, dashboard analytics, resource listing, and AI-powered audit generation for tenant cloud spend optimization.

## Responsibilities

- Authenticate users and issue JWT access tokens
- Return dashboard summary cards and cost trends
- List active cloud resources for the authenticated tenant
- Trigger and store AI audit reports
- Query telemetry analytics from the telemetry service

## Stack

- Java 25
- Spring Boot 3.5
- Spring Security
- Spring Data JPA
- Flyway
- Spring AI
- PostgreSQL

## Default Port

- App: `8082`
- Local database host port in the root compose stack: `5433`

## Important Environment Variables

- `SERVER_PORT`: defaults to `8082`
- `DB_URL`: defaults to `jdbc:postgresql://localhost:5432/finpulse_core`
- `DB_USERNAME`: defaults to `postgres`
- `DB_PASSWORD`: defaults to `postgres`
- `JWT_SECRET`: JWT signing secret
- `JWT_ACCESS_TOKEN_MINUTES`: defaults to `120`
- `OPENAI_API_KEY`: required for live AI audit generation
- `OPENAI_MODEL`: defaults to `gpt-4o-mini`
- `OPENAI_TEMPERATURE`: defaults to `0.2`
- `TELEMETRY_SERVICE_BASE_URL`: defaults to `http://localhost:8081`

## Main API Endpoints

- `POST /api/v1/auth/login`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/trends`
- `GET /api/v1/resources`
- `POST /api/v1/ai/audit`
- `GET /api/v1/ai/audit/history`
- `GET /api/internal/resources/active`
- `GET /api/internal/resources/{resourceId}`

## Swagger

- `http://localhost:8082/swagger-ui.html`

## Local Run With Docker

From this directory:

```powershell
docker compose up -d
```

This starts:

- `postgres:18-alpine`
- `finops-core-ai-service`

The service compose file exposes PostgreSQL on host port `5433`.

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
java -jar target/finops-core-ai-service-1.0.0.jar
```

## Demo Login

The repository root includes `start-finpulse.ps1`, which seeds the demo user into the FinOps database.

- Email: `admin@acme.com`
- Password: `Admin@123`

## Notes

- Most user-facing endpoints require a Bearer token.
- CORS is configured for `http://localhost:5173`.
- The AI audit feature depends on a valid OpenAI API key.
