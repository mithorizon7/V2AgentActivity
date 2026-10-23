#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
# Do not inherit loaders, certificate-store selection, or TLS bypass settings.
unset NODE_OPTIONS NODE_PATH NODE_EXTRA_CA_CERTS NODE_USE_SYSTEM_CA NODE_TLS_REJECT_UNAUTHORIZED
unset SSL_CERT_FILE SSL_CERT_DIR OPENSSL_CONF OPENSSL_CONF_INCLUDE OPENSSL_MODULES OPENSSL_ENGINES
export PINNED_NODE_RUNTIME=1
# Installation, compilation and serving use the same checksum-verified runtime.
exec sh scripts/with-runtime.sh sh -c 'npm ci --ignore-scripts --no-audit && npm run build:app && npm prune --omit=dev --ignore-scripts --no-audit'
