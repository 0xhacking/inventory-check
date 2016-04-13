(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FusionResourceListController', FusionResourceListController);

  /* @ngInject */
  function FusionResourceListController($window, $filter, ClusterService, XhrNotificationService, $log) {
    var vm = this;
    var clustersCache = [];

    vm.loading = true;
    vm.activeFilter = 'all';
    vm.displayedClusters = [];
    vm.placeholder = {
      name: 'All',
      filterValue: 'all',
      count: 0
    };
    vm.filters = [{
      name: 'Expressway',
      filterValue: 'expressway',
      count: 0,
    }, {
      name: 'Non-Expressway',
      filterValue: 'non-expressway',
      count: 0,
    }];
    vm.addResource = addResource;
    vm.countNodes = countNodes;
    vm.setFilter = setFilter;
    vm.searchData = searchData;

    loadClusters();

    function loadClusters() {
      ClusterService.getAll()
        .then(function (clusters) {
          clustersCache = clusters;
          updateFilters();
          vm.displayedClusters = addServicesStatusesTo(clusters);
        }, XhrNotificationService.notify)
        .finally(function () {
          vm.loading = false;
        });
    }

    function addResource() {
      $window.alert('yo');
    }

    function countNodes(cluster) {
      return _.chain(cluster.connectors)
        .map('hostname')
        .uniq()
        .size()
        .value();
    }

    function addServicesStatusesTo(clusters) {
      return _.map(clusters, function (cluster) {
        var mgmtConnectors = _.filter(cluster.connectors, 'connectorType', 'c_mgmt');
        var ucmcConnectors = _.filter(cluster.connectors, 'connectorType', 'c_ucmc');
        var calConnectors = _.filter(cluster.connectors, 'connectorType', 'c_cal');
        cluster.servicesStatuses = [{
          name: 'Management',
          status: ClusterService.mergeRunningState(mgmtConnectors),
          total: mgmtConnectors.length
        }, {
          name: 'Call',
          status: ClusterService.mergeRunningState(ucmcConnectors),
          total: ucmcConnectors.length
        }, {
          name: 'Calendar',
          status: ClusterService.mergeRunningState(calConnectors),
          total: calConnectors.length
        }];
        return cluster;
      });
    }

    function updateFilters() {
      var expressWayClusters = _.filter(clustersCache, isExpresswayCluster);
      vm.placeholder.count = clustersCache.length;
      vm.filters[0].count = expressWayClusters.length;
      vm.filters[1].count = clustersCache.length - expressWayClusters.length;
    }

    function isExpresswayCluster(cluster) {
      return _.some(cluster.connectors, {
        connectorType: 'c_mgmt'
      });
    }

    function setFilter(filter) {
      vm.activeFilter = filter.filterValue || 'all';
      if (filter.filterValue === 'expressway') {
        vm.displayedClusters = _.filter(clustersCache, isExpresswayCluster);
      } else if (filter.filterValue === 'non-expressway') {
        vm.displayedClusters = _.filter(clustersCache, !isExpresswayCluster);
      } else {
        vm.displayedClusters = clustersCache;
      }
    }

    function searchData(searchStr) {
      if (searchStr === '') {
        vm.displayedClusters = clustersCache;
      } else {
        vm.displayedClusters = $filter('filter')(clustersCache, searchStr);
      }
    }
  }
})();
