#!/usr/bin/env sh
# Usage: REGISTRY=ghcr.io/youruser ./scripts/docker-push.sh
set -eu
if [ -z "${REGISTRY:-}" ]; then
  echo "Set REGISTRY, e.g. REGISTRY=ghcr.io/youruser or REGISTRY=docker.io/youruser" >&2
  exit 1
fi
cd "$(dirname "$0")/.."
docker build -t dsvgoapp:0.1 .
docker tag dsvgoapp:0.1 "${REGISTRY}/dsvgoapp:0.1"
docker push "${REGISTRY}/dsvgoapp:0.1"
echo "Pushed ${REGISTRY}/dsvgoapp:0.1"
