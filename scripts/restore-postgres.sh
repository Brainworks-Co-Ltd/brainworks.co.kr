#!/usr/bin/env bash
set -euo pipefail

: "${BACKUP_FILE:?BACKUP_FILE is required}"
: "${RESTORE_DATABASE_URL:?RESTORE_DATABASE_URL is required}"
if [[ "${CONFIRM_RESTORE:-}" != "yes" ]]; then
  echo "CONFIRM_RESTORE=yes를 명시해야 복원을 실행합니다." >&2
  exit 2
fi
test -f "$BACKUP_FILE"
if [[ -f "${BACKUP_FILE}.sha256" ]]; then sha256sum --check "${BACKUP_FILE}.sha256"; fi
pg_restore --exit-on-error --no-owner --dbname="$RESTORE_DATABASE_URL" "$BACKUP_FILE"
