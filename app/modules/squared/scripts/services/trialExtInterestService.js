(function () {
  'use strict';

  angular
    .module('Squared')
    .factory('TrialExtInterestService', TrialExtInterestService);

  /* @ngInject */
  function TrialExtInterestService($http, Config) {

    var trialExtInterestUrl = Config.getAdminServiceUrl() + 'email';

    return {
      notifyPartnerAdmin: function (encryptedParam) {
        var trialExtInterestData = {
          'type': '15',
          'eqp': {
            'encryptedQueryString': encryptedParam
          }
        };
        return $http.post(trialExtInterestUrl, trialExtInterestData);
      }
    };
  }
})();
