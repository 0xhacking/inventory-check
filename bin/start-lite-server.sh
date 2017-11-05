#!/bin/bash

# notes:
# - in certain cases, 'lite-server' is not shutdown properly when the wrapping npm script (ie.
#   'npm start' or 'npm run serve') dies
# - when the lingering 'lite-server' process holds onto the default port (8000), subsequent npm
#   script commands launch a new 'lite-server' which listen on non-default port values, which will
#   not function correctly due to our whitelist CSP policies
# - use of typical 'ps' and 'grep' commands to acquire the correct PIDs to kill will unintentionally
#   include the PIDs of the npm script itself, thus killing the killer before it can kill
# - the logic to properly acquire and filter the correct PIDs became involved enough to warrant
#   moving into its own script here

if [ -z "$WX2_ADMIN_WEB_CLIENT_HOME" ]; then
    >&2 echo "Error: WX2_ADMIN_WEB_CLIENT_HOME is not set, please export this environment variable first."
    exit 1
fi

source "$WX2_ADMIN_WEB_CLIENT_HOME/bin/include/pid-helpers"

function ex_usage {
    echo "usage: $(basename "$0") (dev|dist) [--nolint]"
    echo ""
    echo "ex."
    echo "  $(basename "$0") dev"
    echo ""
    echo "ex."
    echo "  $(basename "$0") dev --nolint"
    echo ""
    echo "ex."
    echo "  $(basename "$0") dist"
    exit 1
}

# early out if looking for usage
if [[ "$1" == "--help" \
    || "$1" == "-h" \
    || "$1" == "-?" \
    || $# -lt 1 ]]; then
    ex_usage
    exit 1
fi

# allow pass-through args after first arg
pass_through_args=( $@ )
unset -v pass_through_args[0]

kill_wait "lite-server"

env_suffix="$1"
lite-server -c "$WX2_ADMIN_WEB_CLIENT_HOME/config/lite-server-${env_suffix}.js" "${pass_through_args[@]}"
