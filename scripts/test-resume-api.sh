#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
RESUME_FILE="${1:-}"

if [[ -z "${RESUME_FILE}" ]]; then
  echo "Usage: BASE_URL=http://localhost:3000 bash scripts/test-resume-api.sh /absolute/path/to/resume.pdf"
  exit 1
fi

if [[ ! -f "${RESUME_FILE}" ]]; then
  echo "File not found: ${RESUME_FILE}"
  exit 1
fi

echo "[1/2] Upload + parse resume via ${BASE_URL}/api/upload/resume"
UPLOAD_RESPONSE="$(curl -sS -X POST "${BASE_URL}/api/upload/resume" -F "file=@${RESUME_FILE}")"
echo "${UPLOAD_RESPONSE}"

RESUME_ID="$(echo "${UPLOAD_RESPONSE}" | sed -n 's/.*"resume_id":"\([^"]*\)".*/\1/p')"
if [[ -z "${RESUME_ID}" ]]; then
  echo "No resume_id returned from upload endpoint."
  exit 1
fi

echo
echo "[2/2] Re-parse stored resume via ${BASE_URL}/api/resume/parse"
curl -sS -X POST "${BASE_URL}/api/resume/parse" \
  -H "Content-Type: application/json" \
  -d "{\"resume_id\":\"${RESUME_ID}\"}"
echo
