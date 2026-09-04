#!/usr/bin/env bash
set -euo pipefail

# Start production deployment: FastAPI app and Nginx

echo "==> Starting FastAPI application..."

# First, make sure no existing processes are running
echo "Checking for existing uvicorn processes..."
EXISTING_PIDS=$(pgrep -f "uvicorn.*server:app" || true)
if [ -n "$EXISTING_PIDS" ]; then
  echo "Found existing uvicorn processes: $EXISTING_PIDS"
  echo "Stopping them first..."
  for PID in $EXISTING_PIDS; do
    kill -TERM "$PID" 2>/dev/null || true
  done
  sleep 2
  # Force kill if still running
  EXISTING_PIDS=$(pgrep -f "uvicorn.*server:app" || true)
  if [ -n "$EXISTING_PIDS" ]; then
    echo "Force killing: $EXISTING_PIDS"
    for PID in $EXISTING_PIDS; do
      kill -KILL "$PID" 2>/dev/null || true
    done
    sleep 1
  fi
  echo "✓ Existing processes stopped"
fi

# Check if systemd service exists
if systemctl list-unit-files | grep -q "hsbc-poc.service"; then
  echo "Starting hsbc-poc.service..."
  sudo systemctl start hsbc-poc
  sleep 2
  if systemctl is-active --quiet hsbc-poc; then
    echo "✓ hsbc-poc.service started"
  else
    echo "✗ Failed to start hsbc-poc.service" >&2
    echo "Checking logs..."
    journalctl -u hsbc-poc -n 10 --no-pager
    exit 1
  fi
else
  # Fall back to venv-based start
  echo "No systemd service found, using venv directly..."
  if [ -f "./scripts/start-prod-venv.sh" ]; then
    ./scripts/start-prod-venv.sh
  else
    echo "✗ start-prod-venv.sh not found" >&2
    exit 1
  fi
fi

echo ""
echo "==> Starting Nginx..."

if systemctl list-unit-files | grep -q "nginx.service"; then
  sudo systemctl start nginx
  sleep 1
  if systemctl is-active --quiet nginx; then
    echo "✓ Nginx started"
  else
    echo "✗ Failed to start Nginx" >&2
    exit 1
  fi
else
  echo "✗ Nginx service not found" >&2
  exit 1
fi

echo ""
echo "==> Production services started"
echo ""
echo "Status:"
systemctl status hsbc-poc --no-pager -l | head -5
echo ""
systemctl status nginx --no-pager -l | head -5
