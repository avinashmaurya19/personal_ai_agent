#!/usr/bin/env bash
set -e

# Change directory to repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "=================================================="
echo "🚀 Starting Personal AI Assistant Development Environment"
echo "=================================================="

# 1. Ensure Docker dependencies are up
echo "📦 Ensuring PostgreSQL (pgvector) and Redis are running..."
docker compose up -d

# 2. Apply database migrations
echo "🔄 Checking and applying database migrations..."
(cd apps/api && .venv/bin/alembic upgrade head)

echo "=================================================="
echo "🌐 Launching Backend (FastAPI :8000) & Frontend (Next.js :3000)..."
echo "   - Web UI:  http://localhost:3000"
echo "   - API:     http://localhost:8000"
echo "   - Swagger: http://localhost:8000/docs"
echo "=================================================="
echo "Press Ctrl+C to stop both servers."

# Clean up all background jobs on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null || true
    wait 2>/dev/null || true
    echo "✅ Development servers stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start Backend
(
    cd apps/api
    export PYTHONPATH="$REPO_ROOT/apps/api"
    exec .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
) &

# Start Frontend
(
    cd apps/web
    exec npm run dev
) &

# Wait for background processes
wait
