#!/bin/bash

REALM=c054027f-c5bd-4598-8cd8-07c08163e8cd
USER_ID=atlaspartneradmin@atlas.test.com
USER_PASSWD=C1sc0123!
# USER_ID and USER_PASSWD should be url-encoded
URL=https://idbroker.webex.com/idb
COOKIE=cisPRODiPlanetDirectoryPro
CLIENT_ID=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec
CLIENT_SECRET=c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857
TMP_FILE=/tmp/http-header.$$

# Get a sso token
curl -k --request POST -H "Content-Type:application/x-www-form-urlencoded" --data "IDToken1=$USER_ID&IDToken2=$USER_PASSWD" $URL/UI/Login?org=$REALM -D $TMP_FILE -s > /dev/null
SET_CI_COOKIE=`grep -m1 "^Set-Cookie: $COOKIE" $TMP_FILE`
if [ "$?" != "0" ]; then
    echo "No CI cookie"
    exit 1
fi
SSO_TOKEN=`echo $SET_CI_COOKIE | sed -e "s/^Set-Cookie: \(.*\); Domain=.*/\1/g" | cut -d "=" -f2-`
if [ "$?" != "0" ]; then
    echo "Null CI Token"
    exit 2
else
    echo SSOTOKEN=$SSO_TOKEN
fi
rm -rf $TMP_FILE

echo
# Get an authorization code
CMD="curl --cookie \"amlbcookie=01;$COOKIE=$SSO_TOKEN\" --data \"response_type=code&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&client_id=$CLIENT_ID&scope=Identity%3ASCIM+Identity%3AOrganization+Identity%3AConfig&realm=/$REALM&state=this-should-be-a-random-string-for-security-purpose\" -k $URL/oauth2/v1/authorize 2>/dev/null"
CODE=`eval $CMD | grep code | cut -d "=" -f2-| cut -d "<" -f1`
echo AuthzCode=$CODE

# Get an access token using the code
CMD="curl --request POST --user \"$CLIENT_ID:$CLIENT_SECRET\" --data \"grant_type=authorization_code&code=$CODE&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob\" -k $URL/oauth2/v1/access_token 2>/dev/null"
TOKEN=`eval $CMD | cut -d ":" -f6 | sed 's/\"//g' | sed 's/\}//' `
echo AccessToken=$TOKEN

IDENTITY_API_URL=https://identity.webex.com
curl -k --request PATCH --header "Content-Type: application/json" --header "Authorization: Bearer $TOKEN" --data '{"schemas":[ "urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0" ],"meta": {"attributes": [ "managedOrgs" ]}}' $IDENTITY_API_URL/identity/scim/c054027f-c5bd-4598-8cd8-07c08163e8cd/v1/Users/17256dc8-db74-41b5-8a7c-e20e4f594a0a
