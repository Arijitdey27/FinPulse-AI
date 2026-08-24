# FinPulse AI

FinPulse AI is a local full-stack FinOps demo platform for monitoring cloud resource usage, reviewing spend trends, simulating telemetry, and generating AI-assisted optimization recommendations.

The repository contains:

- a React + Vite frontend dashboard
- a Spring Boot core API for auth, dashboards, resources, and AI audit flows
- a Spring Boot telemetry service for metric generation, ingestion, anomaly injection, and analytics
- two PostgreSQL databases orchestrated with Docker Compose

## Architecture

```text
Frontend (React/Vite, :5173)
    |
    v
FinOps Core API (Spring Boot, :8082)
    |
    +--> FinOps Postgres (:5433)
    |
    +--> Telemetry Service (Spring Boot, :8081)
             |
             +--> Telemetry Postgres (:5432)
```

## Repository Layout

- `Frontend/` - dashboard UI, auth flow, charts, telemetry view, and audit screens
- `Service/finops-core-ai-service/` - tenant-facing backend API and AI audit orchestration
- `Service/telemetry-ingestion-service/` - telemetry simulation, ingestion, and analytics backend
- `docker-compose.yml` - full local stack for both services and both databases
- `start-finpulse.ps1` - seeds the demo tenant and admin login into the core database

## Current Stack

- Frontend: React 18, React Router 7, Vite 8, Tailwind CSS 3, Axios, Recharts, Lucide
- Backend: Java 25, Spring Boot 3.5, Spring Security, Spring Data JPA, Flyway, Spring AI, springdoc
- Database: PostgreSQL 18
- Local orchestration: Docker Compose

## App Features

Frontend routes currently included in the app:

- `/login` - demo login screen
- `/` - dashboard summary and trend charts
- `/audit` - AI audit generation and saved audit history
- `/telemetry` - live telemetry and operational monitoring
- `/resources` - paginated tenant resource inventory

Backend capabilities:

- JWT-based authentication
- multi-tenant dashboard summary and cost trend APIs
- searchable and filterable cloud resource listing
- AI-generated optimization audits with action queuing
- telemetry generation, manual ingestion, anomaly injection, and recent-metric lookup

## Ports

- Frontend: `5173`
- FinOps Core API: `8082`
- Telemetry API: `8081`
- Telemetry PostgreSQL: `5432`
- FinOps PostgreSQL: `5433`

## Prerequisites

- Docker Desktop with Docker Compose
- Node.js 18+ and npm
- PowerShell

Optional:

- `GROQ_API_KEY` or `OPENAI_API_KEY` for AI audit generation

## Quick Start

### 1. Start the backend stack

From the repository root:

```powershell
docker compose up -d
```

If you have old Postgres volumes from a previous run and the containers fail to initialize, recreate them:

```powershell
docker compose down -v
docker compose up -d
```

### 2. Seed the demo login

After `finops-core-postgres` is healthy, run:

```powershell
.\start-finpulse.ps1
```

Demo credentials:

- Email: `admin@acme.com`
- Password: `Admin@123`

### 3. Start the frontend

```powershell
cd Frontend
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173/login`.

## Environment Variables

### Frontend

`Frontend/.env.example` contains:

```env
VITE_API_BASE_URL=http://localhost:8082/api/v1
VITE_TELEMETRY_API_BASE_URL=http://localhost:8081/api/v1/telemetry
```

### FinOps Core API

Common variables used by `finops-core-ai-service`:

- `SERVER_PORT` - defaults to `8082`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_ACCESS_TOKEN_MINUTES` - defaults to `120`
- `TELEMETRY_SERVICE_BASE_URL` - defaults to `http://localhost:8081`
- `GROQ_API_KEY` or `OPENAI_API_KEY`
- `GROQ_BASE_URL` - defaults to `https://api.groq.com/openai`
- `GROQ_MODEL` - defaults to `openai/gpt-oss-20b`
- `GROQ_TEMPERATURE` - defaults to `0.2`

The Spring AI config currently maps the OpenAI-compatible client to `GROQ_*` variables first, then falls back to `OPENAI_*` variables.

### Telemetry Service

Common variables used by `telemetry-ingestion-service`:

- `SERVER_PORT` - defaults to `8081`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `CORE_SERVICE_BASE_URL` - defaults to `http://localhost:8082`
- `APP_CORS_ALLOWED_ORIGINS` - defaults to `http://localhost:5173`

## Main API Endpoints

### FinOps Core API

Base URL: `http://localhost:8082`

- `POST /api/v1/auth/login`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/trends?days=14`
- `GET /api/v1/resources?type=&search=`
- `POST /api/v1/ai/audit`
- `GET /api/v1/ai/audit/history`
- `POST /api/v1/ai/audit/{auditId}/actions`

Swagger UI:

- `http://localhost:8082/swagger-ui.html`

### Telemetry Service

Base URL: `http://localhost:8081`

- `POST /api/v1/telemetry/generate`
- `POST /api/v1/telemetry/ingest`
- `POST /api/v1/telemetry/inject-anomaly`
- `GET /api/v1/telemetry/health-metrics`
- `GET /api/v1/telemetry/resource/{resourceId}/recent?page=0&size=10`

Internal analytics endpoints also exist for the core service under:

- `/api/v1/telemetry/internal/analytics/tenants/{tenantId}/underutilized`
- `/api/v1/telemetry/internal/analytics/tenants/{tenantId}/cost-trends`

Swagger UI:

- `http://localhost:8081/swagger-ui.html`

## Authentication

The frontend stores the JWT in local storage under `finpulse_token` and attaches it as a Bearer token on API requests. If the API returns `401`, the client clears stored auth data and redirects back to `/login`.

## Development Notes

- The root `docker-compose.yml` is the simplest way to run the full platform locally.
- Each service also contains its own `Dockerfile`, `docker-compose.yml`, and service-specific `README.md`.
- Database schema setup is handled with Flyway migrations in both services.
- The telemetry service is designed both for demo simulation and for downstream analytics consumed by the core API.

## Troubleshooting

- If login fails, rerun `.\start-finpulse.ps1` after the `finops-core-postgres` container is healthy.
- If the frontend cannot reach the backend, verify `Frontend/.env` matches the local ports above.
- If AI audit requests fail, confirm that a valid `GROQ_API_KEY` or `OPENAI_API_KEY` is available to the `finops-core-ai-service` container.
- If Docker starts but the databases remain unhealthy, remove old volumes with `docker compose down -v` and start again.

## License

This project is licensed under the terms of the [LICENSE](LICENSE).
