#!/bin/bash

set -x
if [ -z "${WX2_ADMIN_WEB_CLIENT_HOME}" ]; then
    >&2 echo "Error: WX2_ADMIN_WEB_CLIENT_HOME is not set, please export this environment variable first."
    exit 1
fi

# import helper functions
source "${WX2_ADMIN_WEB_CLIENT_HOME}/bin/include/pid-helpers"
source "${WX2_ADMIN_WEB_CLIENT_HOME}/bin/include/curl-api-helpers"

# import jenkins env variables
source "${WX2_ADMIN_WEB_CLIENT_HOME}/.jenkins-build-env-vars"

# Cleanup tcp processed from previous jobs
kill_wait "lite-server"

npm run serve-dist -- --noopen &
# poll on web webserver at root context until it comes up
while [ $( curl_http_status "http://127.0.0.1:8000/" ) -ne 200 ]; do
    sleep 2;
done

# update webdriver
npm run webdriver

# Run a different test suite if this is a nightly build
if [ $NIGHTLY ]; then
    test_suite="--specs=test/e2e-protractor/nightly/*_spec.js"
    export E2E_RUN_COUNTER_MAX=0
else
    test_suite="--suite jenkins"
fi

# notes:
# - run e2e directly to acquire exit status (npm wraps any non-zero status and re-exits with 1)
# - exit status meaning:
#   - 1 => tests failed (sauce link available)
#   - 100 => protractor terminated abnormally (no sauce link available)
# - write exit status to temp file (used later to determine whether to set the build 'UNSTABLE')
node ./protractor/e2e --production-backend ${test_suite} --sauce
e2e_exit_code=$?
echo "$e2e_exit_code" > "${WX2_ADMIN_WEB_CLIENT_HOME}/.cache/${E2E_EXIT_CODE_FILE}"

kill_wait "lite-server"
set +x
