(function () {
  'use strict';

  angular.module('Core')
    .controller('UserDeleteCtrl', UserDeleteCtrl);

  /* @ngInject */
  function UserDeleteCtrl($scope, $rootScope, $stateParams, $q, $timeout, Log, Userservice, Notification, Config, $translate, HuronUser, SyncService) {
    var vm = this;

    vm.deleteUserOrgId = $stateParams.deleteUserOrgId;
    vm.deleteUserUuId = $stateParams.deleteUserUuId;
    vm.deleteUsername = $stateParams.deleteUsername;
    vm.isMsgrSyncEnabled = false;

    vm.confirmation = '';
    var confirmationMatch = $translate.instant('usersPage.yes');

    vm.deleteCheck = deleteCheck;
    vm.deactivateUser = deactivateUser;

    init();

    function init() {
      getMessengerSyncStatus();
    }

    function getMessengerSyncStatus() {
      SyncService.isMessengerSyncEnabled()
        .then(function (isEnabled) {
          vm.isMsgrSyncEnabled = isEnabled;
        })
        .catch(Log.error);
    }

    function deleteCheck() {
      return vm.confirmation.toUpperCase() !== confirmationMatch;
    }

    function deactivateUser() {
      startLoading();
      // Delete Huron first
      deleteHuron()
        .catch(catchNotFound) // If no huron user, delete like normal
        .then(deleteUser)
        .then(deleteSuccess)
        .then(closeModal)
        .catch(deleteError)
        .finally(stopLoading);
    }

    function startLoading() {
      vm.loading = true;
    }

    function deleteHuron() {
      return $q(function (resolve, reject) {
        Userservice.getUser(vm.deleteUserUuId, function (user) {
          if (_.includes(user.entitlements, Config.entitlements.huron)) {
            HuronUser.delete(vm.deleteUserUuId)
              .then(resolve)
              .catch(reject);
          } else {
            resolve();
          }
        });
      });
    }

    function catchNotFound(response) {
      if (_.get(response, 'status') !== 404) {
        return $q.reject(response);
      }
    }

    function deleteUser() {
      var userData = {
        email: vm.deleteUsername
      };
      return Userservice.deactivateUser(userData);
    }

    function deleteSuccess() {
      Notification.success('usersPage.deleteUserSuccess', {
        email: vm.deleteUsername
      });

      $timeout(refreshUserList, 500);
    }

    function refreshUserList() {
      $rootScope.$broadcast('USER_LIST_UPDATED');
    }

    function closeModal() {
      if (_.isFunction($scope.$close)) {
        $scope.$close();
      }
    }

    function deleteError(response) {
      Notification.errorResponse(response, 'usersPage.deleteUserError');
    }

    function stopLoading() {
      vm.loading = false;
    }
  }
})();
