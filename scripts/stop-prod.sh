#!/usr/bin/env bash
set -euo pipefail

# Stop production deployment: FastAPI app and Nginx

echo "==> Stopping FastAPI application..."

STOPPED=false

# Try systemd service first (if running as service)
if systemctl is-active --quiet hsbc-poc 2>/dev/null; then
  echo "Stopping hsbc-poc.service..."
  sudo systemctl stop hsbc-poc
  echo "✓ hsbc-poc.service stopped"
  STOPPED=true
fi

# Then check for PID file (if running via script)
PIDFILE=server.pid
if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "Sending SIGTERM to process $PID (from PID file)..."
    kill -TERM "$PID"
    # Wait up to 10s
    for i in {1..20}; do
      if kill -0 "$PID" 2>/dev/null; then
        sleep 0.5
      else
        echo "✓ Process $PID stopped"
        rm -f "$PIDFILE"
        STOPPED=true
        break
      fi
    done
    # Force kill if still running
    if kill -0 "$PID" 2>/dev/null; then
      echo "Force killing $PID..."
      kill -KILL "$PID" || true
      rm -f "$PIDFILE"
      STOPPED=true
    fi
  else
    echo "Process $PID not running (cleaning up PID file)"
    rm -f "$PIDFILE"
  fi
fi

# Last resort: find and kill any uvicorn processes running server:app
if ! $STOPPED; then
  echo "Looking for uvicorn processes..."
  PIDS=$(pgrep -f "uvicorn.*server:app" || true)
  if [ -n "$PIDS" ]; then
    echo "Found uvicorn processes: $PIDS"
    for PID in $PIDS; do
      echo "Sending SIGTERM to process $PID..."
      kill -TERM "$PID" 2>/dev/null || true
    done
    sleep 2
    # Check if any are still running and force kill
    PIDS=$(pgrep -f "uvicorn.*server:app" || true)
    if [ -n "$PIDS" ]; then
      echo "Force killing remaining processes: $PIDS"
      for PID in $PIDS; do
        kill -KILL "$PID" 2>/dev/null || true
      done
    fi
    echo "✓ Uvicorn processes stopped"
    STOPPED=true
  else
    echo "No uvicorn processes found"
  fi
fi

echo ""
echo "==> Stopping Nginx..."

if systemctl is-active --quiet nginx 2>/dev/null; then
  sudo systemctl stop nginx
  echo "✓ Nginx stopped"
else
  echo "Nginx is not running"
fi

echo ""
echo "==> Production services stopped"
