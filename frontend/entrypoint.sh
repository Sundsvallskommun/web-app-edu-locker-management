#!/bin/sh
# Replaces the build-time placeholders from .env-cicd with the container's runtime environment.
# Only NEXT_PUBLIC_* values (and DOMAIN_NAME, which is serialized into the Next config) need this;
# server-only variables such as HEALTH_* are read from process.env at runtime.

replace_env_var() {
  placeholder=$1
  value=$2

  if [ "$value" = "__UNSET__" ]; then
    echo "Warning: ${placeholder} has no value, skipping..."
  else
    echo "Replacing ${placeholder}..."
    find /app/.next -type f -name "*.js" -exec sed -i \
      "s|${placeholder}|${value}|g" {} +
  fi

  return 0
}

echo "Running as user: $(id)"
echo "Replacing runtime environment variables..."

replace_env_var "NEXT_PUBLIC_APP_NAME_PLACEHOLDER" "${NEXT_PUBLIC_APP_NAME:-__UNSET__}"
replace_env_var "NEXT_PUBLIC_API_URL_PLACEHOLDER" "${NEXT_PUBLIC_API_URL:-__UNSET__}"
replace_env_var "DOMAIN_NAME_PLACEHOLDER" "${DOMAIN_NAME:-__UNSET__}"

echo "Starting Next.js..."
exec node server.js
