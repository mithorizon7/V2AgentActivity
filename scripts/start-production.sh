#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
# The build packages the exact runtime it validated; never use the older host Node.
runtime="$PWD/dist/node-runtime/node"
"$runtime" scripts/check-runtime.mjs
export NODE_ENV=production
exec "$runtime" dist/index.js
