#!/bin/bash

# Start FastAPI server with reload for development
echo "Starting FastAPI server on http://localhost:8000 ..."
# prefer .venv python if exists
if [ -x ".venv/Scripts/python.exe" ]; then
  PY=".venv/Scripts/python.exe"
else
  PY="$(which python || true)"
  if [ -z "$PY" ]; then
    echo "python not found in PATH"
    exit 1
  fi
fi
uv run uvicorn server:app --reload --host localhost --port 8000 &
child=$!

# ensure signals kill child and script waits for it
trap 'kill "$child" 2>/dev/null || true' INT TERM EXIT
wait "$child"
trap - INT TERM EXIT
