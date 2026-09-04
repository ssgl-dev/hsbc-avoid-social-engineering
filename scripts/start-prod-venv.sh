#!/usr/bin/env bash
set -euo pipefail

# Start FastAPI app for production behind nginx using venv directly
# Alternative to start-prod.sh that doesn't require uv

HOST=${HOST:-127.0.0.1}
PORT=${PORT:-8000}
WORKERS=${WORKERS:-4}
LOGFILE=${LOGFILE:-app.log}
PIDFILE=server.pid
VENV_PATH=${VENV_PATH:-/opt/hsbc-poc/.venv}

if [ -f "$PIDFILE" ] && kill -0 "$(cat $PIDFILE)" 2>/dev/null; then
  echo "Server already running with PID $(cat $PIDFILE)"
  exit 0
fi

if [ ! -d "$VENV_PATH" ]; then
  echo "Virtual environment not found at $VENV_PATH" >&2
  exit 1
fi

if [ ! -f "$VENV_PATH/bin/uvicorn" ]; then
  echo "uvicorn not found in venv at $VENV_PATH/bin/uvicorn" >&2
  exit 1
fi

# Launch using venv's uvicorn directly
nohup "$VENV_PATH/bin/uvicorn" server:app \
  --host "$HOST" \
  --port "$PORT" \
  --workers "$WORKERS" \
  --no-server-header \
  --proxy-headers \
  > "$LOGFILE" 2>&1 &
PID=$!
echo $PID > "$PIDFILE"

echo "Started server PID $PID on $HOST:$PORT with $WORKERS workers (log: $LOGFILE)"
