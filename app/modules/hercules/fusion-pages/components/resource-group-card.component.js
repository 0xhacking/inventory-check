(function () {
  'use strict';

  angular.module('Hercules')
    .component('resourceGroupCard', {
      bindings: {
        group: '<resourceGroup',
        onChange: '&',
        forceOpen: '<',
      },
      templateUrl: 'modules/hercules/fusion-pages/components/resource-group-card.html',
      controller: ResourceGroupCardController,
    });

  /* @ngInject */
  function ResourceGroupCardController($modal) {
    var ctrl = this;

    ctrl.showDetails = false;
    ctrl.openAddClusterModal = openAddClusterModal;
    ctrl.toggleDetails = toggleDetails;
    ctrl.showWarningText = showWarningText;
    ctrl.$onChanges = $onChanges;

    function toggleDetails() {
      ctrl.showDetails = !ctrl.showDetails;
    }

    function $onChanges(changes) {
      if (changes.forceOpen) {
        ctrl.showDetails = changes.forceOpen.currentValue;
      }
    }

    function openAddClusterModal() {
      $modal.open({
        resolve: {
          resourceGroup: function () {
            return ctrl.group;
          }
        },
        controller: 'AssignClustersController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/fusion-pages/resource-group-settings/assign-clusters.html',
        type: 'small'
      }).result
      .then(ctrl.onChange);
    }

    function showWarningText() {
      return ctrl.group.clusters.length === 0;
    }
  }

})();
