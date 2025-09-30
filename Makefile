.PHONY: up build stop prune

up:
	docker-compose up -d --build

down:
	docker-compose down -v

build:
	docker-compose build

stop:
	docker-compose down

prune:
	docker system prune -a --volumes

