# FinOps Core AI Service

The FinOps Core AI Service is the primary user-facing backend in FinPulse AI. It handles authentication, tenant dashboard analytics, resource inventory APIs, and AI-assisted optimization audits.

## Responsibilities

- authenticate users and issue JWT access tokens
- return dashboard KPI summaries and cost trends for the authenticated tenant
- list and filter active cloud resources
- generate AI audit reports and store audit history
- queue optimization actions from audit recommendations
- expose internal resource endpoints used by the telemetry service
- consume analytics from the telemetry service

## Stack

- Java 21
- Spring Boot 3.5
- Spring Security
- Spring Data JPA
- Flyway
- Spring AI
- springdoc OpenAPI
- PostgreSQL 18

## Ports

- App: `8082`
- Database host port in the service compose file: `5433`

## Key Environment Variables

- `SERVER_PORT` - defaults to `8082`
- `DB_URL` - defaults to `jdbc:postgresql://localhost:5433/finpulse_core`
- `DB_USERNAME` - defaults to `postgres`
- `DB_PASSWORD` - defaults to `postgres`
- `JWT_SECRET`
- `JWT_ACCESS_TOKEN_MINUTES` - defaults to `120`
- `TELEMETRY_SERVICE_BASE_URL` - defaults to `http://localhost:8081`
- `GROQ_API_KEY` or `OPENAI_API_KEY`
- `GROQ_BASE_URL` - defaults to `https://api.groq.com/openai`
- `GROQ_MODEL` - defaults to `openai/gpt-oss-20b`
- `GROQ_TEMPERATURE` - defaults to `0.2`

The application config uses OpenAI-compatible Spring AI settings and currently resolves `GROQ_*` first, then falls back to `OPENAI_*`.

## Main API Endpoints

Public API:

- `POST /api/v1/auth/login`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/trends?days=14`
- `GET /api/v1/resources?type=&search=`
- `POST /api/v1/ai/audit`
- `GET /api/v1/ai/audit/history`
- `POST /api/v1/ai/audit/{auditId}/actions`

Internal API:

- `GET /api/internal/resources/active`
- `GET /api/internal/resources/{resourceId}`
- `GET /api/internal/resources/{resourceId}/active`

Swagger UI:

- `http://localhost:8082/swagger-ui.html`

## Local Run With Docker

From this directory:

```powershell
docker compose up -d
```

This compose file starts:

- `postgres:18-alpine`
- `finops-core-ai-service`

The local service compose maps:

- PostgreSQL to host port `5433`
- the API to host port `8082`

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
java -jar target/finops-core-ai-service-1.0.0.jar
```

## AI Provider Notes

- The root project compose file is wired with `GROQ_*` variables by default.
- This service-level compose file currently passes `OPENAI_*` variables.
- The app supports both because the runtime config falls back from `GROQ_*` to `OPENAI_*`.

## Demo Login

The repository root script `start-finpulse.ps1` seeds the demo tenant and admin user into the core database.

- Email: `admin@acme.com`
- Password: `Admin@123`

## Development Notes

- Most public endpoints require a Bearer token.
- CORS is intended for the local frontend at `http://localhost:5173`.
- Flyway manages the schema under `src/main/resources/db/migration`.
- The telemetry integration base URL defaults to `http://localhost:8081`.
