#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_DIR:=/var/lib/brainworks/backups}"
mkdir -p "$BACKUP_DIR"
run_id="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)}"
backup_file="$BACKUP_DIR/brainworks-${run_id}.dump"
pg_dump --format=custom --no-owner --file="$backup_file" "$DATABASE_URL"
sha256sum "$backup_file" > "${backup_file}.sha256"
if [[ -n "${BACKUP_S3_URI:-}" ]]; then
  aws s3 cp "$backup_file" "$BACKUP_S3_URI/$(basename "$backup_file")"
  aws s3 cp "${backup_file}.sha256" "$BACKUP_S3_URI/$(basename "$backup_file").sha256"
fi
printf '%s\n' "$backup_file"
