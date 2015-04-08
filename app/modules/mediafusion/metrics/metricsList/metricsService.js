'use strict';

//Defining a utilizationService.
angular.module('Mediafusion')
  .service('MetricsService', ['$http', '$rootScope', 'Config', 'Authinfo', 'Log', 'Utils', 'Auth',
    function ($http, $rootScope, Config, Authinfo, Log, Utils, Auth) {

      //Fetching the Base url form config.js file.
      var searchfilter = 'filter=%s';
      var baseUrl = Config.getMetricsServiceUrl();

      var metricsService = {

        queryMetricsList: function (pgNo, callback) {

          /*  var data = {};
            data.metrics = [{
              metrictype: "CollectD",
              hostname: "Bgl-1334",
              systemtype: "CMS",
              counters: "Cpu.nice"
            }, {
              metrictype: "rtmt",
              hostname: "bgl11.cisco.com",
              systemtype: "MF",
              counters: "Cpu.idle"
            }];

            data.success = true;
            callback(data, true);*/

          var metricsListUrl = Utils.sprintf(baseUrl + '/threshold/metrics', [Authinfo.getOrgId()]);

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          //Actual rest call to get meeting info from server and also error case is handeled.
          $http.get(metricsListUrl)
            .success(function (data, status) {
              data.success = true;
              data.status = status;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
              Auth.handleStatus(status, description);
            });
        }

      };

      return metricsService;

    }
  ]);
