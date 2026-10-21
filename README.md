# 🍽️ Restaurant & Food Supply Chain ERP

[![Backend CI](https://img.shields.io/badge/Spring%20Boot-4.1.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Frontend](https://img.shields.io/badge/React-19.2%20%7C%20HeroUI%20%7C%20Tailwind%20v4-blue.svg)](https://heroui.com)
[![Database](https://img.shields.io/badge/PostgreSQL-15%2B%20%7C%20Flyway-336791.svg)](https://flywaydb.org)
[![Testing](https://img.shields.io/badge/Tests-BDD%20Feature%20Tests%20%26%20Vitest-success.svg)](#-testing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, end-to-end **Food & Restaurant Enterprise Resource Planning (ERP)** system built with a **Modular Monolith** architecture. Designed specifically for multi-branch restaurant chains, central kitchens, and cold storage logistics.

---

## 📑 Table of Contents
- [Architecture Overview](#-architecture-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Configuration (.env)](#-configuration-env)
- [Testing](#-testing)
- [API Reference](#-api-reference)
- [License](#-license)

---

## 🏛️ Architecture Overview

The system is structured as a **Modular Monolith**, ensuring strict domain separation, data consistency, and clear boundaries while keeping deployment simple:

```
[ Web Browser / Client ]
           │
           │  (REST API / JSON)
           ▼
[ React 19 + HeroUI + Tailwind v4 ]
           │
           │  (Reverse Proxy / Vite dev: :5173 -> :8080)
           ▼
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot 4 Modular Monolith                 │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │ Master Data  │   │ Procurement  │   │  Inventory Log  │  │
│  └──────┬───────┘   └──────┬───────┘   └────────┬────────┘  │
│         │                  │                    │           │
│  ┌──────┴───────┐   ┌──────┴───────┐   ┌────────┴────────┐  │
│  │ Branch Sales │   │  Stock Mgmt  │   │ Exec Analytics  │  │
│  └──────────────┘   └──────────────┘   └─────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (JPA / Hibernate)
                               ▼
                 [ PostgreSQL Database / Flyway ]
```

---

## ✨ Key Features

1. **Master Data Catalog**:
   - Product categories, perishable goods metadata, safety stock thresholds (`minStock`), standard purchase & retail prices.
   - Multi-warehouse directory (Cold Storages, Central Kitchens, Dry Hubs).
   - Partner management: Certified food suppliers and restaurant branches/franchisees.

2. **Procurement Pipeline**:
   - Purchase Order (PO) creation, unit pricing, itemized line items.
   - Status approval lifecycle (`DRAFT` → `SUBMITTED` → `APPROVED` → `RECEIVED`).
   - Direct integration into Goods Receiving inspection.

3. **Real-Time Inventory Control**:
   - Live on-hand stock levels tracked per warehouse.
   - Automated stock increment upon Goods Receipt (`GR-...`) with audit logs.
   - Stock opname / cycle count adjustments with delta calculation.
   - Automatic low-stock safety breach alerts.
   - Immutable audit trail (`IN_PURCHASE`, `OUT_SALES`, `ADJUSTMENT`).

4. **Restaurant Branch Sales Operations**:
   - Branch replenishment orders (`SO-...`).
   - Order lifecycle tracking (`PENDING` → `CONFIRMED` → `PROCESSING` → `DELIVERED`).
   - **Automatic Stock Deduction**: Delivering orders deducts inventory and logs `OUT_SALES` transactions in real-time.

5. **Executive Analytics Dashboard**:
   - Live KPIs: Total Stock Valuation, Procurement Spend, Gross Revenue.
   - Fast summary of low-stock items requiring replenishment.
   - Recent transaction audit feed.

---

## 💻 Technology Stack

### Backend
- **Language & Runtime**: Java 21 (LTS)
- **Framework**: Spring Boot 4.1.1
- **Database & Persistence**: PostgreSQL 15+, Spring Data JPA, Hibernate ORM
- **Migrations**: Flyway (`V1__create_master_data.sql`, `V2__create_procurement_and_inventory.sql`)
- **Security**: Spring Security (Stateless CORS-enabled architecture)
- **Configuration**: Zero-dependency `.env` environment variable loader (`DotenvLoader.java`)
- **Testing**: JUnit 5, MockMvc, AssertJ, In-Memory H2 integration test profile

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8 with `@tailwindcss/vite`
- **UI Component Library**: HeroUI (`@heroui/react` 2.8+)
- **Styling**: Tailwind CSS v4 with custom theme tokens
- **Icons & Motion**: Lucide React, Framer Motion
- **Unit & Component Testing**: Vitest, React Testing Library, JSDOM

---

## 📂 Project Structure

```
restaurant-erp/
├── backend/                               # Spring Boot Application
│   ├── src/main/java/com/fooderp/backend/
│   │   ├── analytics/                     # Dashboard KPI Aggregations
│   │   ├── config/                        # SecurityConfig, DotenvLoader
│   │   ├── inventory/                     # Stocks, Goods Receipts, Transactions
│   │   ├── masterdata/                    # Products, Warehouses, Suppliers, Customers
│   │   ├── procurement/                   # Purchase Orders & Line Items
│   │   └── sales/                         # Branch Sales Orders & Fulfillment
│   ├── src/main/resources/
│   │   ├── application.yml                # Main configuration (PostgreSQL + .env)
│   │   └── db/migration/                  # Flyway versioned SQL migrations
│   └── src/test/java/                     # BDD Feature & Integration Test Suites
│
├── frontend/                              # Vite + React + HeroUI Application
│   ├── src/
│   │   ├── api/                           # Axios/Fetch API client bindings
│   │   ├── components/                    # Sidebar, Navbar, Reusable UI
│   │   ├── pages/                         # Dashboard, Procurement, Inventory, Sales, Master
│   │   ├── types/                         # TypeScript interfaces (erp.ts)
│   │   └── test/                          # Vitest component & UI feature tests
│   ├── vite.config.ts                     # Vite + Tailwind v4 + Vitest setup
│   └── package.json
│
├── .env.example                           # Sample environment configuration
├── package.json                           # Root workspace definition
├── tsconfig.json                          # Solution-style root TypeScript configuration
└── LICENSE                                # MIT License
```

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 21+ (`java -version`)
- **Node.js**: v20+ (`node -v`, `npm -v`)
- **PostgreSQL**: PostgreSQL 15 or higher running locally on port `5432`

---

### 1. Database Setup

Create a PostgreSQL database named `food_erp`:
```sql
CREATE DATABASE food_erp;
```

---

### 2. Environment Configuration

Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Ensure the credentials match your PostgreSQL instance:
```env
DB_URL=jdbc:postgresql://localhost:5432/food_erp
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
PORT=8080
```

---

### 3. Running with Docker (DevOps Environment)

Repository ini dilengkapi dengan arsitektur Docker terpisah untuk **Development** dan **Production**.

#### 🛠️ A. Development Environment (Hot Reload + Volume Mounts)
Cocok untuk pengembangan aktif:
- **Frontend**: Vite dev server pada `http://localhost:5173` dengan Hot Module Replacement (HMR).
- **Backend**: Spring Boot pada `http://localhost:8080` dengan volume mount source code, remote debug socket pada port `5005`, dan caching `.m2` dependency.
- **Database**: PostgreSQL 15 pada port `5432` dengan healthcheck otomatis.

Jalankan container dev:
```bash
# Menggunakan Docker Compose langsung:
docker compose -f docker-compose.dev.yml up --build

# Atau via npm script:
npm run docker:dev
```
Untuk menghentikan:
```bash
docker compose -f docker-compose.dev.yml down
# atau:
npm run docker:dev:down
```

---

#### 🚀 B. Production Environment (Multi-Stage Build + Nginx Reverse Proxy)
Arsitektur siap rilis (Production-Ready) sesuai standar DevOps:
- **Hardened Backend**: Multi-stage build menggunakan `eclipse-temurin:21-jre-alpine`, non-root user, container JVM memory flags (`MaxRAMPercentage=75%`), dan healthcheck via Actuator.
- **High-Performance Frontend & Reverse Proxy**: Multi-stage build disajikan oleh Nginx Alpine dengan Gzip compression, immutable static cache, SPA fallback routing, dan internal proxy `/api/*` langsung ke container backend (bebas masalah CORS di production).
- **Secure Database**: Port PostgreSQL tidak diekspos ke publik (hanya dalam network internal Docker).
- **Logging**: Driver `json-file` dengan log rotation (`max-size: 10m-20m`) untuk mencegah disk kehabisan ruang.

Langkah deployment production:
```bash
# 1. Salin template konfigurasi environment production
cp .env.prod.example .env.prod

# 2. Sesuaikan kredensial dan port jika diperlukan di .env.prod

# 3. Jalankan container production di background (daemon):
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Atau via npm script:
npm run docker:prod
```

Akses aplikasi di:
- **Web App & API Gateway**: `http://localhost:80` (atau port yang ditentukan di `PROD_PORT`)
- **Healthcheck**: `http://localhost:80/healthz` dan `http://localhost:80/actuator/health`

Perintah DevOps praktis:
```bash
# Cek status & health seluruh container:
docker compose -f docker-compose.prod.yml ps

# Pantau streaming logs:
docker compose -f docker-compose.prod.yml logs -f
# atau:
npm run docker:prod:logs

# Hentikan container production:
docker compose -f docker-compose.prod.yml down
```

### 4. Running the Backend

From the `backend` directory:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*(On Linux/macOS, use `./mvnw spring-boot:run`)*

- Flyway will automatically execute migrations `V1` and `V2`.
- `MasterDataSeeder` will populate sample products, warehouses, suppliers, and transactions.
- Server starts at `http://localhost:8080`.

---

### 5. Running the Frontend

From the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```

- Vite dev server will start at `http://localhost:5173`.
- Open `http://localhost:5173` in your browser to access the ERP interface.

---

## 🧪 Testing

The repository contains automated tests across both frontend and backend.

### Backend Feature & BDD Tests
Runs end-to-end slice tests with an isolated in-memory H2 database:
```powershell
cd backend
.\mvnw.cmd test
```
**Test Scenarios Covered**:
- `ProcurementAndInventoryFeatureTest`: PO creation → Supplier confirmation → Goods receiving → Warehouse stock increment → `IN_PURCHASE` audit log.
- `SalesAndFulfillmentFeatureTest`: Branch order placement → Status progression → Stock deduction upon delivery → `OUT_SALES` audit log.
- `MasterDataAndAnalyticsFeatureTest`: Full catalog queries, live stock valuation, and safety threshold alerts.

### Frontend Component Tests
Runs Vitest and React Testing Library:
```bash
cd frontend
npm test
```
**Test Scenarios Covered**:
- `ProcurementPage.test.tsx`: Validates HeroUI table rendering, status chips, modal trigger, and user interactions.

---

## 📡 API Reference

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Analytics** | `GET` | `/api/analytics/dashboard` | Executive KPIs and financial metrics |
| **Master Data** | `GET` | `/api/master-data/products` | Retrieve all active products |
| **Master Data** | `GET` | `/api/master-data/warehouses` | Retrieve list of storage facilities |
| **Master Data** | `GET` | `/api/master-data/suppliers` | Retrieve food suppliers directory |
| **Master Data** | `GET` | `/api/master-data/customers` | Retrieve restaurant branches |
| **Procurement** | `GET` | `/api/procurement/orders` | Retrieve purchase orders |
| **Procurement** | `POST` | `/api/procurement/orders` | Create a new purchase order |
| **Procurement** | `PATCH` | `/api/procurement/orders/{id}/status` | Update PO status (`APPROVED`, etc.) |
| **Inventory** | `GET` | `/api/inventory/stocks` | On-hand stock per warehouse |
| **Inventory** | `GET` | `/api/inventory/stocks/low` | Low safety-stock alerts |
| **Inventory** | `POST` | `/api/inventory/receipts` | Process warehouse goods receipt |
| **Inventory** | `POST` | `/api/inventory/stocks/adjust` | Manual stock opname adjustment |
| **Sales** | `GET` | `/api/sales/orders` | Retrieve restaurant sales orders |
| **Sales** | `POST` | `/api/sales/orders` | Create branch replenishment order |
| **Sales** | `PATCH` | `/api/sales/orders/{id}/status` | Update SO status (`DELIVERED`, etc.) |

---

## 🔄 CI/CD & Automated VPS Deployment

Repository ini telah dikonfigurasi dengan **GitHub Actions** (`.github/workflows/ci-cd.yml`) untuk pipeline DevOps otomatis:

```
[ Developer Git Push (main) ]
              │
              ▼
 1. [ Automated Testing ]
    ├── Backend JUnit 5 & BDD Slices (Java 21)
    └── Frontend Vitest & Vite Build (Node 20)
              │
              ▼ (Jika test sukses)
 2. [ Docker Buildx & Cache ]
    ├── Build Backend image (Dockerfile.prod)
    └── Build Frontend image (Dockerfile.prod)
              │
              ▼
 3. [ GitHub Container Registry (GHCR) ]
    ├── ghcr.io/<owner>/restaurant-erp/backend:latest
    └── ghcr.io/<owner>/restaurant-erp/frontend:latest
              │
              ▼ (Jika SSH Secret dikonfigurasi)
 4. [ Auto-Deploy ke VPS ]
    └── SSH ➔ docker compose pull ➔ docker compose up -d (Zero downtime)
```

### 🎯 Kenapa Menggunakan Pre-built Images di VPS?
Membangun Java Maven dan Vite di dalam VPS murah (1GB/2GB RAM) seringkali menyebabkan server *crash* atau *Out Of Memory (OOM)*. Dengan alur ini:
- Server GitHub Actions (gratis, 16GB RAM) yang melakukan kompilasi dan build container.
- VPS **hanya perlu menarik image jadi (pull)** dan menjalankannya dalam hitungan detik tanpa beban CPU/RAM!

---

### 🖥️ Panduan Setup Deployment di VPS

#### A. Persiapan VPS (Cukup Sekali)
1. Install **Docker** & **Docker Compose** di VPS Anda:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```
2. Buat direktori aplikasi di VPS:
   ```bash
   sudo mkdir -p /opt/restaurant-erp
   cd /opt/restaurant-erp
   ```
3. Salin file berikut ke direktori `/opt/restaurant-erp`:
   - `docker-compose.prod.yml`
   - `.env.prod.example` (lalu ubah namanya menjadi `.env.prod` dan ubah password DB)
   - `infra/deploy.sh`

#### B. Setup GitHub Secrets (Untuk Auto-Deploy Otomatis)
Buka repository GitHub Anda ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions** ➔ Klik **New repository secret**:

| Secret Name | Deskripsi | Contoh |
|---|---|---|
| `VPS_HOST` | IP Publik VPS Anda | `103.123.45.67` |
| `VPS_USERNAME` | User SSH VPS Anda | `ubuntu` atau `root` |
| `VPS_SSH_KEY` | Private SSH Key Anda (`id_rsa` / `id_ed25519`) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` | Port SSH *(opsional, default 22)* | `22` |
| `VPS_APP_DIR` | Folder app di VPS *(opsional, default `/opt/restaurant-erp`)* | `/opt/restaurant-erp` |

Setiap kali Anda melakukan `git push origin main`:
1. GitHub Actions akan menguji kode.
2. Membangun image Docker dan mempublikasikannya ke GHCR.
3. Melakukan SSH ke VPS Anda, menarik image terbaru, dan me-restart container secara otomatis!

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.
