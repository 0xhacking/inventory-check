(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OAuthConfig', OAuthConfig);

  function OAuthConfig(Utils, Config, UrlConfig) {

    var oauth2Scope = encodeURIComponent('webexsquare:admin ciscouc:admin Identity:SCIM Identity:Config Identity:Organization cloudMeetings:login webex-messenger:get_webextoken ccc_config:admin');

    var config = {
      oauthClientRegistration: {
        atlas: {
          id: 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec',
          secret: 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857',
        },
        cfe: {
          id: 'C5469b72a6de8f8f0c5a23e50b073063ea872969fc74bb461d0ea0438feab9c03',
          secret: 'b485aae87723fc2c355547dce67bbe2635ff8052232ad812a689f2f9b9efa048',
        }
      },
      oauthUrl: {
        ciRedirectUrl: 'redirect_uri=%s',
        oauth2UrlAtlas: 'https://idbroker.webex.com/idb/oauth2/v1/',
        oauth2UrlCfe: 'https://idbrokerbts.webex.com/idb/oauth2/v1/',
        oauth2LoginUrlPattern: '%sauthorize?response_type=code&client_id=%s&scope=%s&redirect_uri=%s&state=%s&service=%s&email=%s',
        oauth2ClientUrlPattern: 'grant_type=client_credentials&scope=',
        oauth2CodeUrlPattern: 'grant_type=authorization_code&code=%s&scope=',
        oauth2AccessCodeUrlPattern: 'grant_type=refresh_token&refresh_token=%s&scope=%s'
      },
      logoutUrl: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=',
    };

    return {
      getLogoutUrl: getLogoutUrl,
      getOauthLoginUrl: getOauthLoginUrl,
      getAccessTokenUrl: getAccessTokenUrl,
      getOauthAccessCodeUrl: getOauthAccessCodeUrl,
      getOauthDeleteTokenUrl: getOauthDeleteTokenUrl,
      getAccessTokenPostData: getAccessTokenPostData,
      getNewAccessTokenPostData: getNewAccessTokenPostData,
      getOAuthClientRegistrationCredentials: getOAuthClientRegistrationCredentials,
    };

    // public

    function getLogoutUrl() {
      var acu = UrlConfig.getAdminPortalUrl();
      return config.logoutUrl + encodeURIComponent(acu);
    }

    function getAccessTokenUrl() {
      return getOauth2Url() + 'access_token';
    }

    function getOauthDeleteTokenUrl() {
      return 'https://idbroker.webex.com/idb/oauth2/v1/revoke';
    }

    function getOAuthClientRegistrationCredentials() {
      return Utils.Base64.encode(getClientId() + ':' + getClientSecret());
    }

    function getOauthLoginUrl(email, oauthState) {
      var redirectUrl = UrlConfig.getAdminPortalUrl();
      var params = [
        getOauth2Url(),
        getClientId(),
        oauth2Scope,
        encodeURIComponent(redirectUrl),
        oauthState,
        getOauthServiceType(),
        encodeURIComponent(email)
      ];
      return Utils.sprintf(config.oauthUrl.oauth2LoginUrlPattern, params);
    }

    function getOauthAccessCodeUrl(refresh_token) {
      var params = [
        refresh_token,
        oauth2Scope
      ];
      return Utils.sprintf(config.oauthUrl.oauth2AccessCodeUrlPattern, params);
    }

    function getNewAccessTokenPostData(code) {
      var oauthCodeUrl = Utils.sprintf(config.oauthUrl.oauth2CodeUrlPattern, [code]);
      return oauthCodeUrl + oauth2Scope + '&' + getRedirectUrl();
    }

    function getAccessTokenPostData() {
      return config.oauthUrl.oauth2ClientUrlPattern + oauth2Scope;
    }

    // private

    function getRedirectUrl() {
      var acu = UrlConfig.getAdminPortalUrl();
      var params = [encodeURIComponent(acu)];
      return Utils.sprintf(config.oauthUrl.ciRedirectUrl, params);
    }

    function getClientSecret() {
      var clientSecret = {
        'cfe': config.oauthClientRegistration.cfe.secret,
        'dev': config.oauthClientRegistration.atlas.secret,
        'prod': config.oauthClientRegistration.atlas.secret,
        'integration': config.oauthClientRegistration.atlas.secret,
      };
      return clientSecret[Config.getEnv()];
    }

    function getClientId() {
      var clientId = {
        'cfe': config.oauthClientRegistration.cfe.id,
        'dev': config.oauthClientRegistration.atlas.id,
        'prod': config.oauthClientRegistration.atlas.id,
        'integration': config.oauthClientRegistration.atlas.id,
      };
      return clientId[Config.getEnv()];
    }

    function getOauth2Url() {
      var oAuth2Url = {
        'dev': config.oauthUrl.oauth2UrlAtlas,
        'cfe': config.oauthUrl.oauth2UrlCfe,
        'integration': config.oauthUrl.oauth2UrlAtlas,
        'prod': config.oauthUrl.oauth2UrlAtlas
      };
      return oAuth2Url[Config.getEnv()];
    }

    function getOauthServiceType() {
      return 'spark';
    }

  }

}());
