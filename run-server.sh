#!/usr/bin/env bash
set -euo pipefail

# Ensure uv is installed and on PATH
if ! command -v uv >/dev/null 2>&1; then
  echo "uv CLI not found on PATH. Install from https://docs.astral.sh/uv/getting-started/" >&2
  exit 1
fi

export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8000}"
export RELOAD="${RELOAD:-false}"

echo "Starting server on $HOST:$PORT (reload=$RELOAD) using uv..."
exec uv run server.py
