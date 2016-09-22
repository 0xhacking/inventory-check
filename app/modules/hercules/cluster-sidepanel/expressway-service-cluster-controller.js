(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayServiceClusterController', ExpresswayServiceClusterController);

  /* @ngInject */
  function ExpresswayServiceClusterController($scope, $state, $modal, $stateParams, $translate, ClusterService, FusionUtils, $timeout, hasF410FeatureToggle, hasF237FeatureToggle, FusionClusterService) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.clusterId;
    vm.connectorType = $stateParams.connectorType;
    vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);
    vm.serviceName = $translate.instant('hercules.serviceNames.' + vm.servicesId[0]);
    vm.connectorName = $translate.instant('hercules.connectorNames.' + vm.servicesId[0]);
    vm.getSeverity = ClusterService.getRunningStateSeverity;
    vm.route = FusionUtils.connectorType2RouteName(vm.connectorType);
    vm.showDeregisterDialog = showDeregisterDialog;
    vm.showUpgradeDialog = showUpgradeDialog;
    vm.fakeUpgrade = false;
    vm.hasF410FeatureToggle = hasF410FeatureToggle;
    vm.hasF237FeatureToggle = hasF237FeatureToggle;
    vm.hasConnectorAlarm = hasConnectorAlarm;

    var promise = null;
    $scope.$watch(function () {
      return ClusterService.getCluster(vm.connectorType, vm.clusterId);
    }, function (newValue) {
      vm.cluster = newValue;
      vm.releaseChannel = $translate.instant('hercules.fusion.add-resource-group.release-channel.' + vm.cluster.releaseChannel);
      var isUpgrading = vm.cluster.aggregates.upgradeState === 'upgrading';
      vm.softwareUpgrade = {
        provisionedVersion: vm.cluster.aggregates.provisioning.provisionedVersion,
        availableVersion: vm.cluster.aggregates.provisioning.availableVersion,
        isUpgradeAvailable: vm.cluster.aggregates.upgradeAvailable,
        hasUpgradeWarning: vm.cluster.aggregates.upgradeWarning,
        numberOfHosts: _.size(vm.cluster.aggregates.hosts),
        showUpgradeWarning: function () {
          return vm.softwareUpgrade.isUpgradeAvailable && !vm.softwareUpgrade.hasUpgradeWarning;
        }
      };

      if (isUpgrading) {
        vm.fakeUpgrade = false;
        var pendingHosts = _.chain(vm.cluster.aggregates.hosts)
          .filter({ upgradeState: 'pending' })
          .value();
        vm.upgradeDetails = {
          numberOfUpsmthngHosts: _.size(vm.cluster.aggregates.hosts) - pendingHosts.length,
          upgradingHostname: findUpgradingHostname(vm.cluster.aggregates.hosts)
        };
      }

      // If the upgrade is finished, display the success status during 2s
      vm.upgradeJustFinished = !isUpgrading && vm.fakeUpgrade;
      if (vm.upgradeJustFinished) {
        promise = $timeout(function () {
          vm.showUpgradeProgress = false;
        }, 2000);
      }
      vm.showUpgradeProgress = vm.fakeUpgrade || isUpgrading || vm.upgradeJustFinished;
    }, true);

    function showDeregisterDialog() {
      $modal.open({
        resolve: {
          cluster: function () {
            return vm.cluster;
          },
          isF410enabled: false
        },
        controller: 'ClusterDeregisterController',
        controllerAs: 'clusterDeregister',
        templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html',
        type: 'small'
      })
        .result.then(function () {
          $state.sidepanel.close();
        });
    }

    function showUpgradeDialog() {
      $modal.open({
        templateUrl: 'modules/hercules/software-upgrade/software-upgrade-dialog.html',
        type: 'small',
        controller: 'SoftwareUpgradeController',
        controllerAs: 'softwareUpgradeCtrl',
        resolve: {
          servicesId: function () {
            return vm.servicesId;
          },
          connectorType: function () {
            return vm.connectorType;
          },
          cluster: function () {
            return vm.cluster;
          },
          softwareUpgrade: function () {
            return vm.softwareUpgrade;
          }
        }
      }).result.then(function () {
        vm.fakeUpgrade = vm.showUpgradeProgress = true;
      });

      $scope.$on('$destroy', function () {
        $timeout.cancel(promise);
      });
    }

    function findUpgradingHostname(hostnames) {
      var upgrading = _.chain(hostnames)
        .find({ upgradeState: 'upgrading' })
        .value();
      // could be undefined if we only have upgraded and pending connectors
      return _.get(upgrading, 'hostname', '');
    }

    if (hasF410FeatureToggle) {
      vm.schedule = {};
      FusionClusterService.get(vm.clusterId)
        .then(function (cluster) {
          vm.F410cluster = FusionClusterService.buildSidepanelConnectorList(cluster, vm.connectorType);
          vm.schedule.dateTime = FusionClusterService.formatTimeAndDate(cluster.upgradeSchedule);
          vm.schedule.timeZone = cluster.upgradeSchedule.scheduleTimeZone;
        });
      vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorType);
      vm.localizedManagementConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
    }

    function hasConnectorAlarm(connector) {
      if (connector.alarms.length > 0) {
        return true;
      } else {
        return false;
      }
    }

    vm.sortConnectors = function (connector) {
      if (connector.connectorType === 'c_mgmt') {
        return -1;
      } else {
        return connector.connectorType;
      }
    };

  }
}());
