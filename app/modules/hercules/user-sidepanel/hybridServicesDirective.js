(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('herculesCloudExtensions', herculesCloudExtensions)
    .controller('HybridServicesCtrl', HybridServicesCtrl);

  /* @ngInject */
  function HybridServicesCtrl($scope, $rootScope, $timeout, Authinfo, USSService, FusionUtils, ServiceDescriptor, Orgservice, Notification, Userservice) {
    if (!Authinfo.isFusion()) {
      return;
    }
    var vm = this;
    var extensionEntitlements = ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-ec'];
    var extensionCallEntitlements = ['squared-fusion-uc', 'squared-fusion-ec'];
    var stopDelayedUpdates = false;
    var delayedUpdateTimer = null;
    vm.extensions = getExtensions();
    vm.isEnabled = false;
    vm.userStatusLoaded = false;
    vm.isInvitePending = vm.user ? Userservice.isInvitePending(vm.user) : false;

    vm.allExceptUcFilter = function (item) {
      return item && item.enabled === true && item.id !== 'squared-fusion-ec';
    };

    vm.getStatus = function (status) {
      // for Hybrid Call, we need to aggregate the status from Aware and Connect
      var mostSignificantStatus;
      if (status) {
        if (_.includes(extensionCallEntitlements, status.serviceId)) {
          var callServiceStatuses = getCallExtensions();
          mostSignificantStatus = getMostSignificantStatus(callServiceStatuses);
        }
      }
      return USSService.decorateWithStatus(mostSignificantStatus === undefined || mostSignificantStatus.status === undefined ? status : mostSignificantStatus.status);
    };

    function getMostSignificantStatus(statuses) {
      return _.maxBy(statuses, function (s) {
        if (s && s.status) {
          return getStatusSeverity(USSService.decorateWithStatus(s.status));
        }
      });
    }

    function getStatusSeverity(status) {
      switch (status) {
        case 'not_entitled':
          return 0;
        case 'activated':
          return 1;
        case 'pending_activation':
          return 2;
        case 'error':
          return 3;
        default:
          return -1;
      }
    }

    vm.extensionIcon = function (id) {
      return FusionUtils.serviceId2Icon(id);
    };

    if (extensionEntitlements.every(function (extensionEntitlement) {
      return !Authinfo.isEntitled(extensionEntitlement);
    })) {
      return;
    }

    Orgservice.getLicensesUsage()
      .then(function (subscriptions) {
        var hasAnyLicense = _.some(subscriptions, function (subscription) {
          return subscription.licenses && subscription.licenses.length > 0;
        });
        if (hasAnyLicense) {
          checkEntitlements({
            enforceLicenseCheck: true
          });
        } else {
          checkEntitlements({
            enforceLicenseCheck: false
          });
        }
      }, function () {
        checkEntitlements({
          enforceLicenseCheck: false
        });
      })
      .catch(function (error) {
        Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });

    function checkEntitlements(options) {
      if (options.enforceLicenseCheck && !hasCaaSLicense()) {
        return;
      }
      // Filter out extensions that are not enabled in FMS
      ServiceDescriptor.services(function (error, services) {
        if (services) {
          _.forEach(vm.extensions, function (extension) {
            extension.enabled = ServiceDescriptor.filterEnabledServices(services).some(function (service) {
              return extension.id === service.id;
            });
            // can't have huron (ciscouc) and call service at the same time
            if (extension.id === 'squared-fusion-uc' && hasEntitlement('ciscouc')) {
              extension.enabled = false;
            }
            if (extension.enabled) {
              vm.isEnabled = true;
            }
          });
          if (vm.isEnabled) {
            // Only poll for statuses if there are enabled extensions
            updateStatusForUser();
          }
        }
      });
    }

    // Periodically update the user statuses from USS
    function updateStatusForUser() {
      if (angular.isDefined(vm.user)) {
        USSService.getStatusesForUser(vm.user.id)
          .then(function (userStatuses) {
            _.forEach(vm.extensions, function (extension) {
              extension.status = _.find(userStatuses, function (status) {
                return extension.id === status.serviceId;
              });
            });
            delayedUpdateStatusForUser();
          }).catch(function (response) {
            Notification.errorWithTrackingId(response, 'hercules.userSidepanel.readUserStatusFailed');
          }).finally(function () {
            vm.userStatusLoaded = true;
          });
      }
    }

    function delayedUpdateStatusForUser() {
      if (stopDelayedUpdates) {
        return;
      }
      delayedUpdateTimer = $timeout(function () {
        updateStatusForUser();
      }, 10000);
    }

    function hasEntitlement(entitlement) {
      if (!angular.isDefined(vm.user)) {
        return false;
      }
      return vm.user.entitlements && vm.user.entitlements.indexOf(entitlement) > -1;
    }

    function getExtensions() {
      return _.compact(_.map(extensionEntitlements, function (extensionEntitlement) {
        if (Authinfo.isEntitled(extensionEntitlement)) {
          return {
            id: extensionEntitlement,
            entitled: hasEntitlement(extensionEntitlement)
          };
        }
      }));
    }

    function getCallExtensions() {
      return _.map(vm.extensions, function (extensionEntitlement) {
        if (_.includes(extensionCallEntitlements, extensionEntitlement.id)) {
          return {
            status: extensionEntitlement.status
          };
        }
      });
    }

    function hasCaaSLicense() {
      // latest update says that a "Collaboration as a Service license" is
      // equivalent to any license
      var licenseIDs = _.get(vm.user, 'licenseID', []);
      var offerCodes = _.map(licenseIDs, function (licenseString) {
        return licenseString.split('_')[0];
      });
      return offerCodes.length > 0;
    }

    var cancelStateChangeListener = $rootScope.$on('$stateChangeSuccess', function () {
      stopDelayedUpdates = true;
      if (delayedUpdateTimer) {
        $timeout.cancel(delayedUpdateTimer);
      }
    });

    $scope.$on('$destroy', function () {
      cancelStateChangeListener();
      stopDelayedUpdates = true;
      if (delayedUpdateTimer) {
        $timeout.cancel(delayedUpdateTimer);
      }
    });
  }

  function herculesCloudExtensions() {
    return {
      scope: true,
      restrict: 'E',
      controller: 'HybridServicesCtrl',
      controllerAs: 'hybridServicesCtrl',
      bindToController: {
        user: '='
      },
      templateUrl: 'modules/hercules/user-sidepanel/hybridServices.tpl.html'
    };
  }
}());
