#!/bin/bash

if [ -z "${WX2_ADMIN_WEB_CLIENT_HOME}" ]; then
    >&2 echo "Error: WX2_ADMIN_WEB_CLIENT_HOME is not set, please export this environment variable first."
    exit 1
fi

node ${WX2_ADMIN_WEB_CLIENT_HOME}/bin/helpers/print-json-full-keys.js ${WX2_ADMIN_WEB_CLIENT_HOME}/app/l10n/en_US.json
