.PHONY: help up down restart logs ps clean test lint dev

help:
	@echo "Available commands:"
	@echo "  make dev       - Run database, backend (:8000), and frontend (:3000) concurrently"
	@echo "  make up        - Start local infrastructure (Postgres + Redis)"
	@echo "  make down      - Stop local infrastructure"
	@echo "  make restart   - Restart local infrastructure"
	@echo "  make logs      - View infrastructure logs"
	@echo "  make ps        - List running containers"
	@echo "  make test      - Run automated test suite"
	@echo "  make clean     - Clean caches and temporary files"

dev:
	@chmod +x infra/scripts/dev.sh
	@./infra/scripts/dev.sh

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
	PYTHONPATH=apps/api apps/api/.venv/bin/pytest apps/api/tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".next" -exec rm -rf {} +
