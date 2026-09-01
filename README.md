# FinPulse AI

FinPulse AI is a local full-stack FinOps demo platform for monitoring cloud resource usage, analyzing spend trends, simulating telemetry, and generating AI-assisted optimization recommendations.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [New Developer Setup](#new-developer-setup)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

FinPulse AI includes:

- A React dashboard for FinOps visibility and AI audit workflows.
- A Spring Boot core API for authentication, dashboards, cloud resources, users, and AI audit orchestration.
- A Spring Boot telemetry service for metric generation, ingestion, anomaly injection, and analytics.
- Two PostgreSQL databases managed through Docker Compose.

## Architecture

```text
Frontend (React + Vite, :5173)
    |
    v
FinOps Core API (Spring Boot, :8082)
    |
    +--> FinOps PostgreSQL (:5433)
    |
    +--> Telemetry Service (Spring Boot, :8081)
             |
             +--> Telemetry PostgreSQL (:5432)
```

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, React Router 7, Vite 8, Tailwind CSS, Axios, Recharts, Lucide |
| Core API | Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA, Flyway, Spring AI, springdoc |
| Telemetry API | Java 25, Spring Boot 3.5, Spring Data JPA, Flyway, springdoc |
| Database | PostgreSQL 18 |
| Local runtime | Docker Compose |

## Repository Structure

```text
.
+-- Frontend/                         # React dashboard
+-- Service/
|   +-- finops-core-ai-service/        # Core backend API
|   +-- telemetry-ingestion-service/   # Telemetry backend API
+-- docker-compose.yml                 # Full local backend stack
+-- start-finpulse.ps1                 # Demo tenant/admin seed script
+-- README.md
+-- LICENSE
```

## Prerequisites

- Docker Desktop with Docker Compose
- Node.js 18 or later
- npm
- PowerShell

Optional:

- `GROQ_API_KEY` or `OPENAI_API_KEY` for AI audit generation

For running backend services outside Docker, install the Java versions expected by each service:

- `finops-core-ai-service`: Java 21
- `telemetry-ingestion-service`: Java 25

## New Developer Setup

Use this flow when setting up the project on a new machine for the first time.

### 1. Clone the Repository

```powershell
git clone https://github.com/Arijitdey27/FinPulse-AI.git
cd FinPulse-AI
```

### 2. Configure AI API Keys for Docker

AI audit generation is optional, but the feature needs either a Groq API key or an OpenAI API key.

For the current PowerShell session:

```powershell
$env:GROQ_API_KEY="your-groq-api-key"
```

Or, if using OpenAI instead:

```powershell
$env:OPENAI_API_KEY="your-openai-api-key"
```

To persist the key for future PowerShell sessions:

```powershell
[Environment]::SetEnvironmentVariable("GROQ_API_KEY", "your-groq-api-key", "User")
```

Close and reopen PowerShell after setting a persistent environment variable.

The root `docker-compose.yml` passes these values into `finops-core-ai-service` when Docker Compose starts the container.

### 3. Build Docker Images

From the repository root:

```powershell
docker compose build
```

This builds:

- `finops-core-ai-service`
- `telemetry-ingestion-service`

### 4. Start Backend Containers

```powershell
docker compose up -d
```

Check that all containers are running:

```powershell
docker compose ps
```

Expected backend URLs:

- FinOps Core API: `http://localhost:8082`
- Telemetry API: `http://localhost:8081`
- FinOps PostgreSQL: `localhost:5433`
- Telemetry PostgreSQL: `localhost:5432`

### 5. Seed Demo Tenant and Admin User

Wait until `finops-core-postgres` is healthy, then run:

```powershell
.\start-finpulse.ps1
```

Demo login:

```text
Email:    admin@acme.com
Password: Admin@123
```

### 6. Configure the Frontend

```powershell
cd Frontend
copy .env.example .env
```

Confirm `Frontend/.env` contains:

```env
VITE_API_BASE_URL=http://localhost:8082/api/v1
VITE_TELEMETRY_API_BASE_URL=http://localhost:8081/api/v1/telemetry
```

### 7. Install Frontend Dependencies

```powershell
npm install
```

### 8. Run the Frontend

```powershell
npm run dev
```

Open:

```text
http://localhost:5173/login
```

### 9. Stop the Local Stack

When finished, stop backend containers from the repository root:

```powershell
docker compose down
```

To remove databases and start with fresh data:

```powershell
docker compose down -v
```

## Quick Start

Use this shorter flow after the project has already been cloned and configured.

### 1. Start the Backend Stack

From the repository root:

```powershell
docker compose up -d
```

If old PostgreSQL volumes cause startup issues, recreate the stack:

```powershell
docker compose down -v
docker compose up -d
```

### 2. Seed Demo Data

After `finops-core-postgres` is healthy, run:

```powershell
.\start-finpulse.ps1
```

Demo login:

```text
Email:    admin@acme.com
Password: Admin@123
```

### 3. Start the Frontend

```powershell
cd Frontend
copy .env.example .env
npm install
npm run dev
```

Open the app at:

```text
http://localhost:5173/login
```

## Configuration

### Frontend

Create `Frontend/.env` from `Frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8082/api/v1
VITE_TELEMETRY_API_BASE_URL=http://localhost:8081/api/v1/telemetry
```

### FinOps Core API

Common environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `SERVER_PORT` | Core API port | `8082` |
| `DB_URL` | Core PostgreSQL JDBC URL | Required |
| `DB_USERNAME` | Core database username | Required |
| `DB_PASSWORD` | Core database password | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_ACCESS_TOKEN_MINUTES` | Access token lifetime | `120` |
| `TELEMETRY_SERVICE_BASE_URL` | Telemetry service base URL | `http://localhost:8081` |
| `GROQ_API_KEY` | Groq API key for AI audits | Required to run AI audits |
| `OPENAI_API_KEY` | OpenAI API key fallback | Required if `GROQ_API_KEY` is not set |
| `GROQ_BASE_URL` | OpenAI-compatible Groq base URL | `https://api.groq.com/openai` |
| `GROQ_MODEL` | AI model name | `openai/gpt-oss-20b` |
| `GROQ_TEMPERATURE` | AI response temperature | `0.2` |

The Spring AI OpenAI-compatible client is configured to use `GROQ_*` values first, with `OPENAI_*` values as fallback.

### Telemetry Service

Common environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `SERVER_PORT` | Telemetry API port | `8081` |
| `DB_URL` | Telemetry PostgreSQL JDBC URL | Required |
| `DB_USERNAME` | Telemetry database username | Required |
| `DB_PASSWORD` | Telemetry database password | Required |
| `CORE_SERVICE_BASE_URL` | Core service base URL | `http://localhost:8082` |
| `APP_CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |

## API Reference

### FinOps Core API

Base URL:

```text
http://localhost:8082
```

Key endpoints:

- `POST /api/v1/auth/login`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/trends?days=14`
- `GET /api/v1/resources?type=&search=`
- `POST /api/v1/ai/audit`
- `GET /api/v1/ai/audit/history`
- `POST /api/v1/ai/audit/{auditId}/actions`

Swagger UI:

```text
http://localhost:8082/swagger-ui.html
```

### Telemetry Service

Base URL:

```text
http://localhost:8081
```

Key endpoints:

- `POST /api/v1/telemetry/generate`
- `POST /api/v1/telemetry/ingest`
- `POST /api/v1/telemetry/inject-anomaly`
- `GET /api/v1/telemetry/health-metrics`
- `GET /api/v1/telemetry/resource/{resourceId}/recent?page=0&size=10`

Internal analytics endpoints used by the core service:

- `GET /api/v1/telemetry/internal/analytics/tenants/{tenantId}/underutilized`
- `GET /api/v1/telemetry/internal/analytics/tenants/{tenantId}/cost-trends`

Swagger UI:

```text
http://localhost:8081/swagger-ui.html
```

## Authentication

The frontend stores the JWT in local storage under `finpulse_token` and sends it as a Bearer token on API requests. When the API returns `401`, the client clears stored auth data and redirects to `/login`.

## Development

The root `docker-compose.yml` is the recommended way to run the backend stack locally. Each backend service also includes its own `Dockerfile`, `docker-compose.yml`, and service-specific `README.md`.

Database schema changes are managed through Flyway migrations in each service:

- `Service/finops-core-ai-service/src/main/resources/db/migration`
- `Service/telemetry-ingestion-service/src/main/resources/db/migration`

## Testing

Run frontend production build checks:

```powershell
cd Frontend
npm run build
```

Run core API tests:

```powershell
cd Service\finops-core-ai-service
.\mvnw test
```

Run telemetry service tests:

```powershell
cd Service\telemetry-ingestion-service
.\mvnw test
```

## Troubleshooting

| Issue | Resolution |
| --- | --- |
| Login fails | Rerun `.\start-finpulse.ps1` after `finops-core-postgres` is healthy. |
| Frontend cannot reach backend | Verify `Frontend/.env` uses the local ports from this README. |
| AI audit requests fail | Confirm `GROQ_API_KEY` or `OPENAI_API_KEY` is available to `finops-core-ai-service`. |
| Database containers stay unhealthy | Run `docker compose down -v`, then `docker compose up -d`. |

## License

This project is licensed under the terms of the [LICENSE](LICENSE).
