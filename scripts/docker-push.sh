#!/usr/bin/env sh
# dsvgoapp — build / run / push (Podman if available, else Docker)
set -eu

if command -v podman >/dev/null 2>&1; then
  CTR=podman
else
  CTR=docker
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMG_LOCAL=dsvgoapp:0.1
REGISTRY="${REGISTRY:-docker.io/andreaspostl}"
case "$REGISTRY" in
  */*) ;;
  *) REGISTRY="docker.io/${REGISTRY}" ;;
esac
HOST_PORT="${PORT:-3000}"
DATA_DIR="${DATA_DIR:-$ROOT/dsvgoapp-data}"

usage() {
  cat <<EOF
dsvgoapp — build / run / push (uses: $CTR)

Usage:
  $0 <command>

Commands:
  help         Show this help (default when no arguments are given)
  build        Build image $IMG_LOCAL
  run          Run container (foreground): port \$PORT → 3000, volume \$DATA_DIR → /app/data
  build_run    build, then run
  push         build, tag ${REGISTRY}/dsvgoapp:0.1, push to registry (requires login)

Environment (optional):
  REGISTRY     Default: docker.io/andreaspostl  (override: REGISTRY=docker.io/otheruser)
  PORT         Host port for run / build_run (default: 3000)
  DATA_DIR     Host folder persisted to /app/data (default: $ROOT/dsvgoapp-data)

Examples:
  $0
  $0 help
  $0 build
  PORT=8080 $0 run
  REGISTRY=docker.io/myuser $0 push

Docker Hub login (before push):
  $CTR login docker.io
  $CTR login registry-1.docker.io
EOF
}

cmd_build() {
  echo "[$CTR] build -t $IMG_LOCAL ($ROOT)"
  (cd "$ROOT" && "$CTR" build -t "$IMG_LOCAL" .)
}

cmd_run() {
  mkdir -p "$DATA_DIR"
  echo "[$CTR] run $IMG_LOCAL — http://127.0.0.1:${HOST_PORT}/ — data: $DATA_DIR"
  (cd "$ROOT" && "$CTR" run --rm -p "${HOST_PORT}:3000" -v "$DATA_DIR:/app/data" "$IMG_LOCAL")
}

cmd_push() {
  hub_namespace="${REGISTRY#docker.io/}"
  hub_namespace="${hub_namespace%%/*}"

  login_docker_io="$("$CTR" login --get-login docker.io 2>/dev/null || true)"
  login_reg1="$("$CTR" login --get-login registry-1.docker.io 2>/dev/null || true)"

  if [ -z "$login_docker_io" ] && [ -z "$login_reg1" ]; then
    echo "Not logged in to Docker Hub for $CTR." >&2
    echo "Run:" >&2
    echo "  $CTR login docker.io" >&2
    echo "  $CTR login registry-1.docker.io   # if push fails on blob reuse" >&2
    exit 1
  fi

  if [ -n "$login_docker_io" ] && [ "$login_docker_io" != "$hub_namespace" ]; then
    echo "Note: docker.io login is '$login_docker_io', push namespace is '$hub_namespace'." >&2
    echo "Use REGISTRY=docker.io/\$yourhubuser if needed." >&2
  fi

  cmd_build
  echo "[$CTR] tag + push ${REGISTRY}/dsvgoapp:0.1"
  "$CTR" tag "$IMG_LOCAL" "${REGISTRY}/dsvgoapp:0.1"
  "$CTR" push "${REGISTRY}/dsvgoapp:0.1"
  echo "Pushed ${REGISTRY}/dsvgoapp:0.1"
}

if [ $# -eq 0 ]; then
  usage
  exit 0
fi

case "$1" in
  -h | --help | help)
    usage
    exit 0
    ;;
  build)
    cmd_build
    ;;
  run)
    cmd_run
    ;;
  build_run)
    cmd_build
    cmd_run
    ;;
  push)
    cmd_push
    ;;
  *)
    echo "Unknown command: $1" >&2
    echo >&2
    usage >&2
    exit 1
    ;;
esac
