#!/usr/bin/env bash
set -euo pipefail

DB_HOST="${DB_HOST:-supabase-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-supabase}"
DB_NAME="${DB_NAME:-postgres}"

export PGPASSWORD="$DB_PASSWORD"

MIGRATIONS_DIR="./drizzle/migrations"
SEED_DIR="./drizzle/seed"

echo "[migrate] Waiting for Postgres at $DB_HOST:$DB_PORT..."
for i in {1..60}; do
  if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
    break
  fi
  sleep 1
  if [ "$i" -eq 60 ]; then
    echo "Postgres not ready, exiting."
    exit 1
  fi
done

# Optional: drop Drizzle metadata tables each run (set DROP_DRIZZLE_META=true to enable)
# if [ "${DROP_DRIZZLE_META:-false}" = "true" ]; then
#   echo "[reset] Dropping Drizzle metadata tables (if they exist)..."
#   # Common current meta table
#   psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c 'DROP TABLE IF EXISTS "_drizzle_migrations" CASCADE;'
#   # Legacy / user-referenced possibilities
#   psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c 'DROP TABLE IF EXISTS "_drizzle" CASCADE;'
#   psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c 'DROP TABLE IF EXISTS "_drizzle-kit" CASCADE;' 2>/dev/null || true
# fi

echo "[migrate] Running Drizzle migrations..."
npx drizzle-kit migrate

echo "[seed] Ensuring seed_history table..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 \
  -c "CREATE TABLE IF NOT EXISTS seed_history (filename text PRIMARY KEY, applied_at timestamptz DEFAULT now());"

if compgen -G "$SEED_DIR/*.sql" > /dev/null; then
  for f in "$SEED_DIR"/*.sql; do
    base=$(basename "$f")
    applied=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -At -c "SELECT 1 FROM seed_history WHERE filename='${base}' LIMIT 1;" || true)
    if [ "$applied" = "1" ]; then
      echo "[seed] $base already applied, skipping."
      continue
    fi
    echo "[seed] Applying $base..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$f"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "INSERT INTO seed_history (filename) VALUES ('${base}');"
  done
else
  echo "[seed] No seed files found."
fi

echo "[done] Migrations and seeds complete."
