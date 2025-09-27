.PHONY: up build logs stop migrate seed

# Start all services (build images)
up:
	docker-compose up -d --build

down:
	docker-compose down

# Build images only
build:
	docker-compose build

# Follow logs for all services
logs:
	docker-compose logs -f

# Stop and remove containers
stop:
	docker-compose down

# Run migration SQL file(s) against postgres container
# Uses the migration runner which applies all SQL files in ./Backend/supabase/migrations in sorted order
migrate:
	./Backend/scripts/run_migrations.sh

# Run seed SQL(s)
seed:
	docker-compose exec -T postgres psql -U checkbox -d checkbox < ./Backend/supabase/seed.sql
