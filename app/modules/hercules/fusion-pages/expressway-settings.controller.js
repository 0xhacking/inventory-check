(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayClusterSettingsController', ExpresswayClusterSettingsController);

  /* @ngInject */
  function ExpresswayClusterSettingsController($stateParams, FusionClusterService, Notification, $modal, $translate, ResourceGroupService, hasF237FeatureToggle) {
    var vm = this;
    vm.backUrl = 'cluster-list';
    vm.enabledServices = [];
    vm.newClusterName = '';
    vm.upgradeSchedule = {
      title: 'hercules.expresswayClusterSettings.upgradeScheduleHeader'
    };
    vm.resourceGroup = {
      title: 'hercules.expresswayClusterSettings.resourceGroupsHeader'
    };
    vm.releasechannel = {
      title: 'hercules.expresswayClusterSettings.releasechannelHeader'
    };
    vm.deactivateServices = {
      title: 'hercules.expresswayClusterSettings.deactivateServicesHeader'
    };
    vm.deregisterClusterSection = {
      title: 'hercules.expresswayClusterSettings.deregisterClusterHeader'
    };
    vm.localizedClusterNameWatermark = $translate.instant('hercules.expresswayClusterSettings.clusterNameWatermark');
    vm.showResourceGroups = hasF237FeatureToggle;
    vm.deactivateService = deactivateService;
    vm.allowedChannels = [];

    loadCluster($stateParams.id);

    function loadCluster(clusterid) {
      FusionClusterService.get(clusterid)
        .then(function (cluster) {
          vm.cluster = cluster;
          vm.releasechannelsPlaceholder = $translate.instant('hercules.fusion.add-resource-group.release-channel.' + vm.cluster.releaseChannel);
          vm.releasechannelsSelected = '';
          vm.releasechannelsOptions = [''];
          vm.localizedTitle = $translate.instant('hercules.expresswayClusterSettings.pageTitle', {
            clusterName: cluster.name
          });
          vm.newClusterName = vm.cluster.name;
          vm.enabledServices = _.map(cluster.provisioning, 'connectorType');

          if (vm.showResourceGroups) {
            ResourceGroupService.getAll()
              .then(buildResourceOptions)
              .then(function (groups) {
                vm.resourceGroupOptions = groups;
                return cluster.resourceGroupId;
              })
              .then(getCurrentResourceGroup)
              .then(function (group) {
                vm.originalResourceGroup = group;
                vm.selectedResourceGroup = group;
              });
          }
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    }

    vm.showResourceGroupModal = function () {
      var isUpgradingConnectors = vm.originalResourceGroup.releaseChannel !== vm.selectedResourceGroup.releaseChannel;
      if (vm.selectedResourceGroup.value === '') { // user is removing resource group
        $modal.open({
          templateUrl: 'modules/hercules/fusion-pages/remove-from-resource-group-dialog.html',
          type: 'dialog',
          controller: function () {
            var ctrl = this;
            ctrl.clusterName = vm.cluster.name;
            ctrl.currentGroup = vm.originalResourceGroup.groupName;
            ctrl.isUpgradingConnectors = isUpgradingConnectors;
            ctrl.connectors = buildConnectorList(vm.enabledServices);
          },
          controllerAs: 'ctrl'
        })
          .result.then(function () {
            ResourceGroupService.assign(vm.cluster.id, '')
              .then(function () {
                var willUpgrade = isUpgradingConnectors ? $translate.instant('hercules.expresswayClusterSettings.allConnectorsWillBeUpgraded') : '';
                Notification.success($translate.instant('hercules.expresswayClusterSettings.removeFromResourceGroupSuccess', {
                  ClusterName: vm.cluster.name,
                  ResourceGroup: vm.originalResourceGroup.groupName
                }) + ' ' + willUpgrade);
                vm.releasechannelsSelected = $translate.instant('hercules.fusion.add-resource-group.release-channel.' + vm.selectedResourceGroup.releaseChannel);
                vm.originalResourceGroup = vm.selectedResourceGroup;
              })
              .catch(function (error) {
                vm.selectedResourceGroup = vm.originalResourceGroup;
                Notification.errorWithTrackingId(error, 'hercules.genericFailure');
              });
          })
          .catch(function () {
            vm.selectedResourceGroup = vm.originalResourceGroup;
          });
      } else { // user is setting a new resource group
        $modal.open({
          templateUrl: 'modules/hercules/fusion-pages/assign-new-resource-group-dialog.html',
          type: 'dialog',
          controller: function () {
            var ctrl = this;
            ctrl.clusterName = vm.cluster.name;
            ctrl.newGroup = vm.selectedResourceGroup.groupName;
            ctrl.isUpgradingConnectors = isUpgradingConnectors;
            ctrl.connectors = buildConnectorList(vm.enabledServices);
          },
          controllerAs: 'ctrl'
        })
          .result.then(function () {
            ResourceGroupService.assign(vm.cluster.id, vm.selectedResourceGroup.value)
              .then(function () {
                var willUpgrade = isUpgradingConnectors ? $translate.instant('hercules.expresswayClusterSettings.allConnectorsWillBeUpgraded') : '';
                Notification.success($translate.instant('hercules.expresswayClusterSettings.moveResourceGroupSuccess', {
                  ClusterName: vm.cluster.name,
                  NewResourceGroup: vm.selectedResourceGroup.groupName
                }) + ' ' + willUpgrade);
                vm.releasechannelsSelected = $translate.instant('hercules.fusion.add-resource-group.release-channel.' + vm.selectedResourceGroup.releaseChannel);
                vm.originalResourceGroup = vm.selectedResourceGroup;
              }).catch(function (error) {
                vm.selectedResourceGroup = vm.originalResourceGroup;
                Notification.errorWithTrackingId(error, 'hercules.genericFailure');
              });
          }).catch(function () {
            vm.selectedResourceGroup = vm.originalResourceGroup;
          });
      }
    };

    function buildResourceOptions(groups) {
      var resourceGroupsOptions = [{
        label: $translate.instant('hercules.resourceGroups.noGroupSelected'),
        value: '',
        groupName: '',
        releaseChannel: 'stable'
      }];
      if (groups && groups.length > 0) {
        _.each(groups, function (group) {
          resourceGroupsOptions.push({
            label: group.name + (group.releaseChannel ? ' (' + $translate.instant('hercules.fusion.add-resource-group.release-channel.' + group.releaseChannel) + ')' : ''),
            value: group.id,
            groupName: group.name,
            releaseChannel: group.releaseChannel
          });
        });
      }
      return _.sortBy(resourceGroupsOptions, function (o) {
        return o.groupName;
      });
    }

    function getCurrentResourceGroup(resourceGroupId) {
      if (resourceGroupId) {
        return ResourceGroupService.get(resourceGroupId)
          .then(function (response) {
            return _.find(vm.resourceGroupOptions, function (option) {
              return option.value === response.id;
            });
          });
      } else {
        return vm.resourceGroupOptions[0];
      }
    }

    function buildConnectorList(services) {
      return _.map(services, function (service) {
        if (service === 'c_cal') {
          return $translate.instant('hercules.connectorNameFromConnectorType.c_cal');
        }
        if (service === 'c_ucmc') {
          return $translate.instant('hercules.connectorNameFromConnectorType.c_ucmc');
        }
        if (service === 'c_mgmt') {
          return $translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
        }
      });
    }

    function deactivateService(serviceId, cluster) {
      $modal.open({
        templateUrl: 'modules/hercules/resource-settings/deactivate-service-on-expressway-modal.html',
        controller: 'DeactivateServiceOnExpresswayModalController',
        controllerAs: 'deactivateServiceOnExpresswayModal',
        type: 'small',
        resolve: {
          serviceId: function () {
            vm.serviceId = serviceId;
            return vm.serviceId;
          },
          clusterName: function () {
            vm.clusterName = cluster.name;
            return vm.clusterName;
          },
          clusterId: function () {
            vm.clusterId = cluster.id;
            return vm.clusterId;
          }
        }
      }).result
        .then(function () {
          loadCluster($stateParams.id);
        });
    }

    function getAvailableReleaseChannels() {
      ResourceGroupService.getAllowedChannels()
        .then(function (channels) {
          vm.allowedChannels = channels;
        });
    }
    getAvailableReleaseChannels();

    vm.filterServices = function (connector) {
      return connector === 'c_cal' || connector === 'c_ucmc';
    };

    vm.getLocalizedServiceName = function (connector) {
      return $translate.instant('hercules.serviceNameFromConnectorType.' + connector);
    };

    /* Callback function used by <rename-and-deregister-cluster-section>  */
    vm.nameUpdated = function () {
      loadCluster($stateParams.id);
    };

  }
})();
