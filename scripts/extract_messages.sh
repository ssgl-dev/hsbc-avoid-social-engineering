#!/usr/bin/env bash

# Extract and update gettext catalogs for the project.
# Focuses on the unified 'messages' domain (aggregated strings across templates & python).
# Existing per-page .po files are left untouched; only translations/zh/LC_MESSAGES/messages.po is updated.
#
# Usage:
#   ./scripts/extract_messages.sh                # Extract + update zh + show stats
#   LANGUAGES="zh fr" ./scripts/extract_messages.sh   # (Future) include more locales
#   DRY_RUN=1 ./scripts/extract_messages.sh      # Perform extraction without updating catalogs
#
# Requirements: pybabel (installed via project dependencies)

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

CFG_FILE="babel.cfg"
POT_FILE="translations/messages.pot"
TRANS_DIR="translations"
DOMAIN="messages"

if [[ ! -f "$CFG_FILE" ]]; then
  echo "[error] Missing $CFG_FILE at project root." >&2
  exit 1
fi

if [[ ! -d "$TRANS_DIR" ]]; then
  echo "[error] Missing $TRANS_DIR directory." >&2
  exit 1
fi

# Default languages (extend by setting LANGUAGES environment variable)
LANGUAGES=${LANGUAGES:-"zh"}

echo "[info] Extracting strings (domain=$DOMAIN) using $CFG_FILE ..."
pybabel extract -F "$CFG_FILE" -o "$POT_FILE" .

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "[dry-run] Skipping catalog updates (POT generated at $POT_FILE)"
  exit 0
fi

for lang in $LANGUAGES; do
  PO_DIR="$TRANS_DIR/$lang/LC_MESSAGES"
  PO_FILE="$PO_DIR/$DOMAIN.po"
  if [[ ! -d "$PO_DIR" ]]; then
    echo "[info] Creating directory structure for $lang";
    mkdir -p "$PO_DIR"
  fi

  if [[ -f "$PO_FILE" ]]; then
    echo "[info] Updating existing catalog: $PO_FILE"
    pybabel update -d "$TRANS_DIR" -l "$lang" -i "$POT_FILE" -D "$DOMAIN" --ignore-obsolete || true
  else
    echo "[info] Initializing new catalog: $PO_FILE"
    pybabel init -d "$TRANS_DIR" -l "$lang" -i "$POT_FILE" -D "$DOMAIN"
  fi
done

echo "[info] (Optional) Compile catalogs with ./compile_mo.sh"
