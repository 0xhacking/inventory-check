(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageTimelineService', DeviceUsageTimelineService);

  /* @ngInject */
  function DeviceUsageTimelineService($http, $log, chartColors, DeviceUsageMockService) {

    var urlBase = 'http://localhost:8080/atlas-server/admin/api/v1/organization/';

    function getData(period, count, granularity) {
      return loadCallData(period, count, granularity, true);
    }

    function loadCallData(period, count, granularity, mock) {
      var start = moment().startOf(period).subtract(count, period + 's').format('YYYY-MM-DD');
      var end = moment().startOf(period).format('YYYY-MM-DD');
      $log.info(start + ' - ' + end);
      if (mock) {
        return DeviceUsageMockService.getData(start, end).then(function (data) {
          return reduceAllData(data);
        });
      } else {
        var url = urlBase + '/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/device/call?';
        url = url + 'intervalType=' + granularity;
        url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
        return $http.get(url).then(function (response) {
          $log.info('response', response);
          return reduceAllData(response.data.items);
        });
      }
    }


    function reduceAllData(items) {
      $log.info('items', items);
      return _.chain(items).reduce(function (result, item) {
        if (typeof result[item.date] === 'undefined') {
          result[item.date] = {
            videCount: 0,
            video: 0,
            wbCount: 0,
            pairedCount: 0,
            sharedCount: 0,
            devices: []
          };
        }
        result[item.date].videCount += item.count;
        result[item.date].video += item.totalDuration;
        result[item.date].wbCount += item.wbCount;
        result[item.date].pairedCount += item.pairedCount;
        result[item.date].sharedCount += item.sharedCount;
        result[item.date].devices.push(item.deviceId);
        return result;
      }, {}).map(function (value, key) {
        value.time = key.substr(0, 4) + '-' + key.substr(4, 2) + '-' + key.substr(6, 2);
        return value;
      }).value();
    }


    function getLineChart() {
      return {
        'type': 'serial',
        'categoryField': 'time',
        'dataDateFormat': 'YYYY-MM-DD',
        'categoryAxis': {
          'minPeriod': 'DD',
          'parseDates': true,
          'autoGridCount': true
        },
        'listeners': [],
        'export': {
          'enabled': true
        },
        'chartCursor': {
          'enabled': true,
          'categoryBalloonDateFormat': 'YYYY-MM-DD'
        },
        'chartScrollbar': {
          'scrollbarHeight': 2,
          'offset': -1,
          'backgroundAlpha': 0.1,
          'backgroundColor': '#888888',
          'selectedBackgroundColor': '#67b7dc',
          'selectedBackgroundAlpha': 1
        },
        'trendLines': [

        ],
        'graphs': [
          {
            'bullet': 'round',
            'id': 'video',
            'title': 'Video',
            'valueField': 'video',
            'lineThickness': 2,
            'bulletSize': 10,
            'lineColor': chartColors.primaryColorDarker
          },
          {
            'bullet': 'diamond',
            'id': 'whiteboarding',
            'title': 'Whiteboarding',
            'valueField': 'whiteboarding',
            'lineThickness': 2,
            'bulletSize': 6,
            'lineColor': chartColors.primaryColorLight
          }
        ],
        'guides': [

        ],
        'valueAxes': [
          {
            'id': 'ValueAxis-1',
            'title': 'Activity Seconds'
          }
        ],
        'allLabels': [

        ],
        'balloon': {

        },
        'legend': {
          'enabled': true,
          'useGraphSettings': true
        },
        'titles': [
          {
            'id': 'Title-1',
            'size': 15,
            'text': 'Usage Timeline (mock data)'
          }
        ]
      };
    }

    return {
      getData: getData,
      getLineChart: getLineChart
    };
  }
}());
