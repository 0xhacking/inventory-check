(function () {
  'use strict';

  angular.module('Core')
    .controller('FirstTimeWizardCtrl', FirstTimeWizardCtrl);

  /* @ngInject */
  function FirstTimeWizardCtrl($q, $scope, $state, $translate, Auth, Authinfo,
    Config, FeatureToggleService, Log, Orgservice, Userservice, WindowLocation) {
    $scope.greeting = $translate.instant('index.greeting', {
      name: Authinfo.getUserName()
    });

    $scope.finish = function () {
      return Orgservice.setSetupDone().then(function () {
        Authinfo.setSetupDone(true);
      }).then(function () {
        if (Authinfo.isAdmin()) {
          return Auth.getCustomerAccount(Authinfo.getOrgId())
            .success(function (data, status) {
              Authinfo.updateAccountInfo(data, status);
            });
        }
      }).finally(function () {
        $state.go('overview');
      });
    };

    init();

    function init() {
      /**
       * Patch the first time admin login with SyncKms role and Care entitlements.
       */
      var isCareEnabled = FeatureToggleService.atlasCareTrialsGetStatus()
        .then(isEntitledForCare);

      isCareEnabled
        .then(getCareAdminUser)
        .then(isPatchRequired)
        .then(patchAdmin)
        .then(updateAccessToken)
        .then(function () {
          Log.info('Admin user patched successfully.');
        })
        .catch(onFailure);

      isCareEnabled
        .then(isCsOnboardingNeeded)
        .then(onboardToContextService)
        .catch(onFailureCsOnboarding);

      // TODO how to prevent setting setupDone if Context Service onboarding fails
    }

    function isCsOnboardingNeeded(careEnabled) {
      if (!careEnabled) {
        return $q.reject();
      }
      return $q.resolve({ status: 200, data: { onboarded: false } }); // TODO get real CS onboarding status
    }

    function isEntitledForCare() {
      return (!Authinfo.isInDelegatedAdministrationOrg() &&
        Authinfo.getCareServices().length > 0);
    }

    function onboardToContextService(response) {
      if (isFailed(response)) {
        Log.error('Getting CS Onboarding status failed :', response);
        return $q.reject();
      }

      if (!response.data.onboarded) {
        var ccfsUrl = 'https://ccfs.rciad.ciscoccservice.com/v1/authorize?callbackUrl=https://admin.ciscospark.com&appType=sunlight&delegation=true';
        WindowLocation.set(ccfsUrl);
      }
    }

    function getCareAdminUser(careEnabled) {
      if (!careEnabled) {
        return $q.reject();
      }
      return Userservice.getUser('me', _.noop);
    }

    function isPatchRequired(response) {
      if (isFailed(response)) {
        Log.error('Get user failed :', response);
        return $q.reject();
      }

      var careAdmin = response.data;
      var hasSyncKms = _.find(careAdmin.roles, function (r) {
        return r === Config.backend_roles.spark_synckms;
      });

      var hasCareEntitlements = _.filter(careAdmin.entitlements, function (e) {
        return (e === Config.entitlements.care ||
          e === Config.entitlements.context);
      }).length === 2;

      return (!hasSyncKms || !hasCareEntitlements) ? $q.resolve(careAdmin) : $q.reject();
    }

    function patchAdmin(admin) {
      var userData = {
        schemas: Config.scimSchemas,
        roles: [Config.backend_roles.spark_synckms],
        entitlements: [Config.entitlements.care, Config.entitlements.context]
      };

      return Userservice.updateUserProfile(admin.id, userData, _.noop);
    }

    function updateAccessToken(response) {
      if (isFailed(response)) {
        Log.error('Update user profile failed :', response);
        return $q.reject();
      }

      /**
       * TODO: This is a workaround until we figure out a way to
       * Revoke/Refresh access token with newly patched entitlements.
       */
      return Auth.logout();
    }

    function isFailed(response) {
      return (!response || response.status !== 200);
    }

    function onFailure(data) {
      Log.error('First time admin patch operation failed.', data);
    }

    function onFailureCsOnboarding(data) {
      Log.error('Context Service Onboarding operation failed.', data);
    }
  }
})();
