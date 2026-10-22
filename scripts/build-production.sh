#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
# Installation must use the same patched runtime as compilation and serving.
exec sh scripts/with-runtime.sh sh -c 'npm ci --ignore-scripts --no-audit && npm run build:app && npm prune --omit=dev --ignore-scripts --no-audit'
