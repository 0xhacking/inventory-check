'use strict';

angular.module('Squared')
  .controller('UserEntitlementsCtrl', ['$scope', '$timeout', '$location', '$window', 'Userservice', 'UserListService', 'Log', '$log', 'Config', 'Pagination', '$rootScope', 'Notification', '$filter', 'Utils', 'Authinfo', 'HttpUtils',
    function ($scope, $timeout, $location, $window, Userservice, UserListService, Log, $log, Config, Pagination, $rootScope, Notification, $filter, Utils, Authinfo, HttpUtils) {
      $scope.hasAccount = Authinfo.hasAccount();
      $scope.entitlements = Utils.getSqEntitlements($scope.currentUser);

      //TODO: In the hasAccount case, come up with a better UX for a license category
      //that has no configurable entitlements, intead of an empty pane with a disabled
      //save button.

      var services = Authinfo.getServices();

      if ($scope.service && $scope.hasAccount) {
        services = services.filter(function (service) {
          return service.isConfigurable && service.licenseType === $scope.service;
        });
      }

      $scope.entitlementsKeys = _.pluck(services, 'serviceId').sort().reverse();

      $scope.saveDisabled = true;

      $scope.isServiceAllowed = function (service) {
        return Authinfo.isServiceAllowed(service);
      };

      $scope.getServiceName = function (service) {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i];
          if (svc.serviceId === service) {
            return svc.displayName;
          }
        }
      };

      $scope.shouldAddIndent = function (key, reference) {
        return key !== reference;
      };

      var getUserEntitlementList = function () {
        return $rootScope.services.map(function (service) {
          var serviceId = service.serviceId;
          return {
            entitlementName: serviceId,
            entitlementState: $scope.entitlements[serviceId] ? 'ACTIVE' : 'INACTIVE'
          };
        });
      };

      var watchCheckboxes = function () {
        $timeout(function () {});
        var flag = false;
        $scope.$watchCollection('entitlements', function (newEntitlements, oldEntitlements) {
          if (flag) {
            flag = false;
            return;
          }
          var changedKey = Utils.changedKey(newEntitlements, oldEntitlements);
          if (changedKey === 'webExSquared' && !newEntitlements.webExSquared && Utils.areEntitlementsActive($scope.entitlements)) {
            for (var key in $scope.entitlements) {
              if (key !== 'webExSquared') {
                $scope.entitlements[key] = false;
                flag = true;
              }
            }
            $scope.saveDisabled = false;
          } else if (!$scope.entitlements.webExSquared && !oldEntitlements[changedKey] && changedKey !== 'webExSquared' && Utils.areEntitlementsActive($scope.entitlements)) {
            $scope.entitlements.webExSquared = true;
            $scope.saveDisabled = false;
          } else if (newEntitlements !== oldEntitlements) {
            $scope.saveDisabled = false;
          }
        });
      };

      /**
       * TODO: All entitlements are currently sent in the PATCH request in all cases,
       * even if the bucketed checkboxes are the only ones that are visible
       * (isConfigurable && hasAccount.) This works, but could be changed to
       * send only the entitlements whose values actually changed, instead of
       * all entitelments. The !hasAccount case should most likely keep the
       * current behavior of sending all entitlements, even when their values
       * didn't change.
       */
      $scope.changeEntitlement = function (user) {
        Log.debug('Entitling user.', user);
        HttpUtils.setTrackingID().then(function () {
          angular.element('#btn-save').button('loading');
          var givenName = null;
          var familyName = null;
          if (user.name !== undefined && user.name !== null) {
            givenName = user.name.givenName;
            familyName = user.name.familyName;
          }
          Userservice.updateUsers([{
            'address': user.userName,
            'givenName': givenName,
            'familyName': familyName
          }], null, getUserEntitlementList(), 'changeEntitlement', function (data) {
            var entitleResult = {
              msg: null,
              type: 'null'
            };
            if (data.success) {
              var userStatus = data.userResponse[0].status;
              if (userStatus === 200) {
                entitleResult.msg = data.userResponse[0].email + '\'s entitlements were updated successfully.';
                entitleResult.type = 'success';
                if ($scope.entitlements.webExSquared === true) {
                  angular.element('.icon-' + user.id).html($filter('translate')('usersPage.active'));
                } else {
                  angular.element('.icon-' + user.id).html($filter('translate')('usersPage.inactive'));
                }
              } else if (userStatus === 404) {
                entitleResult.msg = 'Entitlements for ' + data.userResponse[0].email + ' do not exist.';
                entitleResult.type = 'error';
              } else if (userStatus === 409) {
                entitleResult.msg = 'Entitlement(s) previously updated.';
                entitleResult.type = 'error';
              } else {
                entitleResult.msg = data.userResponse[0].email + '\'s entitlements were not updated, status: ' + userStatus;
                entitleResult.type = 'error';
              }
              Notification.notify([entitleResult.msg], entitleResult.type);
              angular.element('#btn-save').button('reset');

              var index = $scope.queryuserslist.map(function (element) {
                return element.id;
              }).indexOf($scope.currentUser.id);
              var updatedUser = $scope.queryuserslist[index];
              for (var i = 0; i < $rootScope.services.length; i++) {
                var service = $rootScope.services[i].serviceId;
                var ciName = $rootScope.services[i].ciName;
                if ($scope.entitlements[service] === true && updatedUser.entitlements.indexOf(ciName) === -1) {
                  updatedUser.entitlements.push(ciName);
                } else if ($scope.entitlements[service] === false && updatedUser.entitlements.indexOf(ciName) > -1) {
                  updatedUser.entitlements.splice(updatedUser.entitlements.indexOf(ciName), 1);
                }
              }
              $rootScope.$broadcast('entitlementsUpdated');
            } else {
              Log.error('Failed updating user with entitlements.');
              Log.error(data);
              entitleResult = {
                msg: 'Failed to update ' + user.userName + '\'s entitlements.',
                type: 'error'
              };
              Notification.notify([entitleResult.msg], entitleResult.type);
              angular.element('#btn-save').button('reset');
            }
          });
        });
      };

      watchCheckboxes();
    }
  ])
  .directive('userEntitlements', function () {
    return {
      restrict: 'A',
      controller: 'UserEntitlementsCtrl',
      scope: {
        currentUser: '=',
        entitlements: '=',
        queryuserslist: '=',
        service: '='
      },
      templateUrl: 'modules/squared/scripts/directives/views/userentitlements.html'
    };
  });
