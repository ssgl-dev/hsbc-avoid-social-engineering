#!/usr/bin/env bash

# Compile all .po files in translations/<language>/LC_MESSAGES/ to .mo files
# Each .po file is treated as a separate domain (e.g., index.po -> index domain)
# Uses pybabel compile with explicit domain specification for each .po file

TRANS_DIR="translations"

# Check if translations directory exists
if [[ ! -d "$TRANS_DIR" ]]; then
  echo "Error: $TRANS_DIR not found." >&2
  exit 1
fi

# Find all .po files in translations/*/LC_MESSAGES/
shopt -s nullglob
found=0
for po_file in "$TRANS_DIR"/zh/LC_MESSAGES/*.po; do
  found=1
  # Extract domain from .po filename (e.g., index.po -> index)
  domain=$(basename "$po_file" .po)

  echo "[info] Compiling $po_file (domain: $domain, language: zh)"
  # Compile the .po file to .mo with explicit domain
  if pybabel compile -d "$TRANS_DIR" -l zh -D "$domain" --statistics; then
    echo "[done] Compiled $domain.po to $domain.mo for language zh"
  else
    echo "[error] Failed to compile $domain.po for language zh" >&2
    continue
  fi
  echo
done