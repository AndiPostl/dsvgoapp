#!/usr/bin/env sh
# Build and push dsvgoapp:0.1 (Podman or Docker).
#
# Usage:
#   podman login docker.io
#   # optional if push still fails with "denied" on blob check:
#   podman login registry-1.docker.io
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

hub_namespace="${REGISTRY#docker.io/}"
hub_namespace="${hub_namespace%%/*}"

cd "$(dirname "$0")/.."

login_docker_io="$("$CTR" login --get-login docker.io 2>/dev/null || true)"
login_reg1="$("$CTR" login --get-login registry-1.docker.io 2>/dev/null || true)"

if [ -z "$login_docker_io" ] && [ -z "$login_reg1" ]; then
  echo "Not logged in to Docker Hub for $CTR." >&2
  echo "Run (use your Docker Hub username; password = access token or account password):" >&2
  echo "  $CTR login docker.io" >&2
  echo "If push still fails with \"denied\" on blob reuse, also run:" >&2
  echo "  $CTR login registry-1.docker.io" >&2
  echo "Token: https://hub.docker.com/settings/security" >&2
  exit 1
fi

if [ -n "$login_docker_io" ] && [ "$login_docker_io" != "$hub_namespace" ]; then
  echo "Note: logged in to docker.io as '$login_docker_io', pushing to namespace '$hub_namespace'." >&2
  echo "These must match for a personal repo, or your user must have write access to an org namespace." >&2
  echo "To push under your user: REGISTRY=docker.io/${login_docker_io} $0" >&2
fi

echo "Using: $CTR → ${REGISTRY}/dsvgoapp:0.1 (docker.io login: ${login_docker_io:-<none>}, registry-1: ${login_reg1:-<none>})"
"$CTR" build -t dsvgoapp:0.1 .
"$CTR" tag dsvgoapp:0.1 "${REGISTRY}/dsvgoapp:0.1"
"$CTR" push "${REGISTRY}/dsvgoapp:0.1"
echo "Pushed ${REGISTRY}/dsvgoapp:0.1"
