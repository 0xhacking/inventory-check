(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskCloudberryDeviceController($stateParams, HelpdeskService, XhrNotificationService) {
    $('body').css('background', 'white');
    var vm = this;
    vm.deviceId = $stateParams.id;
    vm.orgId = $stateParams.orgId;
    vm.device = $stateParams.device;
    vm.keyPressHandler = keyPressHandler;
    if ($stateParams.device && $stateParams.device.organization) {
      vm.org = $stateParams.device.organization;
    } else {
      vm.org = {
        id: vm.orgId
      };
    }

    HelpdeskService.getCloudberryDevice(vm.orgId, vm.deviceId).then(initDeviceView, XhrNotificationService.notify);

    function initDeviceView(device) {
      vm.device = device;
      if (!vm.org.displayName) {
        // Only if there is no displayName. If set, the org name has already been read (on the search page)
        HelpdeskService.getOrgDisplayName(vm.orgId).then(function (displayName) {
          vm.org.displayName = displayName;
        }, XhrNotificationService.notify);
      }
      angular.element(".helpdesk-details").focus();
    }

    function keyPressHandler(event) {
      if (event.keyCode === 27) { // Esc
        window.history.back();
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskCloudberryDeviceController', HelpdeskCloudberryDeviceController);
}());
