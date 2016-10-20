(function () {
  'use strict';

  angular.module('Core')
    .controller('NewSharedSpaceCtrl', NewSharedSpaceCtrl);
  /* @ngInject */
  function NewSharedSpaceCtrl($stateParams, Authinfo) {
    var vm = this;
    vm.wizardData = $stateParams.wizard.state().data;

    vm.onlyNew = function () {
      return vm.wizardData.function == 'addPlace' || vm.wizardData.deviceType == "cloudberry";
    };

    vm.isNewCollapsed = !vm.onlyNew();
    vm.isExistingCollapsed = true;
    vm.selected = null;
    vm.radioSelect = null;
    vm.isLoading = false;
    vm.deviceName = vm.wizardData.deviceName || "";

    vm.isNameValid = function () {
      if (vm.place) {
        return true;
      } // hack;
      return vm.deviceName && vm.deviceName.length < 128;
    };
    vm.next = function () {
      vm.isLoading = true;
      var nextOption = vm.wizardData.deviceType;
      if (nextOption == 'huron') {
        if (vm.wizardData.function == 'addPlace') {
          nextOption += '_' + 'create';
        } else {
          nextOption += '_' + vm.radioSelect;
        }
      }

      $stateParams.wizard.next({
        deviceName: vm.deviceName,
        // code: code,
        // expiryTime: code.expiryTime,
        cisUuid: Authinfo.getUserId(),
        userName: Authinfo.getUserName(),
        displayName: Authinfo.getUserName(),
        email: Authinfo.getPrimaryEmail(),
        organizationId: Authinfo.getOrgId()
      }, nextOption);
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };
  }
})();
