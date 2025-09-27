.PHONY: up build stop prune migrate seed

up:
	docker-compose up -d --build

down:
	docker-compose down

build:
	docker-compose build

stop:
	docker-compose down

prune:
	docker system prune -a --volumes


# Run migration SQL file(s) against postgres container
# Uses the migration runner which applies all SQL files in ./Backend/supabase/migrations in sorted order
migrate:
	./Backend/scripts/run_migrations.sh

# Run seed SQL(s)
seed:
	docker-compose exec -T postgres psql -U checkbox -d checkbox < ./Backend/supabase/seed.sql
