(function () {
  'use strict';

  angular
    .module('HDS')
    .service('HDSAddResourceCommonService', HDSAddResourceCommonService);

  /* @ngInject */
  function HDSAddResourceCommonService($log, $window, FusionClusterService, Notification, ServiceDescriptor) {
    var vm = this;
    vm.clusters = null;
    vm.onlineNodeList = [];
    vm.offlineNodeList = [];
    vm.selectedClusterId = '';
    vm.currentServiceId = 'spark-hybrid-datasecurity';

    function updateClusterLists() {
      vm.clusters = null;
      vm.onlineNodeList = [];
      vm.offlineNodeList = [];
      // returns a promise directly
      return FusionClusterService.getAll()
        .then(function (clusters) {
          $log.info('updateClusterLists clusters', clusters);
          vm.clusters = _.filter(clusters, { targetType: 'hds_app' });
          // vm.clusters already had only hds clusters, let's use the shorthand version
          // if _.map() to extract the name of each cluster
          var clusterList = _.map(vm.clusters, function (cluster) {
            return cluster.name;
          });
          clusterList.sort();

          var connectors = _.flatten(_.map(vm.clusters, function (cluster) {
            return cluster.connectors;
          }));
          _.each(connectors, function (connector) {
            if ('running' === connector.state) {
              vm.onlineNodeList.push(connector.hostname);
            } else {
              vm.offlineNodeList.push(connector.hostname);
            }
          });
          // inside a promise, we can just return a value
          $log.info('updateClusterLists clusterList', clusterList);
          return clusterList;
        });
    }

    function addRedirectTargetClicked(hostName, enteredCluster) {
      vm.clusterDetail = null;
      //Checking if the host is already present
      if (vm.onlineNodeList.indexOf(hostName) > -1) {
        Notification.error('hds.add-resource-dialog.serverOnline');
        return;
      }

      if (vm.offlineNodeList.indexOf(hostName) > -1) {
        Notification.error('hds.add-resource-dialog.serverOffline');
        return;
      }

      //Checking if value in selected cluster is in cluster list
      _.each(vm.clusters, function (cluster) {
        if (cluster.name === enteredCluster) {
          vm.clusterDetail = cluster;
        }
      });
      if (vm.clusterDetail == null) {
      //TODO: fix for fusion cluster
        return FusionClusterService.preregisterCluster(enteredCluster, 'stable', 'hds_app')
          .then(function (resp) {
            vm.selectedClusterId = resp.id;
            return allowListHost(hostName, vm.selectedClusterId);
          })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hds.clusters.clusterCreationFailed', { enteredCluster: enteredCluster });
        });
      } else {
        vm.selectedClusterId = vm.clusterDetail.id;
        return allowListHost(hostName, vm.selectedClusterId);
      }
    }

    function allowListHost(hostName, clusterId) {
      return FusionClusterService.addPreregisteredClusterToAllowList(hostName, 3600, clusterId);
    }

    function redirectPopUpAndClose(hostName, enteredCluster, clusterId, firstTimeSetup) {
      if (firstTimeSetup) {
        ServiceDescriptor.enableService('spark-hybrid-datasecurity');
      }
      vm.popup = $window.open('https://' + encodeURIComponent(hostName) + '/?clusterName=' + encodeURIComponent(enteredCluster) + '&clusterId=' + encodeURIComponent(vm.selectedClusterId));
    }

    return {
      addRedirectTargetClicked: addRedirectTargetClicked,
      updateClusterLists: updateClusterLists,
      redirectPopUpAndClose: redirectPopUpAndClose
    };

  }
}());
