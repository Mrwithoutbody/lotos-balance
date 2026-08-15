#!/usr/bin/env bash
# Wysyła seed/ do bucketa lotos-balance (konto dadmor) przez S3 API.
# Wymaga w .dev.vars: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
# Użycie: bash scripts/upload-deck.sh
set -euo pipefail
cd "$(dirname "$0")/.."

ENDPOINT="https://5a287190ae8f5ac619b428b7ed01adbd.eu.r2.cloudflarestorage.com/lotos-balance"

# shellcheck disable=SC1091
source <(grep -E '^R2_' .dev.vars | sed 's/^/export /')
: "${R2_ACCESS_KEY_ID:?Brak R2_ACCESS_KEY_ID w .dev.vars}"
: "${R2_SECRET_ACCESS_KEY:?Brak R2_SECRET_ACCESS_KEY w .dev.vars}"

content_type() {
  case "$1" in
    *.json) echo application/json ;;
    *.webp) echo image/webp ;;
    *.mp3) echo audio/mpeg ;;
    *.mp4) echo video/mp4 ;;
    *) echo application/octet-stream ;;
  esac
}

find seed -type f | while read -r file; do
  key="${file#seed/}"
  curl -sfS -X PUT "$ENDPOINT/$key" \
    --aws-sigv4 "aws:amz:auto:s3" \
    --user "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" \
    -H "Content-Type: $(content_type "$file")" \
    --data-binary "@$file" \
    -o /dev/null
  echo "OK $key"
done
