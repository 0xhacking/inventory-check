(function () {
  'use strict';

  module.exports = angular
    .module('core.token', [
      require('modules/core/config/config'),
      require('modules/core/scripts/services/storage'),
      require('modules/core/scripts/services/sessionstorage'),
      require('modules/core/config/oauthConfig'),
      require('modules/core/windowLocation/windowLocation'),
    ])
    .service('TokenService', TokenService)
    .name;

  /* @ngInject */
  function TokenService($injector, $rootScope, $window, OAuthConfig, Config, Storage, SessionStorage, WindowLocation) {
    var respondSessionStorageEvent = 'sessionStorage' + Config.getEnv();
    var requestSessionStorageEvent = 'getSessionStorage' + Config.getEnv();
    var logoutEvent = 'logout' + Config.getEnv();
    var service = {
      getAccessToken: getAccessToken,
      getRefreshToken: getRefreshToken,
      getClientSessionId: getClientSessionId,
      getOrGenerateClientSessionId: getOrGenerateClientSessionId,
      setAccessToken: setAccessToken,
      setRefreshToken: setRefreshToken,
      setClientSessionId: setClientSessionId,
      setAuthorizationHeader: setAuthorizationHeader,
      completeLogout: completeLogout,
      clearStorage: clearStorage,
      triggerGlobalLogout: triggerGlobalLogout,
      init: init
    };

    return service;

    function init() {
      // listen for changes to localStorage
      $window.addEventListener('storage', sessionTokenTransfer);
      $rootScope.$on('$destroy', function () {
        $window.removeEventListener('storage', sessionTokenTransfer);
      });

      // If no sessionStorage tokens and the tab was not logged out, ask other tabs for the sessionStorage
      if (!$window.sessionStorage.length && !$window.sessionStorage.getItem('logout')) {
        $window.localStorage.setItem(requestSessionStorageEvent, 'foobar');
        $window.localStorage.removeItem(requestSessionStorageEvent, 'foobar');
      }
    }

    function getAccessToken() {
      return SessionStorage.get('accessToken');
    }

    function getRefreshToken() {
      return SessionStorage.get('refreshToken');
    }

    function setAccessToken(token) {
      return SessionStorage.put('accessToken', token);
    }

    function setRefreshToken(token) {
      return SessionStorage.put('refreshToken', token);
    }

    function setClientSessionId(sessionId) {
      return Storage.put('clientSessionId', sessionId);
    }

    function getClientSessionId() {
      return Storage.get('clientSessionId');
    }

    function getOrGenerateClientSessionId() {
      var clientSessionId = getClientSessionId();
      if (!clientSessionId) {
        var uuid = require('uuid');
        clientSessionId = uuid.v4();
        setClientSessionId(clientSessionId);
      }
      return clientSessionId;
    }

    function setAuthorizationHeader(token) {
      $injector.get('$http').defaults.headers.common.Authorization = 'Bearer ' + (token || getAccessToken());
    }

    function completeLogout(redirectUrl) {
      clearStorage();
      // We store a key value in sessionStorage to
      // prevent a login when multiple tabs are open
      SessionStorage.put('logout', 'logout');
      WindowLocation.set(redirectUrl);
    }

    function triggerGlobalLogout() {
      $window.localStorage.setItem(logoutEvent, 'logout');
      $window.localStorage.removeItem(logoutEvent, 'logout');
    }

    function clearStorage() {
      Storage.clear();
      SessionStorage.clear();
    }

    // This function transfers sessionStorage from one tab to another in the case another tab is logged in
    function sessionTokenTransfer(event) {
      if (!event.newValue) return;
      if (event.key === requestSessionStorageEvent) {
        // a tab asked for the sessionStorage, so send it
        $window.localStorage.setItem(respondSessionStorageEvent, JSON.stringify($window.sessionStorage));
        $window.localStorage.removeItem(respondSessionStorageEvent);
      } else if (event.key === logoutEvent) {
        completeLogout(OAuthConfig.getLogoutUrl());
      } else if (event.key === respondSessionStorageEvent && !$window.sessionStorage.length) {
        // a tab sent data, so get it
        var data = JSON.parse(event.newValue);
        for (var key in data) {
          $window.sessionStorage.setItem(key, data[key]);
        }

        if (getAccessToken() && (getAccessToken() !== '')) {
          setAuthorizationHeader();
          $rootScope.$broadcast('ACCESS_TOKEN_RETRIEVED');
        }
      }
    }
  }
})();
