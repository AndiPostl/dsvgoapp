#!/usr/bin/env sh
# Build and push dsvgoapp:0.1 (Podman or Docker).
#
# Usage:
#   podman login docker.io
#   ./scripts/docker-push.sh
#
# Override registry namespace:
#   REGISTRY=docker.io/otheruser ./scripts/docker-push.sh

set -eu

if command -v podman >/dev/null 2>&1; then
  CTR=podman
else
  CTR=docker
fi

REGISTRY="${REGISTRY:-docker.io/andreaspostl}"
# Normalize: Docker Hub allows docker.io/user or user/ for the same namespace
case "$REGISTRY" in
  */*) ;;
  *) REGISTRY="docker.io/${REGISTRY}" ;;
esac

cd "$(dirname "$0")/.."
echo "Using: $CTR → ${REGISTRY}/dsvgoapp:0.1"
"$CTR" build -t dsvgoapp:0.1 .
"$CTR" tag dsvgoapp:0.1 "${REGISTRY}/dsvgoapp:0.1"
"$CTR" push "${REGISTRY}/dsvgoapp:0.1"
echo "Pushed ${REGISTRY}/dsvgoapp:0.1"
