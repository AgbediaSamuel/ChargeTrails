#!/usr/bin/env bash
set -euo pipefail


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

PORT="${1:-${PORT:-8000}}"
HOST="${HOST:-127.0.0.1}"
RELOAD="${RELOAD:-true}"

ARGS=(backend.app.main:app --host "${HOST}" --port "${PORT}")
if [[ "${RELOAD}" == "true" ]]; then
  ARGS+=(--reload)
fi

if command -v poetry >/dev/null 2>&1; then
  exec poetry run uvicorn "${ARGS[@]}"
else
  exec uvicorn "${ARGS[@]}"
fi


