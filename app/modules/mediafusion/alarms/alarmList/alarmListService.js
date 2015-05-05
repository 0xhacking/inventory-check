'use strict';

//Defining a utilizationService.
angular.module('Mediafusion')
  .service('AlarmListService', ['$http', '$rootScope', 'Config', 'Authinfo', 'Log', 'Utils', 'Auth',
    function ($http, $rootScope, Config, Authinfo, Log, Utils, Auth) {
      //console.log("AlarmListService");
      //Fetching the Base url form config.js file.
      var searchfilter = 'filter=%s';
      var baseUrl = Config.getAlarmServiceUrl();

      var alarmListService = {

        queryAlarmList: function (pgNo, searchString, callback) {
          //console.log("In queryAlarmList");
          var alarmListUrl = Utils.sprintf(baseUrl + '/allAlarms', [Authinfo.getOrgId()]);
          var alarmSearchUrl = null;
          var encodedSearchStr = '';
          var queryParams = '&pgNo=' + pgNo + '&pgSize=' + Config.alarmsPerPage;

          if (searchString !== '' && typeof (searchString) !== 'undefined') {
            alarmSearchUrl = alarmListUrl + '?' + searchfilter + "&" + queryParams;
            encodedSearchStr = window.encodeURIComponent(searchString);
            alarmListUrl = Utils.sprintf(alarmSearchUrl, [encodedSearchStr]);
          } else {
            alarmListUrl = alarmListUrl + '?' + queryParams;
          }

          //console.log("Alarm List URL::"+alarmListUrl);
          //var data ={};

          //data.success = true;
          //callback(data, true);
          //Actual rest call to get alarm info from server and also error case is handeled.
          $http.get(alarmListUrl)
            .success(function (data, status) {
              //console.log("Returned data is"+data);
              data.alarms = data;
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
            });
        }

      };

      return alarmListService;

    }
  ]);
