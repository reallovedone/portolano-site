#!/usr/bin/env bash
# Re-copies the design tokens from the app repository (read-only access to ../portolano).
# The copy is verbatim, preceded by a provenance comment.
set -euo pipefail

SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${SITE_DIR}/../portolano"
SRC_REL="ui/src/lib/design/tokens.css"
SRC="${APP_DIR}/${SRC_REL}"
DEST="${SITE_DIR}/src/styles/tokens.css"

if [ ! -d "${APP_DIR}" ]; then
  echo "error: the app repository was not found at ${APP_DIR}." >&2
  echo "Place it next to the site folder (../portolano) and run this script again." >&2
  exit 1
fi
if [ ! -f "${SRC}" ]; then
  echo "error: ${SRC} does not exist." >&2
  exit 1
fi

COMMIT="$(git -C "${APP_DIR}" --no-optional-locks rev-parse --short HEAD)"

{
  echo "/* Copied verbatim from the Portolano app: ${SRC_REL} @ ${COMMIT}."
  echo "   Do not edit here. Run scripts/sync-tokens.sh to refresh. Web-only additions live in web.css. */"
  cat "${SRC}"
} > "${DEST}"

echo "Copied ${SRC_REL} (commit ${COMMIT}) to src/styles/tokens.css"
