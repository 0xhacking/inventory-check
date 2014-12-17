'use strict';

angular.module('Squared')
  .service('CallflowService', ['$rootScope', '$http', 'Storage', 'Config', 'Log', 'Auth',
    function ($rootScope, $http, Storage, Config, Log, Auth) {

      return {
        getCallflowCharts: function (orgId, userId, logfileFullName, callback) {
          var callflowChartsUrl = Config.getCallflowServiceUrl() + 'callflow/tool/run?orgId=' + orgId + '&userId=' + userId +
            '&logfileFullName=' + logfileFullName;

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          $http.get(callflowChartsUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved callflow charts corresponding to client logs: ' + data.resultsUrl);
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
              Auth.handleStatus(status);
            });
        }
      };
    }
  ]);
