#!/bin/sh

if [ -z "$WX2_ADMIN_WEB_CLIENT_HOME" ]; then
    echo "Error: no env var 'WX2_ADMIN_WEB_CLIENT_HOME' defined, please run './setup.sh'"
    exit 1
fi

if [ $# -lt 1 ]; then
  echo "usage: `basename $0` <user_label>"
  echo ""
  echo "Get managed orgs for a given user label."
  echo "- See 'https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/blob/master/test/api_sanity/test_helper.js' for user labels available for use"
  echo ""
  echo "ex."
  echo "  `basename $0` partner-admin"
  echo ""
  echo "ex."
  echo "  `basename $0` seattle-partner"
  exit 1
fi

source $WX2_ADMIN_WEB_CLIENT_HOME/bin/include/curl-api-helpers

usr_label="$1"
org_id="`get_auth_info $usr_label | get_org_id`"

$WX2_ADMIN_WEB_CLIENT_HOME/bin/curl-atlas $usr_label GET --silent "/organizations/$org_id/managedOrgs"
