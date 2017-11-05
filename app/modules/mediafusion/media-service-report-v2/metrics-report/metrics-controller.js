(function () {
  'use strict';

  angular.module('Mediafusion').controller('MetricsContoller', MetricsContoller);
  /* @ngInject */
  function MetricsContoller($translate, MediaClusterServiceV2, $q, MetricsReportServiceV2, Notification, MetricsGraphServiceV2, DummyMetricsReportServiceV2, $interval, $scope, CardUtils) {
    var vm = this;
    var interval = null;
    vm.ABORT = 'ABORT';
    vm.REFRESH = 'refresh';
    vm.SET = 'set';
    vm.EMPTY = 'empty';
    vm.clusterFilter = null;
    vm.timeFilter = null;
    vm.callVolumeChart = null;
    vm.availabilityChart = null;
    vm.utilizationChart = null;
    vm.clusterUpdate = clusterUpdate;
    vm.timeUpdate = timeUpdate;
    vm.isRefresh = isRefresh;
    vm.isEmpty = isEmpty;
    vm.setAllRealTimeGraphs = setAllRealTimeGraphs;
    vm.setAllHistoricalGraphs = setAllHistoricalGraphs;
    vm.setRealTimeCallVolumeData = setRealTimeCallVolumeData;
    vm.setRealTimeAvailabilityData = setRealTimeAvailabilityData;
    vm.setRealTimeUtilizationData = setRealTimeUtilizationData;
    vm.setRealTimeTotalCallsData = setRealTimeTotalCallsData;
    vm.setRealTimeClusterAvailability = setRealTimeClusterAvailability;
    vm.setCallVolumeHistoricalData = setCallVolumeHistoricalData;
    vm.setAvailabilityHistoricalData = setAvailabilityHistoricalData;
    vm.setUtilizationHistoricalData = setUtilizationHistoricalData;
    vm.setTotalCallsHistoricalData = setTotalCallsHistoricalData;
    vm.setClusterAvailabilityHistorical = setClusterAvailabilityHistorical;
    vm.clusterUpdateFromTooltip = clusterUpdateFromTooltip;
    vm.tooltipDataUpdate = tooltipDataUpdate;
    vm.changeTabs = changeTabs;
    vm.resizeCards = resizeCards;
    vm.delayedResize = delayedResize;
    vm.setDummyData = setDummyData;
    vm.callVolumeStatus = vm.REFRESH;
    vm.availabilityStatus = vm.REFRESH;
    vm.utilizationStatus = vm.REFRESH;
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    vm.noData = $translate.instant('mediaFusion.metrics.nodata');
    vm.percentage = $translate.instant('mediaFusion.metrics.percentage');
    vm.utilization = $translate.instant('mediaFusion.metrics.utilization');
    vm.average_utilzation = $translate.instant('mediaFusion.metrics.avgutilization');
    vm.errorData = $translate.instant('mediaFusion.metrics.errordata');
    vm.clusterOptions = [vm.allClusters];
    vm.clusterSelected = vm.clusterOptions[0];
    vm.clusterId = vm.clusterOptions[0];
    vm.clusterAvailabilityArray = [];
    vm.overflowedToCloudArray = [];
    vm.hostedOnPremisesArray = [];
    vm.updateInterval = 300000;
    vm.Map = {};
    var deferred = $q.defer();

    vm.displayHistorical = true;
    vm.displayRealtime = false;

    vm.realTimeOptions = [{
      value: 4,
      label: $translate.instant('mediaFusion.metrics.last4Hours'),
      description: $translate.instant('mediaFusion.metrics.last4Hours')
    }];

    vm.timeOptions = [{
      value: 0,
      label: $translate.instant('mediaFusion.metrics.today'),
      description: $translate.instant('mediaFusion.metrics.today2')
    }, {
      value: 1,
      label: $translate.instant('mediaFusion.metrics.week'),
      description: $translate.instant('mediaFusion.metrics.week2')
    }, {
      value: 2,
      label: $translate.instant('mediaFusion.metrics.month'),
      description: $translate.instant('mediaFusion.metrics.month2')
    }, {
      value: 3,
      label: $translate.instant('mediaFusion.metrics.threeMonths'),
      description: $translate.instant('mediaFusion.metrics.threeMonths2')
    }];
    vm.timeSelected = vm.timeOptions[0];
    vm.displayDate = displayDate;

    displayDate();

    vm.realTimeSelected = vm.realTimeOptions[0];
    vm.realTimeDisplayDate = realTimeDisplayDate;
    realTimeDisplayDate();

    function changeInterval() {
      if (vm.displayHistorical) {
        vm.updateInterval = 300000;
      }
      if (vm.displayRealtime) {
        vm.updateInterval = 60000;
      }
    }

    changeInterval();

    function changeTabs(isDisplayHistorical, isDisplayRealtime) {
      vm.displayHistorical = isDisplayHistorical;
      vm.displayRealtime = isDisplayRealtime;
      changeInterval();
      clusterUpdate();
      $interval.cancel(interval);
      interval = $interval(clusterUpdate, vm.updateInterval);
    }

    function realTimeDisplayDate() {
      var date1 = new Date();
      var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      if (vm.realTimeSelected.value === 4) {

        vm.label = vm.realTimeSelected.label;
        vm.date = date1.getHours() + ':' + (date1.getMinutes() < 10 ? '0' : '') + date1.getMinutes() + ' ' + month[date1.getMonth()] + ' ' + date1.getDate() + ',' + date1.getFullYear();
        vm.date = $translate.instant('mediaFusion.metrics.lastRefresh') + ' ' + vm.date;

      }
    }

    function displayDate() {
      var date1 = new Date();
      var date2 = new Date();
      var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      if (vm.timeSelected.value === 0) {

        vm.label = vm.timeSelected.label;
        vm.date = date1.getHours() + ':' + (date1.getMinutes() < 10 ? '0' : '') + date1.getMinutes() + ' ' + month[date1.getMonth()] + ' ' + date1.getDate() + ',' + date1.getFullYear();
        vm.date = $translate.instant('mediaFusion.metrics.lastRefresh') + ' ' + vm.date;

      } else if (vm.timeSelected.value === 1) {

        vm.label = vm.timeSelected.label;
        date1.setDate(date1.getDate() - 7);
        var prevdate = new Date(date1);
        vm.date = month[prevdate.getMonth()] + ' ' + prevdate.getDate() + ',' + ' ' + prevdate.getFullYear() + ' ' + '-' + ' ' + month[date2.getMonth()] + ' ' + date2.getDate() + ',' + ' ' + date2.getFullYear();

      } else if (vm.timeSelected.value === 2) {

        vm.label = vm.timeSelected.label;
        date1.setMonth(date1.getMonth() - 1);
        prevdate = new Date(date1);
        vm.date = month[prevdate.getMonth()] + ' ' + prevdate.getDate() + ',' + ' ' + prevdate.getFullYear() + ' ' + '-' + ' ' + month[date2.getMonth()] + ' ' + date2.getDate() + ',' + ' ' + date2.getFullYear();

      } else {

        vm.label = vm.timeSelected.label;
        date1.setMonth(date1.getMonth() - 3);
        prevdate = new Date(date1);
        vm.date = month[prevdate.getMonth()] + ' ' + prevdate.getDate() + ',' + ' ' + prevdate.getFullYear() + ' ' + '-' + ' ' + month[date2.getMonth()] + ' ' + date2.getDate() + ',' + ' ' + date2.getFullYear();

      }
    }

    function getCluster() {
      MediaClusterServiceV2.getAll()
        .then(function (clusters) {
          vm.clusters = _.filter(clusters, { targetType: 'mf_mgmt' });
          _.each(clusters, function (cluster) {
            if (cluster.targetType === "mf_mgmt") {
              vm.clusterOptions.push(cluster.name);
              vm.Map[cluster.name] = cluster.id;
            }
          });
          deferred.resolve(vm.Map);
          vm.clusterId = vm.clusterOptions[0];
          vm.clusterSelected = vm.clusterOptions[0];

        }).catch(function (err) {
          Notification.errorWithTrackingId(err, vm.errorData);
        });
      return deferred.promise;
    }

    function getClusterName(graphs) {
      vm.tempData = [];
      _.forEach(graphs, function (value) {
        var clusterName = _.findKey(vm.Map, function (val) {
          return val === value.valueField;
        });
        if (!_.isUndefined(clusterName)) {
          value.title = clusterName;
          if (vm.allClusters !== vm.clusterId && vm.clusterSelected !== value.title) {
            value.lineAlpha = 0.2;
          }
          value.balloonText = '<span class="graph-text">' + value.title + ' ' + vm.utilization + ' <span class="graph-number">[[value]]</span></span>';
          value.lineThickness = 2;
        }
        if (value.valueField === 'average_util') {
          value.title = vm.average_utilzation;
          value.lineColor = '#4E5051';
          value.dashLength = 4;
          value.balloonText = '<span class="graph-text">' + value.title + ' <span class="graph-number">[[value]]</span></span>';
          value.lineThickness = 2;
        }
        if (value.title !== value.valueField) {
          value.connect = false;
          vm.tempData.push(value);
        }
      });
      return vm.tempData;
    }

    function clusterUpdate() {
      vm.callVolumeStatus = vm.REFRESH;
      vm.availabilityStatus = vm.REFRESH;
      vm.utilizationStatus = vm.REFRESH;
      if (vm.clusterSelected !== vm.allClusters) {
        vm.clusterId = vm.Map[vm.clusterSelected];
      } else {
        vm.clusterId = vm.allClusters;
      }
      if (vm.displayHistorical) {
        displayDate();
        setDummyData();
        setAllHistoricalGraphs();
      } else {
        realTimeDisplayDate();
        setAllRealTimeGraphs();
      }
    }

    function clusterUpdateFromTooltip(selectedCluster) {
      vm.clusterSelected = selectedCluster;
      clusterUpdate();
    }

    function timeUpdate() {
      displayDate();
      vm.callVolumeStatus = vm.REFRESH;
      vm.availabilityStatus = vm.REFRESH;
      vm.utilizationStatus = vm.REFRESH;
      setDummyData();
      setAllHistoricalGraphs();
    }

    function loadDatas() {
      getCluster();
      deferred.promise.then(function () {
        clusterUpdate();
      });
    }

    loadDatas();

    $scope.$on('clusterClickEvent', function (event, data) {
      if (vm.clusterSelected === vm.allClusters) {
        clusterUpdateFromTooltip(data.data);
      }
    });

    // Code for auto reload the rest calls every 5 minutes For Historical & 1 minute For Real Time
    interval = $interval(clusterUpdate, vm.updateInterval);
    $scope.$on('$destroy', function () {
      $interval.cancel(interval);
    });

    // Graph data status checks
    function isRefresh(tab) {
      return tab === vm.REFRESH;
    }

    function isEmpty(tab) {
      return tab === vm.EMPTY;
    }

    function setAllRealTimeGraphs() {
      setRealTimeUtilizationData();
      setRealTimeAvailabilityData();
      setRealTimeCallVolumeData();
      setRealTimeTotalCallsData();
      setRealTimeClusterAvailability();
    }

    function setAllHistoricalGraphs() {
      setUtilizationHistoricalData();
      setAvailabilityHistoricalData();
      setCallVolumeHistoricalData();
      setTotalCallsHistoricalData();
      setClusterAvailabilityHistorical();
      tooltipDataUpdate();
    }

    function resizeCards() {
      CardUtils.resize();
    }

    function delayedResize() {
      // delayed resize necessary to fix any overlapping cards on smaller screens
      CardUtils.resize(500);
    }

    function setDummyData() {
      setCallVolumeHistoricalGraph(DummyMetricsReportServiceV2.dummyCallVolumeData(vm.timeSelected));
      setAvailabilityHistoricalGraph(DummyMetricsReportServiceV2.dummyAvailabilityData(vm.timeSelected));
      setUtilizationHistoricalGraph(DummyMetricsReportServiceV2.dummyUtilizationData(vm.timeSelected), DummyMetricsReportServiceV2.dummyUtilizationGraph());
      resizeCards();
    }

    function setRealTimeCallVolumeGraph(data) {
      var tempCallVolumeChart = MetricsGraphServiceV2.setCallVolumeGraph(data, vm.callVolumeChart, vm.clusterSelected, vm.realTimeSelected.label, vm.displayHistorical);
      if (tempCallVolumeChart !== null && !_.isUndefined(tempCallVolumeChart)) {
        vm.callVolumeChart = tempCallVolumeChart;
      }
    }

    function setRealTimeCallVolumeData() {
      MetricsReportServiceV2.getCallVolumeData(vm.realTimeSelected, vm.clusterId).then(function (response) {
        if (response === vm.ABORT) {
          return;
        } else if (response.graphData.length === 0) {
          vm.callVolumeStatus = vm.EMPTY;
          setRealTimeCallVolumeGraph(DummyMetricsReportServiceV2.dummyCallVolumeData(vm.realTimeSelected));
        } else {
          setRealTimeCallVolumeGraph(response.graphData);
          vm.callVolumeStatus = vm.SET;
        }
        resizeCards();
      });
    }

    function setRealTimeAvailabilityGraph(data) {
      var tempData = angular.copy(data);
      if (_.isUndefined(data.data[0].isDummy)) {
        var availabilityData = [];
        if (vm.clusterId === vm.allClusters) {
          _.forEach(data.data[0].clusterCategories, function (clusterCategory) {
            var clusterName = _.findKey(vm.Map, function (val) {
              return val === clusterCategory.category;
            });
            if (!_.isUndefined(clusterName)) {
              clusterCategory.category = clusterName;
              availabilityData.push(clusterCategory);
            }
          });
          if (availabilityData.length === 0) {
            return false;
          }
          tempData.data[0].clusterCategories = availabilityData;
        }
      }
      var tempAvailabilityChart = MetricsGraphServiceV2.setAvailabilityGraph(tempData, vm.availabilityChart, vm.clusterId, vm.clusterSelected, vm.realTimeSelected.label, vm.displayHistorical);
      if (tempAvailabilityChart !== null && !_.isUndefined(tempAvailabilityChart)) {
        vm.availabilityChart = tempAvailabilityChart;
      }
      return true;
    }

    function setRealTimeAvailabilityData() {
      MetricsReportServiceV2.getAvailabilityData(vm.realTimeSelected, vm.clusterId).then(function (response) {
        if (response === vm.ABORT) {
          return;
        } else if (_.isUndefined(response.data) || !_.isArray(response.data) || response.data.length === 0 || _.isUndefined(response.data[0].clusterCategories) || response.data[0].clusterCategories.length === 0) {
          vm.availabilityStatus = vm.EMPTY;
          setRealTimeAvailabilityGraph(DummyMetricsReportServiceV2.dummyAvailabilityData(vm.realTimeSelected));
        } else {
          deferred.promise.then(function () {
            if (!setRealTimeAvailabilityGraph(response)) {
              vm.availabilityStatus = vm.EMPTY;
              setRealTimeAvailabilityGraph(DummyMetricsReportServiceV2.dummyAvailabilityData(vm.realTimeSelected));
            } else {
              vm.availabilityStatus = vm.SET;
            }
          }, //when promise of clusterid to name is a reject this gets executed
            function () {
              setRealTimeAvailabilityGraph(DummyMetricsReportServiceV2.dummyAvailabilityData(vm.realTimeSelected));
              vm.availabilityStatus = vm.EMPTY;
            });
        }
        resizeCards();
      });
    }

    function setRealTimeUtilizationGraph(data, graphs) {
      var tempUtilizationChart = MetricsGraphServiceV2.setUtilizationGraph(data, graphs, vm.utilizationChart, vm.clusterSelected, vm.realTimeSelected, vm.displayHistorical);
      if (tempUtilizationChart !== null && !_.isUndefined(tempUtilizationChart)) {
        vm.UtilizationChart = tempUtilizationChart;
      }
    }

    function setRealTimeUtilizationData() {
      if (vm.clusterId === vm.allClusters) {
        MetricsReportServiceV2.getUtilizationData(vm.realTimeSelected, vm.allClusters).then(function (response) {
          if (response === vm.ABORT) {
            return;
          } else if (_.isUndefined(response.graphData) || _.isUndefined(response.graphs) || response.graphData.length === 0) {
            vm.utilizationStatus = vm.EMPTY;
            setRealTimeUtilizationGraph(DummyMetricsReportServiceV2.dummyUtilizationData(vm.realTimeSelected), DummyMetricsReportServiceV2.dummyUtilizationGraph());
          } else {
            deferred.promise.then(function () {
              vm.utilizationClusterName = getClusterName(response.graphs);
              setRealTimeUtilizationGraph(response.graphData, vm.utilizationClusterName);
              vm.card = '';
              vm.utilizationStatus = vm.SET;
            },  //when promise of clusterid to name is a reject this gets executed
            function () {
              setRealTimeUtilizationGraph(DummyMetricsReportServiceV2.dummyUtilizationData(vm.realTimeSelected), DummyMetricsReportServiceV2.dummyUtilizationGraph());
              vm.utilizationStatus = vm.EMPTY;
            });
          }
          resizeCards();
        });
      } else {
        MetricsReportServiceV2.getUtilizationData(vm.realTimeSelected, vm.allClusters).then(function (response) {
          if (response === vm.ABORT) {
            return;
          } else if (_.isUndefined(response.graphData) || _.isUndefined(response.graphs) || response.graphData.length === 0) {
            vm.utilizationStatus = vm.EMPTY;
          } else {
            for (var i = 0; i < response.graphs.length; i++) {
              if (response.graphs[i].valueField !== vm.clusterId) {
                vm.utilizationStatus = vm.EMPTY;
                setRealTimeUtilizationGraph(DummyMetricsReportServiceV2.dummyUtilizationData(vm.realTimeSelected), DummyMetricsReportServiceV2.dummyUtilizationGraph());

              } else {
                vm.utilizationClusterName = getClusterName(response.graphs);
                setRealTimeUtilizationGraph(response.graphData, vm.utilizationClusterName);
                vm.card = '';
                vm.utilizationStatus = vm.SET;
                return;
              }
            }
          }
          resizeCards();
        });
      }
    }

    function setRealTimeTotalCallsData() {
      //changing the cluster ID to clister name and this should be changed back to cluster ID in future
      MetricsReportServiceV2.getTotalCallsData(vm.realTimeSelected, vm.clusterSelected).then(function (response) {
        if (vm.clusterId === vm.allClusters) {
          if (response === vm.ABORT) {
            return;
          } else if (_.isUndefined(response.data) || response.data.length === 0) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else if (_.isUndefined(response.data.callsOnPremise) && !_.isUndefined(response.data.callsOverflow)) {
            vm.onprem = vm.noData;
            vm.cloud = response.data.callsOverflow;
            vm.total = vm.cloud;
          } else if (!_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsOverflow)) {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = vm.noData;
            vm.total = vm.onprem;
          } else if (_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsOverflow)) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = response.data.callsOverflow;
            vm.total = vm.onprem + vm.cloud;
          }

        } else {
          if (response === vm.ABORT) {
            return;
          } else if (_.isUndefined(response.data) || response.data.length === 0) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else if (_.isUndefined(response.data.callsOnPremise) && !_.isUndefined(response.data.callsRedirect)) {
            vm.onprem = vm.noData;
            vm.cloud = response.data.callsRedirect;
            vm.total = vm.cloud;
          } else if (!_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsRedirect)) {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = vm.noData;
            vm.total = vm.onprem;
          } else if (_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsRedirect)) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = response.data.callsRedirect;
            vm.total = vm.onprem + vm.cloud;
          }
        }
        resizeCards();
      });

    }

    function setRealTimeClusterAvailability() {
      MetricsReportServiceV2.getClusterAvailabilityData(vm.realTimeSelected, vm.clusterId).then(function (response) {
        if (response === vm.ABORT) {
          return;
        } else if (_.isUndefined(response.data) || response.data.length === 0 || _.isUndefined(response.data.availabilityPercent)) {
          vm.clusterAvailability = vm.EMPTY;
          vm.clusterAvailability = vm.noData;
        } else {
          vm.clusterAvailability = response.data.availabilityPercent + vm.percentage;
        }
        resizeCards();
      });
    }

    function setCallVolumeHistoricalGraph(data) {
      var tempCallVolumeChart = MetricsGraphServiceV2.setCallVolumeGraph(data, vm.callVolumeChart, vm.clusterSelected, vm.timeSelected.label, vm.displayHistorical);
      if (tempCallVolumeChart !== null && !_.isUndefined(tempCallVolumeChart)) {
        vm.callVolumeChart = tempCallVolumeChart;
      }
    }

    function setCallVolumeHistoricalData() {
      MetricsReportServiceV2.getCallVolumeData(vm.timeSelected, vm.clusterId).then(function (response) {
        if (response === vm.ABORT) {
          return;
        } else if (response.graphData.length === 0) {
          vm.callVolumeStatus = vm.EMPTY;
        } else {
          setCallVolumeHistoricalGraph(response.graphData);
          vm.callVolumeStatus = vm.SET;
        }
        resizeCards();
      });
    }

    function setAvailabilityHistoricalGraph(data) {
      var tempData = angular.copy(data);
      if (_.isUndefined(data.data[0].isDummy)) {
        var availabilityData = [];
        if (vm.clusterId === vm.allClusters) {
          _.forEach(data.data[0].clusterCategories, function (clusterCategory) {
            var clusterName = _.findKey(vm.Map, function (val) {
              return val === clusterCategory.category;
            });
            if (!_.isUndefined(clusterName)) {
              clusterCategory.category = clusterName;
              availabilityData.push(clusterCategory);
            }
          });
          if (availabilityData.length === 0) {
            return false;
          }
          tempData.data[0].clusterCategories = availabilityData;
        }
      }
      var tempAvailabilityChart = MetricsGraphServiceV2.setAvailabilityGraph(tempData, vm.availabilityChart, vm.clusterId, vm.clusterSelected, vm.timeSelected.label, vm.displayHistorical);
      if (tempAvailabilityChart !== null && !_.isUndefined(tempAvailabilityChart)) {
        vm.availabilityChart = tempAvailabilityChart;
      }
      return true;
    }

    function setAvailabilityHistoricalData() {
      MetricsReportServiceV2.getAvailabilityData(vm.timeSelected, vm.clusterId).then(function (response) {
        if (response === vm.ABORT) {
          return;
        } else if (_.isUndefined(response.data) || !_.isArray(response.data) || response.data.length === 0 || _.isUndefined(response.data[0].clusterCategories) || response.data[0].clusterCategories.length === 0) {
          vm.availabilityStatus = vm.EMPTY;
        } else {
          deferred.promise.then(function () {
            if (!setAvailabilityHistoricalGraph(response)) {
              vm.availabilityStatus = vm.EMPTY;
              setAvailabilityHistoricalGraph(DummyMetricsReportServiceV2.dummyAvailabilityData(vm.timeSelected));
            } else {
              vm.availabilityStatus = vm.SET;
            }
          }, //when promise of clusterid to name is a reject this gets executed
            function () {
              setAvailabilityHistoricalGraph(DummyMetricsReportServiceV2.dummyAvailabilityData(vm.timeSelected));
              vm.availabilityStatus = vm.EMPTY;
            });
        }
        resizeCards();
      });
    }

    function setUtilizationHistoricalGraph(data, graphs) {
      var tempUtilizationChart = MetricsGraphServiceV2.setUtilizationGraph(data, graphs, vm.utilizationChart, vm.clusterSelected, vm.timeSelected, vm.displayHistorical);
      if (tempUtilizationChart !== null && !_.isUndefined(tempUtilizationChart)) {
        vm.UtilizationChart = tempUtilizationChart;
      }
    }

    function setUtilizationHistoricalData() {
      if (vm.clusterId === vm.allClusters) {
        MetricsReportServiceV2.getUtilizationData(vm.timeSelected, vm.allClusters).then(function (response) {
          if (response === vm.ABORT) {
            return;
          } else if (_.isUndefined(response.graphData) || _.isUndefined(response.graphs) || response.graphData.length === 0) {
            vm.utilizationStatus = vm.EMPTY;
          } else {
            deferred.promise.then(function () {
              vm.utilizationClusterName = getClusterName(response.graphs);
              setUtilizationHistoricalGraph(response.graphData, vm.utilizationClusterName);
              vm.card = '';
              vm.utilizationStatus = vm.SET;
            },  //when promise of clusterid to name is a reject this gets executed
            function () {
              setUtilizationHistoricalGraph(DummyMetricsReportServiceV2.dummyUtilizationData(vm.timeSelected), DummyMetricsReportServiceV2.dummyUtilizationGraph());
              vm.utilizationStatus = vm.EMPTY;
            });
          }
          resizeCards();
        });
      } else {
        MetricsReportServiceV2.getUtilizationData(vm.timeSelected, vm.allClusters).then(function (response) {
          if (response === vm.ABORT) {
            return;
          } else if (_.isUndefined(response.graphData) || _.isUndefined(response.graphs) || response.graphData.length === 0) {
            vm.utilizationStatus = vm.EMPTY;
          } else {
            for (var i = 0; i <= response.graphs.length; i++) {
              if (response.graphs[i].valueField !== vm.clusterId) {
                vm.utilizationStatus = vm.EMPTY;

              } else {
                vm.utilizationClusterName = getClusterName(response.graphs);
                setUtilizationHistoricalGraph(response.graphData, vm.utilizationClusterName);
                vm.card = '';
                vm.utilizationStatus = vm.SET;
                return;
              }
            }
          }
          resizeCards();
        });
      }
    }

    function setTotalCallsHistoricalData() {
      //changing the cluster ID to clister name and this should be changed back to cluster ID in future
      MetricsReportServiceV2.getTotalCallsData(vm.timeSelected, vm.clusterSelected).then(function (response) {
        if (vm.clusterId === vm.allClusters) {
          if (response === vm.ABORT) {
            return;
          } else if (_.isUndefined(response.data) || response.data.length === 0) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else if (_.isUndefined(response.data.callsOnPremise) && !_.isUndefined(response.data.callsOverflow)) {
            vm.onprem = vm.noData;
            vm.cloud = response.data.callsOverflow;
            vm.total = vm.cloud;
          } else if (!_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsOverflow)) {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = vm.noData;
            vm.total = vm.onprem;
          } else if (_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsOverflow)) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = response.data.callsOverflow;
            vm.total = vm.onprem + vm.cloud;
          }

        } else {
          if (response === vm.ABORT) {
            return;
          } else if (_.isUndefined(response.data) || response.data.length === 0) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else if (_.isUndefined(response.data.callsOnPremise) && !_.isUndefined(response.data.callsRedirect)) {
            vm.onprem = vm.noData;
            vm.cloud = response.data.callsRedirect;
            vm.total = vm.cloud;
          } else if (!_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsRedirect)) {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = vm.noData;
            vm.total = vm.onprem;
          } else if (_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsRedirect)) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = response.data.callsRedirect;
            vm.total = vm.onprem + vm.cloud;
          }
        }
        resizeCards();
      });

    }

    function tooltipDataUpdate() {
      vm.clusterAvailabilityArray = [];
      vm.overflowedToCloudArray = [];
      vm.hostedOnPremisesArray = [];
      var cluster_name;
      var overflowedArray = [];
      MetricsReportServiceV2.getClusterAvailabilityTooltip(vm.timeSelected).then(function (response) {
        _.forEach(response.data, function (val) {
          cluster_name = _.findKey(vm.Map, function (value) {
            return value === val.cluster;
          });
          if (val.value !== 100 && cluster_name !== "" && cluster_name !== null && !_.isUndefined(cluster_name)) {
            vm.clusterAvailabilityArray.push({ clusterName: cluster_name, clusterAvailability: val.value });
          }
        });
        vm.clusterAvailabilityArray = _.orderBy(vm.clusterAvailabilityArray, ['clusterAvailability'], ['asc']);
      }, function () {
        Notification.error('mediaFusion.genericError');
      });
      MetricsReportServiceV2.getOverflowedToCloudTooltip(vm.timeSelected).then(function (response) {
        var aggregatedOverflowed = 0;
        _.forEach(response.data, function (val) {
          aggregatedOverflowed = aggregatedOverflowed + val.value;
          overflowedArray.push({ clusterName: val.cluster, overflowedToCloud: val.value });
        });
        _.forEach(overflowedArray, function (val) {
          vm.overflowedToCloudArray.push({ clusterName: val.clusterName, overflowedToCloud: val.overflowedToCloud, percentile: (val.overflowedToCloud / aggregatedOverflowed) * 100 });
        });
        vm.overflowedToCloudArray = _.orderBy(vm.overflowedToCloudArray, ['overflowedToCloud'], ['desc']);
      }, function () {
        Notification.error('mediaFusion.genericError');
      });
      MetricsReportServiceV2.getHostedOnPremisesTooltip(vm.timeSelected).then(function (response) {
        _.forEach(response.data, function (val) {
          _.forEach(vm.clusterOptions, function (option) {
            var cName = option.replace(/\W/g, "").toLowerCase();
            if (cName === val.cluster) {
              vm.hostedOnPremisesArray.push({ clusterName: option, hostedOnPremises: val.value });
            }
          });
        });
        vm.hostedOnPremisesArray = _.orderBy(vm.hostedOnPremisesArray, ['hostedOnPremises'], ['desc']);
      }, function () {
        Notification.error('mediaFusion.genericError');
      });
    }

    function setClusterAvailabilityHistorical() {
      MetricsReportServiceV2.getClusterAvailabilityData(vm.timeSelected, vm.clusterId).then(function (response) {
        if (response === vm.ABORT) {
          return;
        } else if (_.isUndefined(response.data) || response.data.length === 0 || _.isUndefined(response.data.availabilityPercent)) {
          vm.clusterAvailability = vm.EMPTY;
          vm.clusterAvailability = vm.noData;
        } else {
          vm.clusterAvailability = response.data.availabilityPercent + vm.percentage;
        }
        resizeCards();
      });
    }

  }
})();
