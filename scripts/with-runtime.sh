#!/bin/sh
# Production requires the verified official build even if the host is patched.
# Development may use a compliant installed runtime on other platforms.
set -eu
cd "$(dirname "$0")/.."
if [ "${PINNED_NODE_RUNTIME:-0}" != 1 ] && node scripts/check-runtime.mjs >/dev/null 2>&1; then
  exec "$@"
fi
if [ "$(uname -s)" != Linux ] || [ "$(uname -m)" != x86_64 ]; then
  echo "Install Node 24.22.1+ (24.x) for this platform before continuing." >&2
  exit 1
fi
runtime="$PWD/.runtime/node-v24.22.1-linux-x64"
archive="$PWD/.runtime/node-v24.22.1-linux-x64.tar.xz"
checksum=6c172a9ab6718f7b801fb5a7bd486af2ee5e32758086a04b84fcce2aa77095e6
mkdir -p "$PWD/.runtime"
if [ ! -f "$archive" ]; then
  temporary_archive=$(mktemp "$archive.XXXXXX")
  trap 'rm -f "$temporary_archive"' EXIT HUP INT TERM
  curl --proto '=https' --proto-redir '=https' --tlsv1.2 --fail --silent --show-error --location \
    --connect-timeout 15 --max-time 180 --retry 3 --retry-all-errors \
    https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.xz \
    -o "$temporary_archive"
  printf '%s  %s\n' "$checksum" "$temporary_archive" | sha256sum --check --status
  mv "$temporary_archive" "$archive"
  trap - EXIT HUP INT TERM
fi
printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check --status
# Re-extract from the verified archive, rather than trusting cached executables.
tar -xJf "$archive" -C "$PWD/.runtime"
export PATH="$runtime/bin:$PATH"
node scripts/check-runtime.mjs
exec "$@"
