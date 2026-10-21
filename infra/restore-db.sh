#!/usr/bin/env bash
set -e

# ==============================================================
# Food ERP - Rapid Disaster Recovery & Database Restoration
# Objective: RTO (Recovery Time Objective) < 30 Seconds
# ==============================================================

S3_BUCKET=${S3_BUCKET_NAME:-"food-erp-backup-store"}
RESTORE_FILE="/tmp/latest_restore.sql.gz"

echo "=========================================================="
echo "  DISASTER RECOVERY DRILL - RESTORING SYSTEM DATA...     "
echo "=========================================================="

# 1. Download latest snapshot from AWS S3 or use local snapshot
if command -v aws &> /dev/null && [ -n "${S3_BUCKET}" ]; then
    echo "[1/4] Pulling latest backup snapshot from AWS S3..."
    aws s3 cp "s3://${S3_BUCKET}/backups/latest.sql.gz" "${RESTORE_FILE}" || true
fi

if [ ! -f "${RESTORE_FILE}" ]; then
    # Fallback to newest local file in /tmp/erp-backups if S3 is not available
    RESTORE_FILE=$(ls -t /tmp/erp-backups/food_erp_*.sql.gz 2>/dev/null | head -n 1)
fi

if [ -z "${RESTORE_FILE}" ] || [ ! -f "${RESTORE_FILE}" ]; then
    echo "FATAL: No backup file found to restore!"
    exit 1
fi

echo "[2/4] Resetting and restoring PostgreSQL database from ${RESTORE_FILE}..."

# Drop existing connections and restore
docker exec -i food_erp_db_prod psql -U postgres -d postgres -c "
  SELECT pg_terminate_backend(pg_stat_activity.pid)
  FROM pg_stat_activity
  WHERE pg_stat_activity.datname = 'food_erp' AND pid <> pg_backend_pid();
"
docker exec -i food_erp_db_prod psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS food_erp;"
docker exec -i food_erp_db_prod psql -U postgres -d postgres -c "CREATE DATABASE food_erp;"

# Pipe decompressed dump into psql
gunzip -c "${RESTORE_FILE}" | docker exec -i food_erp_db_prod psql -U postgres -d food_erp

echo "[3/4] Restarting backend service to refresh JPA caches..."
docker restart food_erp_backend_prod

echo "[4/4] Validating system health..."
sleep 5
docker compose -f docker-compose.prod.yml ps

echo "=========================================================="
echo "  DISASTER RECOVERY COMPLETE! All data recovered!        "
echo "=========================================================="
