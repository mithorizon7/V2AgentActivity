#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
# Use the verified runtime's bundled trust store, not inherited loaders/overrides.
unset NODE_OPTIONS NODE_PATH NODE_EXTRA_CA_CERTS NODE_USE_SYSTEM_CA NODE_TLS_REJECT_UNAUTHORIZED
unset SSL_CERT_FILE SSL_CERT_DIR OPENSSL_CONF OPENSSL_CONF_INCLUDE OPENSSL_MODULES OPENSSL_ENGINES
# The build packages the exact runtime it validated; never use the older host Node.
runtime="$PWD/dist/node-runtime/node"
"$runtime" scripts/check-runtime.mjs
export NODE_ENV=production
exec "$runtime" dist/index.js
