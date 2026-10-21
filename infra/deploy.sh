#!/usr/bin/env bash
set -e

# ==============================================================
# Food ERP - VPS Deployment Script
# Digunakan untuk pull image terbaru dari GHCR dan restart container
# ==============================================================

echo "============================================="
echo "  Deploying Food ERP to Production (VPS)...  "
echo "============================================="

# Pastikan file .env.prod sudah ada
if [ ! -f .env.prod ]; then
    echo "ERROR: File .env.prod tidak ditemukan!"
    echo "Salin template dengan: cp .env.prod.example .env.prod lalu edit isinya."
    exit 1
fi

echo "[1/4] Pulling pre-built Docker images from GHCR..."
docker compose -f docker-compose.prod.yml pull

echo "[2/4] Restarting containers with zero-downtime recreation..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --remove-orphans

echo "[3/4] Cleaning up unused images to free up VPS disk space..."
docker image prune -af --filter "until=24h"

echo "[4/4] Verifying running containers..."
docker compose -f docker-compose.prod.yml ps

echo "============================================="
echo "  SUCCESS! Food ERP is running successfully! "
echo "============================================="
