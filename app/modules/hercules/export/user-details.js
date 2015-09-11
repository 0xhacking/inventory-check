'use strict';

angular.module('Hercules').service('UserDetails',

  /* @ngInject  */
  function (Utils, Config, Authinfo, $http, Log) {

    var multipleUserFilter = function (userIds) {
      var filter = "";
      $.each(userIds, function (index, elem) {
        filter += "id eq " + '"' + elem + '"' + " and ";
      });
      filter = filter.slice(0, -5);
      return filter;
    };

    var userUrl = function (userIds, orgId) {
      return Config.getScimUrl(orgId) + "?filter=" + multipleUserFilter(userIds);
    };

    var getCSVColumnHeaders = function (serviceName) {
      return ["id", "email", "connector", serviceName + " state", "message"];
    };

    var getUsers = function (stateInfos, orgId, callback) {

      var userIds = $.map(stateInfos, function (stateInfo) {
        return stateInfo.userId;
      });

      $http.get(userUrl(userIds, orgId))
        .success(function (data, status) {
          var total = [];
          $.each(userIds, function (index, ussUserId) {
            var result = {};

            // Does the id exist in answer from CI ?
            var foundUser = $.grep(data.Resources, function (ciUser) {
              return ciUser.id === ussUserId;
            });

            if (foundUser.length > 0) {
              result.success = true;
              result.details = {
                id: userIds[index],
                userName: foundUser[0].userName,
                connector: stateInfos[index].connector,
                state: stateInfos[index].state == "notActivated" ? "Pending Activation" : stateInfos[index].state,
                message: stateInfos[index].state == "error" ? stateInfos[index].description.defaultMessage : "-"
              };
            } else {
              result.success = false;
              result.details = {
                id: userIds[index],
                userName: "username not found",
                connector: stateInfos[index].connector,
                state: stateInfos[index].state == "notActivated" ? "Pending Activation" : stateInfos[index].state,
                message: stateInfos[index].state == "error" ? stateInfos[index].description.defaultMessage : "-"
              };
            }

            total.push(result);
          });
          callback(total, status);
        });

    };

    return {
      getUsers: getUsers,
      multipleUserFilter: multipleUserFilter,
      userUrl: userUrl,
      getCSVColumnHeaders: getCSVColumnHeaders
    };

  }
);
