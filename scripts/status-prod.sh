#!/usr/bin/env bash
set -euo pipefail
PIDFILE=server.pid
if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "RUNNING PID=$PID"
    exit 0
  else
    echo "STALE PIDFILE (process $PID dead)"
    exit 1
  fi
else
  echo "NOT RUNNING"
  exit 3
fi
