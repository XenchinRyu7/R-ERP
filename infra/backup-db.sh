#!/usr/bin/env bash
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/erp-backups"
BACKUP_FILE="${BACKUP_DIR}/food_erp_${TIMESTAMP}.sql.gz"
S3_BUCKET=${S3_BUCKET_NAME:-"food-erp-backup-store"}

mkdir -p "${BACKUP_DIR}"

echo "=========================================================="
echo " [1/3] Dumping PostgreSQL database from Docker container..."
echo "=========================================================="

docker exec food_erp_db_prod pg_dump -U postgres -d food_erp | gzip > "${BACKUP_FILE}"

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "Backup created: ${BACKUP_FILE} (Size: ${FILE_SIZE})"

echo "=========================================================="
echo " [2/3] Uploading backup snapshot to AWS S3..."
echo "=========================================================="

if command -v aws &> /dev/null; then
    aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/backups/food_erp_${TIMESTAMP}.sql.gz"
    aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/backups/latest.sql.gz"
    echo "Snapshot successfully uploaded to s3://${S3_BUCKET}/backups/"
else
    echo "WARNING: AWS CLI not installed. Backup saved locally in ${BACKUP_FILE}."
    echo "To upload to S3, install AWS CLI: 'sudo apt install -y awscli'"
fi

echo "=========================================================="
echo " [3/3] Rotating old local backups (keeping last 7 days)..."
echo "=========================================================="
find "${BACKUP_DIR}" -type f -name "food_erp_*.sql.gz" -mtime +7 -delete

echo "SUCCESS! Backup process completed in seconds."
