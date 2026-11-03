#!/usr/bin/env bash
set -euo pipefail

expected="create-modern-mern-app v${1:?Expected release version}"
scratch=$(mktemp -d)
trap 'rm -rf -- "$scratch"' EXIT
observed=''
for attempt in {1..10}; do
  dir="$scratch/$attempt"
  mkdir -p "$dir/project" "$dir/home"
  if output=$(cd "$dir/project" && env -i PATH="$PATH" HOME="$dir/home" \
    npm_config_cache="$dir/cache" npm_config_registry=https://registry.npmjs.org/ \
    timeout 30s npx --yes --prefer-online create-modern-mern-app@latest --version); then
    observed=$(printf '%s\n' "$output" | tr -d '\r' | tail -n 1)
    if [[ "$observed" == "$expected" ]]; then
      echo "Verified: @latest installs $expected." | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}"
      exit 0
    fi
    echo "Attempt $attempt: expected $expected, received $observed."
  else
    echo "Attempt $attempt: the public install command failed."
  fi
  if [[ "$attempt" != 10 ]]; then sleep 15; fi
done

message="Publication succeeded, but the public @latest install could not be verified. Expected $expected."
if [[ -n "$observed" ]]; then message+=" Last successful probe returned $observed."; fi
echo "$message" | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}"
exit 1
