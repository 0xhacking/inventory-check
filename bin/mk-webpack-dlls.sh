#!/bin/bash

if [ -z "${WX2_ADMIN_WEB_CLIENT_HOME}" ]; then
    >&2 echo "Error: WX2_ADMIN_WEB_CLIENT_HOME is not set, please export this environment variable first."
    exit 1
fi

cd "${WX2_ADMIN_WEB_CLIENT_HOME}"

# must have env var 'WP__ENABLE_DLL' defined to something truthy to run
if [ ! -n "${WP__ENABLE_DLL}" \
    -a "${WP__ENABLE_DLL}" != "1" \
    -a "$(echo ${WP__ENABLE_DLL} | tr '[:upper:]' '[:lower:]')" != "true" ]; then
    >&2 echo "Error: WP__ENABLE_DLL not set, please run \`export WP__ENABLE_DLL=1\` to use this script."
    exit 1
fi

webpack --config ./webpack/dll-deps.config.js "$@"
