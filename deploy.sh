#!/usr/bin/env bash

set -euo pipefail

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI is required but was not found on PATH." >&2
  exit 127
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
buckets=("zapman.uk" "www.zapman.uk")

cd "$script_dir"

for bucket in "${buckets[@]}"; do
  echo "Deploying Zapman to s3://${bucket}/"
  aws s3 cp . "s3://${bucket}/" \
    --recursive \
    --exclude ".git/*" \
    --exclude "deploy.sh" \
    --only-show-errors \
    "$@"
done

echo "Zapman deployed to both S3 buckets."
