(function () {
  'use strict';

  angular
    .module('uc.overview')
    .controller('TelephonyOverviewCtrl', TelephonyOverviewCtrl);

  /* @ngInject */
  function TelephonyOverviewCtrl($stateParams, $state, $rootScope, $translate, TelephonyInfoService, FeatureToggleService, Userservice) {
    var vm = this;
    vm.currentUser = $stateParams.currentUser;

    init();

    function init() {
      // TODO: Change TelephonyInfoService to return directly from this instead of having
      // to call into service twice.
      TelephonyInfoService.resetTelephonyInfo();
      TelephonyInfoService.getTelephonyUserInfo(vm.currentUser.id);
      TelephonyInfoService.getPrimarySiteInfo()
        .then(TelephonyInfoService.getUserDnInfo(vm.currentUser.id))
        .then(TelephonyInfoService.checkCustomerVoicemail());
      TelephonyInfoService.getRemoteDestinationInfo(vm.currentUser.id);
      TelephonyInfoService.loadInternalNumberPool();
      TelephonyInfoService.loadExternalNumberPool();
      TelephonyInfoService.getInternationalDialing(vm.currentUser.id);
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfoObject();
    }
  }
})();
