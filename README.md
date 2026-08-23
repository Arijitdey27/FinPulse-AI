# FinPulse AI

FinPulse AI is a full-stack FinOps demo platform for tracking cloud resource usage, surfacing cost trends, and generating AI-assisted optimization recommendations. The project combines two Spring Boot services, two PostgreSQL databases, and a React dashboard.

## Project Structure

- `Frontend/`: React + Vite dashboard
- `Service/finops-core-ai-service/`: core FinOps API, auth, dashboard data, AI audit
- `Service/telemetry-ingestion-service/`: telemetry ingestion and analytics API
- `docker-compose.yml`: local multi-service stack
- `start-finpulse.ps1`: seeds the demo login user into the FinOps database

## Stack

- Backend: Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Flyway, Spring AI
- Frontend: React 18, Vite, Tailwind CSS, Recharts, Axios
- Database: PostgreSQL 18 Alpine
- Local orchestration: Docker Compose

## Local Ports

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

- `OPENAI_API_KEY` for AI audit and recommendation features

## Quick Start

### 1. Start the backend stack

From the repository root:

```powershell
docker compose up -d
```

If you previously ran the project on PostgreSQL 16 and the database containers fail after upgrading to PostgreSQL 18, recreate the volumes:

```powershell
docker compose down -v
docker compose up -d
```

PostgreSQL 18 expects the Docker volume to be mounted at `/var/lib/postgresql`, and the compose files in this repo are already configured for that layout.

### 2. Seed the demo login

After the containers are healthy, seed the default admin user:

```powershell
.\start-finpulse.ps1
```

Seeded credentials:

- Email: `admin@acme.com`
- Password: `Admin@123`

### 3. Start the frontend

```powershell
cd Frontend
copy .env.example .env
npm install
npm run dev
```

Open the app at `http://localhost:5173/login`.

## Environment Notes

Frontend:

- `VITE_API_BASE_URL=http://localhost:8082/api/v1`

FinOps Core service:

- `OPENAI_API_KEY`: required for AI-powered audit generation
- `OPENAI_MODEL`: defaults to `gpt-4o-mini`
- `OPENAI_TEMPERATURE`: defaults to `0.2`
- `JWT_SECRET`: defaults to the local development secret in `docker-compose.yml`

## Services Overview

### FinOps Core AI Service

Base URL: `http://localhost:8082`

Responsibilities:

- JWT-based authentication
- Dashboard summary and trend APIs
- Cloud resource listing
- AI audit generation and audit history

Main endpoints:

- `POST /api/v1/auth/login`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/trends`
- `GET /api/v1/resources`
- `POST /api/v1/ai/audit`
- `GET /api/v1/ai/audit/history`

Swagger:

- `http://localhost:8082/swagger-ui.html`

### Telemetry Ingestion Service

Base URL: `http://localhost:8081`

Responsibilities:

- Generate or ingest telemetry data
- Provide telemetry health and recent metrics
- Expose internal analytics used by the FinOps service

Main endpoints:

- `POST /api/v1/telemetry/generate`
- `POST /api/v1/telemetry/ingest`
- `POST /api/v1/telemetry/inject-anomaly`
- `GET /api/v1/telemetry/health-metrics`
- `GET /api/v1/telemetry/resource/{resourceId}/recent`

Swagger:

- `http://localhost:8081/swagger-ui.html`

## Authentication

The frontend stores the JWT in local storage after login and sends it as a Bearer token on subsequent requests. CORS is currently configured to allow the local Vite app at `http://localhost:5173`.

## Running Services Individually

Each backend service has its own `docker-compose.yml` and `Dockerfile` under `Service/...` if you want to run them separately, but the root `docker-compose.yml` is the easiest way to boot the full local environment.

## Troubleshooting

- If `docker compose up -d` shows Postgres containers as unhealthy after the image upgrade, run `docker compose down -v` and start again.
- If login fails, make sure `.\start-finpulse.ps1` completed successfully after the FinOps database container was healthy.
- If the frontend cannot reach the backend, confirm `Frontend/.env` points to `http://localhost:8082/api/v1`.
- If AI audit requests fail, verify that `OPENAI_API_KEY` is available to the `finops-core-ai-service` container.

## License

This project is licensed under the terms of the [LICENSE](LICENSE).
