(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('AddResourceControllerClusterViewV2', AddResourceControllerClusterViewV2);

  /* @ngInject */
  function AddResourceControllerClusterViewV2($translate, $state, $stateParams, AddResourceCommonServiceV2, $window) {
    var vm = this;
    vm.clusterList = [];
    vm.selectPlaceholder = $translate.instant('mediaFusion.add-resource-dialog.cluster-placeholder');
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.back = back;
    vm.next = next;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.clusterDetail = null;
    vm.popup = '';
    vm.selectedClusterId = '';
    vm.firstTimeSetup = $state.params.firstTimeSetup;
    vm.closeSetupModal = closeSetupModal;
    vm.currentServiceId = 'squared-fusion-media';
    vm.radio = 1;
    vm.noProceed = false;
    vm.yesProceed = $state.params.yesProceed;
    vm.fromClusters = $state.params.fromClusters;
    vm.canGoNext = canGoNext;

    // Forming clusterList which contains all cluster name of type mf_mgmt and sorting it.
    AddResourceCommonServiceV2.updateClusterLists().then(function (clusterList) {
      vm.clusterList = clusterList;
    });

    function redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
      $state.modal.close();
      AddResourceCommonServiceV2.addRedirectTargetClicked(hostName, enteredCluster).then(function () {
        AddResourceCommonServiceV2.redirectPopUpAndClose(hostName, enteredCluster, vm.selectedClusterId, vm.firstTimeSetup);
      });
    }

    function closeSetupModal() {
      $state.modal.close();
    }

    function back() {
      if (!vm.yesProceed) {
        $stateParams.wizard.back();
      } else if (vm.enableRedirectToTarget) {
        vm.enableRedirectToTarget = false;
      } else {
        vm.yesProceed = false;
      }
    }

    function next() {
      if (vm.radio == 0) {
        vm.noProceed = true;
        $window.open('https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/Media-Fusion-Management-Connector/mfusion.ova');
      } else if (vm.yesProceed) {
        if (!_.isUndefined(vm.selectedCluster) && vm.selectedCluster != '' && !_.isUndefined(vm.hostName)) {
          vm.enableRedirectToTarget = true;
        }
      } else {
        vm.yesProceed = true;
      }
    }

    function canGoNext() {

      if (vm.fromClusters && !vm.yesProceed) {
        return true;
      } else if (vm.yesProceed && !_.isUndefined(vm.hostName) && vm.hostName != '' && !_.isUndefined(vm.selectedCluster) && vm.selectedCluster != '') {
        return true;
      } else {
        return false;
      }
    }
  }
}());
