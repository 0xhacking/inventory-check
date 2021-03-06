(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageTimelineCtrl', DeviceUsageTimelineCtrl);

  /* @ngInject */
  function DeviceUsageTimelineCtrl($state, $scope, DeviceUsageTimelineService, Notification, deviceUsageFeatureToggle, DeviceUsageCommonService) {
    var vm = this;
    var amChart;
    var apiToUse = 'local';

    vm.loading = true;

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $state.go('login');
    }

    $scope.$on('time-range-changed', function (event, timeSelected) {
      switch (timeSelected.value) {
        case 0:
          loadLastWeek();
          break;
        case 1:
          loadLastMonth();
          break;
        case 2:
          loadLast3Months();
          break;
        default:
          loadLastWeek();
      }
    });

    init();

    function init() {
      var chart = DeviceUsageTimelineService.getLineChart();
      chart.listeners = [
      { event: 'rollOverGraphItem', method: rollOverGraphItem },
      { event: 'rollOutGraphItem', method: rollOutGraphItem },
      { event: 'dataUpdated', method: graphRendered }
      //{ event: 'clickGraphItem', method: clickGraphItem }
      ];

      amChart = AmCharts.makeChart('device-usage-timeline-chart', chart);
      _.each(amChart.graphs, function (graph) {
        graph.balloonFunction = renderBalloon;
      });
      loadInitData();
    }

    function loadChartData(data) {
      amChart.dataProvider = data;
      amChart.validateData();
      vm.showDevices = false;
    }

    function loadInitData() {
      switch (DeviceUsageCommonService.getTimeSelected()) {
        case 0:
          DeviceUsageTimelineService.getDataForLastWeek(['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          break;
        case 1:
          DeviceUsageTimelineService.getDataForLastMonth(['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          break;
        case 2:
          DeviceUsageTimelineService.getDataForLastMonths(3, 'day', ['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
          break;
        default:
          DeviceUsageTimelineService.getDataForLastWeek(['ce', 'sparkboard'], apiToUse).then(loadChartData, handleReject);
      }
    }

    function graphRendered() {
      vm.loading = false;
    }

    function handleReject(reject) {
      vm.loading = false;
      var errors = [];
      if (reject.data && reject.data.message) {
        errors.push(reject.data.message);
      } else {
        errors.push(reject.statusText);
      }
      amChart.dataProvider = [];
      amChart.validateData();
      vm.dateRange = '';
      Notification.notify(errors, 'error');
    }

    function loadLastWeek() {
      vm.loading = true;
      DeviceUsageTimelineService.getDataForLastWeek(['ce', 'sparkboard'], apiToUse).then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
        vm.showDevices = false;
      }, handleReject);
    }

    function loadLastMonth() {
      vm.loading = true;
      DeviceUsageTimelineService.getDataForLastMonth(['ce', 'sparkboard'], apiToUse).then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
        vm.showDevices = false;
      }, handleReject);
    }

    function loadLast3Months() {
      vm.loading = true;
      DeviceUsageTimelineService.getDataForLastMonths(3, 'day', ['ce', 'sparkboard'], apiToUse).then(function (data) {
        amChart.dataProvider = data;
        amChart.validateData();
        vm.showDevices = false;
      }, handleReject);
    }

    function rollOverGraphItem(event) {
      vm.additionalInfo = true;
      vm.dayData = event.item.dataContext;
      $scope.$apply();
    }

    function rollOutGraphItem() {
      vm.additionalInfo = false;
      $scope.$apply();
    }

    // function clickGraphItem(event) {
    //   if (lastDataPointIndex === event.index) {
    //     vm.showDevices = !vm.showDevices;
    //   } else {
    //     lastDataPointIndex = event.index;
    //     vm.devices = event.item.dataContext.devices;
    //     vm.dateForDevices = event.item.dataContext.time;
    //     vm.showDevices = true;
    //   }
    //   $scope.$apply();
    // }

    function renderBalloon(graphDataItem) {
      var text = '<div><h5>Call Duration: ' + graphDataItem.dataContext.totalDuration + '</h5>';
      text = text + 'Call Count:  ' + graphDataItem.dataContext.callCount + ' <br/> ';
      text = text + 'Paired Count: ' + graphDataItem.dataContext.pairedCount + '<br/>';
      //text = text + 'Devices: ' + graphDataItem.dataContext.devices.length + '</div>';
      return text;
    }

  }

})();
