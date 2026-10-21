# 🏗️ Infrastructure & DevOps Guide

Direktori ini berisi konfigurasi infrastruktur dan orchestration untuk Food ERP (Modular Monolith).

## 📁 Struktur Direktori

```
infra/
├── nginx/
│   └── nginx.conf            # Konfigurasi reverse proxy / web server
└── README.md                 # Panduan DevOps dan deployment
```

---

## 🚀 Panduan Ringkas Deployment

### 1. Development Mode (`docker-compose.dev.yml`)
- **Backend**: Live reload via Maven + Spring Boot dengan volume mount `./backend/src`.
- **Frontend**: Vite Dev Server dengan Hot Module Replacement (HMR).
- **Database**: PostgreSQL 15 dengan port `5432` terekspos untuk GUI client (DBeaver / DataGrip).
- **Perintah**:
  ```bash
  docker compose -f docker-compose.dev.yml up --build
  ```

### 2. Production Mode (`docker-compose.prod.yml`)
- **Backend**: Multi-stage build menggunakan `eclipse-temurin:21-jre-alpine`, non-root user, memory limit flags.
- **Frontend**: Multi-stage build menghasilkan aset statis yang disajikan oleh Nginx Alpine berkecepatan tinggi dengan Gzip & caching headers.
- **Reverse Proxy**: Nginx otomatis me-route request `/api/*` langsung ke backend internal tanpa isu CORS.
- **Database**: Port PostgreSQL hanya bisa diakses via internal network (tidak diekspos ke publik).
- **Perintah**:
  ```bash
  cp .env.prod.example .env.prod
  docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
  ```

---

## 🛠️ Healthcheck & Monitoring
- **Backend Healthcheck**: `http://localhost:8080/actuator/health`
- **Nginx Healthcheck**: `http://localhost/healthz`
- **Container Status**: `docker compose ps`
