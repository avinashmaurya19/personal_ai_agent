.PHONY: help up down restart logs ps clean test lint dev

help:
	@echo "Available commands:"
	@echo "  make up        - Start local infrastructure (Postgres + Redis)"
	@echo "  make down      - Stop local infrastructure"
	@echo "  make restart   - Restart local infrastructure"
	@echo "  make logs      - View infrastructure logs"
	@echo "  make ps        - List running containers"
	@echo "  make test      - Run automated test suite"
	@echo "  make clean     - Clean caches and temporary files"

up:
	docker compose up -d

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f

ps:
	docker compose ps

test:
	pytest apps/api/tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".next" -exec rm -rf {} +
