(function () {
  'use strict';

  /* @ngInject */
  function HostDeregisterControllerV2(cluster, connector, orgName, MediaClusterServiceV2, $translate, $modalInstance, Notification) {
    var vm = this;

    vm.deregisterAreYouSure = $translate.instant(
      'mediaFusion.clusters.deregisterAreYouSure', {
        clusterName: cluster.name,
        organizationName: orgName
      });
    vm.saving = false;

    vm.deregister = function () {
      vm.saving = true;
      MediaClusterServiceV2
        .defuseV2Connector(connector.id)
        .then(function () {
          $modalInstance.close();
          vm.saving = false;
          Notification.success('mediaFusion.deleteNodeSuccess');
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.clusters.deregisterErrorGeneric', {
            clusterName: cluster.name
          });
          Notification.errorWithTrackingId(err, vm.error);
          vm.saving = false;
        });
      return false;
    };

    vm.close = $modalInstance.close;
  }

  angular
    .module('Mediafusion')
    .controller('HostDeregisterControllerV2', HostDeregisterControllerV2);

}());
