(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('HostDetailsControllerV2',

      /* @ngInject */
      function ($stateParams, MediaClusterServiceV2, $modal) {
        var vm = this;
        vm.clusterId = $stateParams.clusterId;
        vm.connector = $stateParams.connector;
        vm.hostscount = $stateParams.hostLength;
        vm.cluster = $stateParams.selectedCluster;
        vm.options = ["Switching", "Transcoding"];
        vm.selectPlaceholder = 'Select One';
        vm.organization = '';

        MediaClusterServiceV2.getOrganization(function (data) {
          if (data.success) {
            vm.organization = data;
          }
        });

        vm.reassignCluster = function () {
          $modal.open({
            resolve: {
              cluster: function () {
                return vm.cluster;
              },
              connector: function () {
                return vm.connector;
              }
            },
            type: 'small',
            controller: 'ReassignClusterControllerV2',
            controllerAs: "reassignClust",
            templateUrl: 'modules/mediafusion/media-service-v2/side-panel/reassign-cluster-dialog.html'
          });
        };

        vm.showDeregisterHostDialog = function () {
          $modal.open({
            resolve: {
              cluster: function () {
                return vm.cluster;
              },
              orgName: function () {
                return vm.organization.displayName;
              },
              connector: function () {
                return vm.connector;
              }
            },
            type: 'small',
            controller: 'HostDeregisterControllerV2',
            controllerAs: "hostDeregister",
            templateUrl: 'modules/mediafusion/media-service-v2/side-panel/host-deregister-dialog.html'
          });
        };

      }
    );
})();
