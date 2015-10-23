(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('NewFeatureModalCtrl', NewFeatureModalCtrl);

  /* @ngInject */
  function NewFeatureModalCtrl($scope, $modalInstance, $translate, $state) {
    /*jshint validthis: true */
    var vm = $scope;

    vm.features = [{
        cssClass: 'AA',
        code: 'autoAttendant.code',
        label: 'autoAttendant.title',
        description: 'autoAttendant.modalDescription'
      }, {
        cssClass: 'HG',
        code: 'huronHuntGroup.code',
        label: 'huronHuntGroup.title',
        description: 'huronHuntGroup.modalDescription'
      }
      //  , {
      //  cssClass: 'CP',
      //  code: 'callPark.code',
      //  label: 'callPark.title',
      //  description: 'callPark.modalDescription'
      //}
    ];

    vm.ok = ok;
    vm.cancel = cancel;

    function ok(featureCode) {
      if (featureCode === 'HG') {
        $state.go('huronHuntGroup');
      }
      $modalInstance.close(featureCode);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
