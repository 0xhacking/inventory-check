(function () {
  'use strict';

  angular
    .module('Core')
    .controller('UserOverviewCtrl', UserOverviewCtrl);

  /* @ngInject */
  function UserOverviewCtrl($scope, $stateParams, $translate, $http, Authinfo, Config, Utils, FeatureToggleService, Userservice, UrlConfig, Orgservice, Log) {
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.entitlements = $stateParams.entitlements;
    vm.queryuserslist = $stateParams.queryuserslist;
    vm.services = [];
    vm.dropDownItems = [];
    vm.titleCard = '';
    vm.subTitleCard = '';
    vm.addGenerateAuthCodeLink = addGenerateAuthCodeLink;
    vm.getAccountStatus = getAccountStatus;
    vm.resendInvitation = resendInvitation;
    vm.pendingStatus = false;
    vm.dirsyncEnabled = false;
    vm.hasAccount = Authinfo.hasAccount();
    vm.isSquaredUC = Authinfo.isSquaredUC();
    vm.isFusion = Authinfo.isFusion();
    vm.isFusionCal = Authinfo.isFusionCal();
    vm.enableAuthCodeLink = enableAuthCodeLink;
    vm.disableAuthCodeLink = disableAuthCodeLink;

    init();

    function init() {
      vm.services = [];

      var msgState = {
        name: $translate.instant('onboardModal.message'),
        icon: $translate.instant('onboardModal.message'),
        state: 'user-overview.messaging',
        detail: $translate.instant('onboardModal.msgFree'),
        actionsAvailable: getDisplayableServices('MESSAGING')
      };

      var commState = {
        name: $translate.instant('onboardModal.call'),
        icon: $translate.instant('onboardModal.call'),
        state: 'user-overview.communication',
        detail: $translate.instant('onboardModal.callFree'),
        actionsAvailable: true
      };

      var confState = {
        name: $translate.instant('onboardModal.meeting'),
        icon: $translate.instant('onboardModal.meeting'),
        state: 'user-overview.conferencing',
        detail: $translate.instant('onboardModal.mtgFree'),
        actionsAvailable: getDisplayableServices('CONFERENCING') || angular.isArray(vm.currentUser.trainSiteNames)
      };

      var contactCenterState = {
        name: $translate.instant('onboardModal.contactCenter'),
        icon: 'ContactCenter',
        state: 'user-overview.contactCenter',
        detail: $translate.instant('onboardModal.freeContactCenter'),
        actionsAvailable: true
      };

      if (hasEntitlement('squared-room-moderation') || !vm.hasAccount) {
        if (getServiceDetails('MS')) {
          msgState.detail = $translate.instant('onboardModal.paidMsg');
        }
        vm.services.push(msgState);
      }
      if (hasEntitlement('cloudmeetings')) {
        confState.detail = $translate.instant('onboardModal.paidConfWebEx');
        vm.services.push(confState);
      } else if (hasEntitlement('squared-syncup')) {
        if (getServiceDetails('CF')) {
          confState.detail = $translate.instant('onboardModal.paidConf');
        }
        vm.services.push(confState);
      }
      if (hasEntitlement('ciscouc')) {
        if (getServiceDetails('CO')) {
          commState.detail = $translate.instant('onboardModal.paidComm');
        }
        vm.services.push(commState);
      }

      if (hasEntitlement('cloud-contact-center')) {
        if (getServiceDetails('CC')) {
          contactCenterState.detail = $translate.instant('onboardModal.paidContactCenter');
        }
        vm.services.push(contactCenterState);
      }

      updateUserTitleCard();

      getAccountStatus();
    }

    var generateOtpLink = {
      name: 'generateAuthCode',
      text: $translate.instant('usersPreview.generateActivationCode'),
      state: 'generateauthcode({currentUser: userOverview.currentUser, activationCode: \'new\'})'
    };

    function getDisplayableServices(serviceName) {
      var displayableServices = Authinfo.getServices();
      if (Authinfo.hasAccount()) {
        displayableServices = displayableServices.filter(function (service) {
          return service.isConfigurable && service.licenseType === serviceName;
        });
      }
      return angular.isArray(displayableServices) && (displayableServices.length > 0);
    }

    function hasEntitlement(entitlement) {
      var userEntitlements = vm.currentUser.entitlements;
      if (userEntitlements) {
        for (var n = 0; n < userEntitlements.length; n++) {
          var ent = userEntitlements[n];
          if (ent === entitlement) {
            return true;
          }
        }
      }
      return false;
    }

    function getServiceDetails(license) {
      var userLicenses = vm.currentUser.licenseID;
      if (userLicenses) {
        for (var l = userLicenses.length - 1; l >= 0; l--) {
          var licensePrefix = userLicenses[l].substring(0, 2);
          if (licensePrefix === license) {
            return true;
          }
        }
      }
      return false;
    }

    function getCurrentUser() {
      var userUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/' + vm.currentUser.id;

      $http.get(userUrl)
        .then(function (response) {
          angular.copy(response.data, vm.currentUser);
          vm.entitlements = Utils.getSqEntitlements(vm.currentUser);
          updateUserTitleCard();
          init();
        });
    }

    function getUserFeatures() {
      // to see user features, you must either be a support member or a team member
      if (!canQueryUserFeatures()) {
        return;
      }

      FeatureToggleService.getFeaturesForUser(vm.currentUser.id).then(function (response) {
        vm.features = [];
        if (!(response.data || response.data.developer)) {
          return;
        }
        var allFeatures = response.data.developer;
        _.each(allFeatures, function (el) {
          if (el.val !== 'false' && el.val !== '0') {
            var newEl = {
              key: el.key
            };
            if (el.val !== 'true') {
              newEl.val = el.val;
            }
            vm.features.push(newEl);
          }
        });
      });
    }

    function canQueryUserFeatures() {
      return Authinfo.isSquaredTeamMember() || Authinfo.isAppAdmin();
    }

    getUserFeatures();

    $scope.$on('USER_LIST_UPDATED', function () {
      getCurrentUser();
    });

    $scope.$on('entitlementsUpdated', function () {
      getCurrentUser();
    });

    function updateUserTitleCard() {
      if (vm.currentUser.displayName) {
        vm.titleCard = vm.currentUser.displayName;
      } else if (vm.currentUser.name) {
        vm.titleCard = (vm.currentUser.name.givenName || '') + ' ' + (vm.currentUser.name.familyName || '');
      } else {
        vm.titleCard = vm.currentUser.userName;
      }

      if (vm.currentUser.title) {
        vm.subTitleCard = vm.currentUser.title;
      }
      if (angular.isArray(vm.currentUser.addresses) && vm.currentUser.addresses.length) {
        vm.subTitleCard += ' ' + (vm.currentUser.addresses[0].locality || '');
      }
      if (!vm.subTitleCard && vm.titleCard != vm.currentUser.userName) {
        vm.subTitleCard = vm.currentUser.userName;
      }
    }

    function enableAuthCodeLink() {
      if (!_.includes(vm.dropDownItems, generateOtpLink)) {
        vm.dropDownItems.push(generateOtpLink);
      }
    }

    function disableAuthCodeLink() {
      _.pull(vm.dropDownItems, generateOtpLink);
    }

    function getAccountStatus() {
      var currentUserId = vm.currentUser.id;
      Userservice.getUser(currentUserId, function (data, status) {
        if (data.success) {
          vm.pendingStatus = (_.indexOf(data.accountStatus, 'pending') >= 0) && (_.isEmpty(data.licenseID));
        } else {
          Log.debug('Get existing account info failed. Status: ' + status);
        }
      });
    }

    function resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements) {
      Userservice.resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements)
        .then(function () {
          Notification.success('usersPage.emailSuccess');
        }).catch(function (error) {
          Notification.errorResponse(error, 'usersPage.emailError');
        });
      angular.element('.open').removeClass('open');
    }

    function getOrg() {
      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          vm.dirsyncEnabled = data.dirsyncEnabled;
        } else {
          Log.debug('Get existing org failed. Status: ' + status);
        }
      });
    }
  }
})();
