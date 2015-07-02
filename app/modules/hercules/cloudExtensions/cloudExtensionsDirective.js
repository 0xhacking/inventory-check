'use strict';
angular
  .module('Hercules')
  .controller('CloudExtensionsCtrl', ['$log', '$rootScope', 'UserListService', '$scope', '$stateParams', '$translate', 'Authinfo', 'USSService', 'ServiceDescriptor', '$timeout',
    function ($log, $rootScope, UserListService, $scope, $stateParams, $translate, Authinfo, USSService, ServiceDescriptor, $timeout) {
      if (!Authinfo.isFusion()) {
        return;
      }
      $scope.currentUser = $stateParams.currentUser;
      $scope.extensionEntitlements = ['squared-fusion-cal', 'squared-fusion-uc'];

      var hasEntitlement = function (entitlement) {
        return $scope.currentUser.entitlements.indexOf(entitlement) > -1 ? true : false;
      };

      if ($scope.extensionEntitlements.every(function (extensionEntitlement) {
          return !Authinfo.isEntitled(extensionEntitlement);
        })) {
        return;
      }

      $scope.extensions = [];
      _.forEach($scope.extensionEntitlements, function (extensionEntitlement) {
        if (Authinfo.isEntitled(extensionEntitlement)) {
          $scope.extensions.push({
            id: extensionEntitlement,
            entitled: hasEntitlement(extensionEntitlement)
          });
        }
      });

      // Filter out extensions that are not enabled in FMS
      ServiceDescriptor.services(function (error, services) {
        if (services) {
          _.forEach($scope.extensions, function (extension) {
            extension.enabled = ServiceDescriptor.filterEnabledServices(services).some(function (service) {
              return extension.id === service.service_id;
            });
            if (extension.enabled) {
              $scope.isEnabled = true;
            }
          });
          if ($scope.isEnabled) {
            // Only poll for statuses if there are enabled extensions
            updateStatusForUser();
          }
        }
      });

      // Periodically update the user statuses from USS
      var updateStatusForUser = function () {
        USSService.getStatusesForUser($scope.currentUser.id, function (err, activationStatus) {
          if (activationStatus && activationStatus.userStatuses) {
            _.forEach($scope.extensions, function (extension) {
              extension.status = _.find(activationStatus.userStatuses, function (status) {
                return extension.id === status.serviceId;
              });
            });
          }
          delayedUpdateStatusForUser();
        });
      };

      var delayedUpdateStatusForUser = function () {
        if ($scope.stopDelayedUpdates) {
          return;
        }
        $scope.delayedUpdateTimer = $timeout(function () {
          updateStatusForUser();
        }, 3000);
      };

      $scope.getStatus = function (status) {
        return USSService.decorateWithStatus(status);
      };

      $scope.$on('$destroy', function () {
        $scope.stopDelayedUpdates = true;
        if ($scope.delayedUpdateTimer) {
          $timeout.cancel($scope.delayedUpdateTimer);
        }
      });

      $scope.extensionIcon = function (id) {
        return ServiceDescriptor.serviceIcon(id);
      };
    }
  ])
  .directive('herculesCloudExtensions', [
    function () {
      return {
        restrict: 'E',
        scope: false,
        controller: 'CloudExtensionsCtrl',
        templateUrl: 'modules/hercules/cloudExtensions/cloudExtensions.tpl.html'
      };
    }
  ]);
