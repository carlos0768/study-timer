#!/usr/bin/env bash
#
# fix-pwa-icons.sh - Regenerate PWA icons and rebuild project safely.
#
# Usage:
#   ./fix-pwa-icons.sh [-l <logo.png>] [-a <assets_dir>] [-b]
#
# Options:
#   -l <logo>   Path to source logo (default: ./public/logo.png)
#   -a <dir>    Output directory for generated assets (default: ./assets)
#   -b          Skip project build/start step
#   -h          Show this help and exit
#
# Requirements:
#   - Node.js/npm
#   - pwa-asset-generator (will be installed locally if missing)
#   - bash 4+
#
# Example:
#   ./fix-pwa-icons.sh -l ./public/my-logo.png -a ./src/assets
#

set -Eeuo pipefail

### ──────────────────────────────  Constants  ────────────────────────────── ###
SCRIPT_NAME="$(basename "$0")"
GREEN='\033[0;32m'
BLUE='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # reset

### ──────────────────────────────  Functions  ────────────────────────────── ###
usage() { grep -E '^# ' "$0" | sed 's/^# //' >&2; exit 1; }

log() { printf "${BLUE}▶ %s${NC}\n" "$*"; }
ok()  { printf "${GREEN}✔ %s${NC}\n" "$*"; }
err() { printf "${RED}✖ %s${NC}\n" "$*" >&2; exit 1; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || err "Command '$1' not found."; }

cleanup_icons() {
  local dir=$1
  log "Removing old icon files in ${dir}"
  rm -f "${dir}"/icon-{192,512}.png
}

generate_icons() {
  local logo=$1
  local dir=$2

  log "Generating new icons from ${logo}"
  npx -y pwa-asset-generator \
      "${logo}" "${dir}" \
      --type png --background transparent --path /assets
  ok "Icons generated in ${dir}"
}

build_project() {
  log "Building project..."
  npm run build
  log "Starting dev/prod server..."
  npm start
  ok "Project rebuilt & running."
}

### ──────────────────────────────  Options  ──────────────────────────────── ###
LOGO="./public/logo.png"
ASSETS_DIR="./assets"
SKIP_BUILD=false

while getopts ":l:a:bh" opt; do
  case "${opt}" in
    l) LOGO="${OPTARG}" ;;
    a) ASSETS_DIR="${OPTARG}" ;;
    b) SKIP_BUILD=true ;;
    h) usage ;;
    *) usage ;;
  esac
done

### ──────────────────────────────  Validations  ──────────────────────────── ###
need_cmd npm
need_cmd npx
[ -f "${LOGO}" ] || err "Logo file '${LOGO}' not found."
mkdir -p "${ASSETS_DIR}"

### ──────────────────────────────  Main Flow  ────────────────────────────── ###
log "=== ${SCRIPT_NAME} started ==="
cleanup_icons "${ASSETS_DIR}"
generate_icons "${LOGO}" "${ASSETS_DIR}"

if ! ${SKIP_BUILD}; then
  build_project
else
  log "Build step skipped (-b)."
fi

ok "All tasks completed successfully."