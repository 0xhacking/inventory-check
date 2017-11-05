#!/bin/sh

if [ $# -lt 2 ]; then
  echo "usage: `basename $0` <user_label> <org_id> [--force]"
  echo ""
  echo "Remove a test organization in Huron and Atlas."
  echo "- See 'https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/blob/master/test/api_sanity/test_helper.js' for user labels available for use"
  echo ""
  echo "ex. Delete from Huron and if successful, then Atlas"
  echo "  `basename $0` seattle-partner <org_id>"
  echo ""
  echo "ex. Delete from Huron and regardless of failure, then Atlas"
  echo "  `basename $0` seattle-partner <org_id> --force"
  exit 1
fi

if [ -z "$WX2_ADMIN_WEB_CLIENT_HOME" ]; then
  echo "Error: no env var 'WX2_ADMIN_WEB_CLIENT_HOME' defined, please run './setup.sh'"
  return 1
fi

user_label=$1
org_id=$2
option_force=$3

# API endpoints
ci_scim_org_path="/Orgs/${org_id}"
huron_org_path="/common/customers/${org_id}"
atlas_org_path="/organizations/${org_id}"

# only want http status codes from responses 200 for GET, 204 for DELETE
curl_args="--write-out %{http_code} --silent --output /dev/null"

# curl request method (keep around 'GET' for debugging)
# method=GET
method=DELETE

# TODO: revisit and combine 'is_org_id_accessible_in_ci' and 'is_test_org' to use 1 round-trip instead of 2
function is_org_id_accessible_in_ci {
  # query the org in CI SCIM, and look at the http status code
  local status_code="`$WX2_ADMIN_WEB_CLIENT_HOME/bin/curl-ci $user_label GET ${curl_args} ${ci_scim_org_path}`"

  if [ $status_code -ne 401 ]; then
    return 0
  else
    return 1
  fi
}

function is_test_org {
  # query the org in CI SCIM, and look at the 'isTestOrg' property value
  local ret="`$WX2_ADMIN_WEB_CLIENT_HOME/bin/curl-ci $user_label GET --silent ${ci_scim_org_path} | \
    python -c \"import json,sys; data=json.load(sys.stdin); print ('isTestOrg' in data and data['isTestOrg'])\"`"

  if [ "$ret" = "True" ]; then
    return 0
  else
    return 1
  fi
}

function nuke_org {
  local cmd_string="$1"
  resp_status_code=`eval "$cmd_string"`
  if [ ${resp_status_code} -ne 200 -a ${resp_status_code} -ne 204 ]; then
    echo "FAIL (response status: ${resp_status_code})"
    return 1
  else
    echo "OK"
    return 0
  fi
}

function abort {
  echo "Aborting."
  exit 1
}

# check if is accessible for this user in CI, and is a test org
if ! is_org_id_accessible_in_ci; then
  echo "Error: '${org_id}' is not accessible for this user in CI."
  abort
fi

if ! is_test_org; then
  echo "Error: '${org_id}' is either not accessible for this user, or is not a test org in CI."
  abort
fi

# delete from Huron
echo -n "[INFO] Deleting org '$org_id' from Huron (integration): "
nuke_org "$WX2_ADMIN_WEB_CLIENT_HOME/bin/curl-huron ${user_label} ${method} ${curl_args} ${huron_org_path}"

if [ "$option_force" != "--force" ]; then
  if [ $? ]; then
    abort
  fi
fi

# delete from Atlas
echo -n "[INFO] Deleting org '$org_id' from Atlas (integration): "
nuke_org "$WX2_ADMIN_WEB_CLIENT_HOME/bin/curl-atlas ${user_label} ${method} ${curl_args} ${atlas_org_path}"
