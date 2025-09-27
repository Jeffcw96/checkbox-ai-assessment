#!/usr/bin/env bash
set -euo pipefail

MIGRATIONS_DIR="./Backend/supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory found at $MIGRATIONS_DIR"
  exit 0
fi

echo "Ensuring schema_migrations table exists..."
docker-compose exec -T postgres psql -U checkbox -d checkbox -v ON_ERROR_STOP=1 -c "CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, applied_at timestamp NOT NULL DEFAULT now());"

# iterate files in sorted order
shopt_available=false
# prefer posix-compatible ls sorting; avoid breaking if no files
MIG_FILES=$(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null || true)

if [ -z "$MIG_FILES" ]; then
  echo "No migration files found in $MIGRATIONS_DIR"
  exit 0
fi

for f in $MIG_FILES; do
  name=$(basename "$f")
  echo "Checking migration: $name"
  applied=$(docker-compose exec -T postgres psql -U checkbox -d checkbox -tAc "SELECT 1 FROM schema_migrations WHERE filename = '$name';" || true)
  if [ "$applied" = "1" ]; then
    echo "  -> already applied, skipping"
    continue
  fi

  echo "  -> applying $name"
  docker-compose exec -T postgres psql -U checkbox -d checkbox -v ON_ERROR_STOP=1 < "$f"

  echo "  -> recording $name"
  docker-compose exec -T postgres psql -U checkbox -d checkbox -v ON_ERROR_STOP=1 -c "INSERT INTO schema_migrations (filename) VALUES ('$name');"
done

echo "All migrations processed."
