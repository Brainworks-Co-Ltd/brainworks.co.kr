#!/usr/bin/env bash
set -euo pipefail

: "${RELEASE_DIR:?RELEASE_DIR is required}"
: "${CURRENT_LINK:=/srv/brainworks/current}"
: "${MIGRATION_DATABASE_URL:?MIGRATION_DATABASE_URL is required}"

test -f "$RELEASE_DIR/standalone/server.js"
test -d "$RELEASE_DIR/migrations"
export DATABASE_URL="$MIGRATION_DATABASE_URL"

MIGRATIONS_DIR="$RELEASE_DIR/migrations" node "$RELEASE_DIR/migrate.cjs"

temporary_port="${TEMPORARY_PORT:-3010}"
PORT="$temporary_port" HOSTNAME=127.0.0.1 TZ=Asia/Seoul node "$RELEASE_DIR/standalone/server.js" >"${RELEASE_DIR}/smoke.log" 2>&1 &
pid=$!
cleanup() { kill "$pid" 2>/dev/null || true; }
trap cleanup EXIT
health_url="${HEALTH_URL:-http://127.0.0.1:${temporary_port}/api/health/ready}"
for _ in $(seq 1 30); do
  if curl --fail --silent "$health_url" >/dev/null; then break; fi
  sleep 1
done
curl --fail --silent "$health_url" >/dev/null
ln -sfn "$RELEASE_DIR/standalone" "$CURRENT_LINK"
