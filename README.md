# ⚡ FinPulse AI — Cloud Expense & Telemetry Intelligence Platform

**FinPulse AI** is an enterprise-grade FinOps and cloud cost-optimization platform. It ingests high-frequency infrastructure metrics (CPU, Memory, Storage IOPS, Costs), runs automated telemetry analysis, and uses **Spring AI** to generate intelligent, actionable cost-saving recommendations for cloud resource management.

---

## 🚀 Key Features

* 📊 **Live Telemetry Engine:** Asynchronously ingests and processes high-frequency server usage metrics.
* 🤖 **Spring AI Cost Auditor:** Analyzes underutilized cloud assets (e.g., idle databases, over-provisioned VMs) and generates actionable downsizing strategies.
* 🏢 **Multi-Tenancy & RBAC:** Fine-grained data isolation powered by Spring Security and JWT authentication.
* 📈 **Interactive FinOps Dashboard:** High-performance React UI built with Recharts for visualizing time-series cloud spending and system metrics.
* 🐳 **Containerized & Tested:** Fully dockerized services with automated integration testing via Testcontainers.

---

## 🛠️ Tech Stack & Architecture

* **Backend:** Java 21, Spring Boot 3, Spring AI, Spring Security (JWT), Spring Data JPA
* **Frontend:** React, Vite, Tailwind CSS, Recharts, Axios
* **Database:** PostgreSQL
* **DevOps & Testing:** Docker Compose, Testcontainers, JUnit 5
