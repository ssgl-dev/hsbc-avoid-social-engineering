#!/usr/bin/env bash
set -euo pipefail

# Start FastAPI app for production behind nginx
# Uses uv to resolve deps quickly; binds only on loopback so nginx proxies it.

HOST=${HOST:-127.0.0.1}
PORT=${PORT:-8000}
WORKER_CLASS=${WORKER_CLASS:-uvicorn}
LOGFILE=${LOGFILE:-app.log}
PIDFILE=server.pid

if [ -f "$PIDFILE" ] && kill -0 "$(cat $PIDFILE)" 2>/dev/null; then
  echo "Server already running with PID $(cat $PIDFILE)"
  exit 0
fi

# Add uv to PATH if installed in common locations
export PATH="$HOME/.local/bin:$PATH"

if ! command -v uv >/dev/null 2>&1; then
  echo "uv not found in PATH" >&2
  echo "Install with: curl -LsSf https://astral.sh/uv/install.sh | sh" >&2
  exit 1
fi

# Launch using uv run; disable reload; explicit uvicorn entry
nohup uv run uvicorn server:app \
  --host "$HOST" \
  --port "$PORT" \
  --no-server-header \
  --proxy-headers \
  > "$LOGFILE" 2>&1 &
PID=$!
echo $PID > "$PIDFILE"

echo "Started server PID $PID on $HOST:$PORT (log: $LOGFILE)"
