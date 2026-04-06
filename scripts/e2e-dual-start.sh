#!/usr/bin/env bash
# Start two independent nostrbook instances for E2E testing.
#
# Instance A: relay :7777, server :3001, vite :5173
# Instance B: relay :7778, server :3002, vite :5174
#
# Usage:  ./scripts/e2e-dual-start.sh
# Stop:   ./scripts/e2e-dual-stop.sh  (or kill the PIDs)

set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

PIDS=()
cleanup() { kill "${PIDS[@]}" 2>/dev/null; wait; }
trap cleanup EXIT

mkdir -p /tmp/e2e-a /tmp/e2e-b

echo "=== Starting Relay A (port 7777) ==="
WS_PORT=7777 WS_HOST=0.0.0.0 STORAGE_PATH=/tmp/e2e-a/relay \
  SWARM_TOPIC=e2e-a RELAY_NAME="E2E Relay A" WOT_DISCOVERY=false \
  node "$ROOT/relay/start.js" &
PIDS+=($!)

echo "=== Starting Relay B (port 7778) ==="
WS_PORT=7778 WS_HOST=0.0.0.0 STORAGE_PATH=/tmp/e2e-b/relay \
  SWARM_TOPIC=e2e-b RELAY_NAME="E2E Relay B" WOT_DISCOVERY=false \
  node "$ROOT/relay/start.js" &
PIDS+=($!)

sleep 2

echo "=== Initialising databases ==="
cd "$ROOT/server"
DATABASE_URL="file:/tmp/e2e-a/nostrbook.db" npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -1
DATABASE_URL="file:/tmp/e2e-b/nostrbook.db" npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -1

echo "=== Starting Server A (port 3001, relay ws://localhost:7777) ==="
cd "$ROOT/server"
PORT=3001 NODE_ENV=development \
  CORS_ORIGIN="http://localhost:5173" \
  DATABASE_URL="file:/tmp/e2e-a/nostrbook.db" \
  NOSTR_PRIVATE_RELAY="ws://localhost:7777" \
  NOSTR_RELAYS="" \
  npx tsx src/index.ts &
PIDS+=($!)

echo "=== Starting Server B (port 3002, relay ws://localhost:7778) ==="
PORT=3002 NODE_ENV=development \
  CORS_ORIGIN="http://localhost:5174" \
  DATABASE_URL="file:/tmp/e2e-b/nostrbook.db" \
  NOSTR_PRIVATE_RELAY="ws://localhost:7778" \
  NOSTR_RELAYS="" \
  npx tsx src/index.ts &
PIDS+=($!)

cd "$ROOT"

sleep 3

echo "=== Starting Vite A (port 5173, proxy to server 3001 + relay 7777) ==="
VITE_API_TARGET="http://localhost:3001" \
  VITE_RELAY_TARGET="ws://localhost:7777" \
  npx vite --port 5173 --strictPort &
PIDS+=($!)

echo "=== Starting Vite B (port 5174, proxy to server 3002 + relay 7778) ==="
VITE_API_TARGET="http://localhost:3002" \
  VITE_RELAY_TARGET="ws://localhost:7778" \
  npx vite --port 5174 --strictPort &
PIDS+=($!)

echo ""
echo "=== All services started ==="
echo "  Instance A: http://localhost:5173  (relay ws://localhost:7777)"
echo "  Instance B: http://localhost:5174  (relay ws://localhost:7778)"
echo ""
echo "PIDs: ${PIDS[*]}"
echo "Press Ctrl+C to stop all services"

wait
