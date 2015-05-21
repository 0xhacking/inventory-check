(function () {
  'use strict';

  angular.module('Core')
    .service('GraphService', GraphService);

  /* @ngInject */
  function GraphService($translate, Config) {
    // Base variables for building grids and charts
    var columnBase = {
      'type': 'column',
      'fillAlphas': 1,
      'lineAlpha': 0,
      'balloonColor': Config.chartColors.grayLight
    };
    var axis = {
      'axisColor': Config.chartColors.grayLight,
      'gridAlpha': 0,
      'axisAlpha': 1,
      'tickLength': 0,
      'color': Config.chartColors.grayDarkest
    };
    var legendBase = {
      'align': 'center',
      'autoMargins': false,
      'switchable': false,
      'fontSize': 13,
      'color': Config.chartColors.grayDarkest,
      'markerLabelGap': 10,
      'markerType': 'square',
      'markerSize': 10,
      'position': 'bottom'
    };
    var numFormatBase = {
      'precision': 0,
      'decimalSeparator': '.',
      'thousandsSeparator': ','
    };

    // variables for the active users section
    var activeUserDiv = 'activeUsersdiv';
    var activeUserRefreshDiv = 'activeUsersRefreshDiv';
    var activeUsersBalloonText = '<span class="graph-text">' + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    var usersTitle = $translate.instant('activeUsers.users');
    var activeUsersTitle = $translate.instant('activeUsers.activeUsers');
    var activeUsersGraph = null;

    var mediaQualityGraph = null;
    var mediaQualityDiv = 'mediaQualityDiv';
    return {
      invalidateActiveUserGraphSize: invalidateActiveUserGraphSize,
      updateActiveUsersGraph: updateActiveUsersGraph,
      invalidateMediaQualityGraphSize: invalidateMediaQualityGraphSize,
      updateMediaQualityGraph: updateMediaQualityGraph
    };

    function createActiveUserGraph(data) {
      // if there are no active users for this user
      if (data.length === 0) {
        data = dummyData(activeUserDiv);
      }
      var graphOne = angular.copy(columnBase);
      graphOne.title = usersTitle;
      graphOne.fillColors = Config.chartColors.brandSuccessLight;
      graphOne.colorField = Config.chartColors.brandSuccessLight;
      graphOne.valueField = 'totalRegisteredUsers';
      graphOne.balloonText = activeUsersBalloonText;

      var graphTwo = angular.copy(columnBase);
      graphTwo.title = activeUsersTitle;
      graphTwo.fillColors = Config.chartColors.brandSuccessDark;
      graphTwo.colorField = Config.chartColors.brandSuccessDark;
      graphTwo.valueField = 'activeUsers';
      graphTwo.balloonText = activeUsersBalloonText;
      graphTwo.clustered = false;

      var graphs = [graphOne, graphTwo];
      var valueAxes = [angular.copy(axis)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;

      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var legend = angular.copy(legendBase);
      legend.labelText = '[[title]]';
      var numFormat = angular.copy(numFormatBase);

      activeUsersGraph = createGraph(data, activeUserDiv, 'serial', graphs, valueAxes, catAxis, legend, numFormat, true);
    }

    function invalidateActiveUserGraphSize() {
      if (activeUsersGraph !== null) {
        activeUsersGraph.invalidateSize();
      }
    }

    function updateActiveUsersGraph(data) {
      if (activeUsersGraph === null) {
        createActiveUserGraph(data);
      } else {
        if (data.length === 0) {
          activeUsersGraph.dataProvider = dummyData(activeUserDiv);
        } else {
          activeUsersGraph.dataProvider = data;
        }
        activeUsersGraph.validateData();
        invalidateActiveUserGraphSize();
      }
    }

    function createGraph(data, div, chartType, graphs, valueAxes, catAxis, legend, numFormat, autoMargins) {
      return AmCharts.makeChart(div, {
        'type': chartType,
        'theme': 'none',
        'addClassNames': true,
        'fontFamily': 'Arial',
        'backgroundColor': Config.chartColors.brandWhite,
        'backgroundAlpha': 1,
        "dataProvider": data,
        "valueAxes": valueAxes,
        "graphs": graphs,
        'balloon': {
          'adjustBorderColor': true,
          'borderThickness': 1,
          'fillAlpha': 1,
          'fillColor': Config.chartColors.brandWhite,
          'fixedPosition': true,
          'shadowAlpha': 0
        },
        'numberFormatter': numFormat,
        'plotAreaBorderAlpha': 0,
        'plotAreaBorderColor': Config.chartColors.grayLight,
        'autoMargins': autoMargins,
        'marginTop': 60,
        'categoryField': 'modifiedDate',
        'categoryAxis': catAxis,
        'legend': legend,
        'usePrefixes': true,
        'prefixesOfBigNumbers': [{
          number: 1e+3,
          prefix: "K"
        }, {
          number: 1e+6,
          prefix: "M"
        }, {
          number: 1e+9,
          prefix: "B"
        }, {
          number: 1e+12,
          prefix: "T"
        }]
      });
    }

    function dummyData(div) {
      var dataPoint = {
        "modifiedDate": ""
      };

      if (div === activeUserDiv) {
        dataPoint.totalRegisteredUsers = 0;
        dataPoint.activeUsers = 0;
        dataPoint.percentage = 0;
      }
      if (div === mediaQualityDiv) {
        dataPoint.excellent = 0;
        dataPoint.good = 0;
        dataPoint.fair = 0;
        dataPoint.poor = 0;
        dataPoint.totalCalls = 0;
      }
      return [dataPoint];
    }

    function createMediaQualityGraph(data) {
      var mediaQualityBalloonText = '<span class="graph-text-balloon graph-number-color">' + $translate.instant('mediaQuality.totalCalls') + ': ' + ' <span class="graph-number">[[totalCalls]]</span></span>';
      var titles = ['mediaQuality.poor', 'mediaQuality.fair', 'mediaQuality.good', 'mediaQuality.excellent'];
      var values = ['poor', 'fair', 'good', 'excellent'];
      var colors = [Config.chartColors.brandDanger, Config.chartColors.brandWarning, Config.chartColors.blue, Config.chartColors.brandInfo];
      var graphs = [];

      if (data.data.length === 0) {
        data = dummyData(mediaQualityDiv);
      } else {
        data = data.data[0].data;
      }
      var total = values.length;
      var balloonText;
      for (var i = 0; i < total; i++) {
        balloonText = '<br><span class="graph-text-balloon graph-number-color">' + $translate.instant(titles[i]) + ': ' + '<span class="graph-number"> [[value]]</span></span>';
        graphs[i] = angular.copy(columnBase);
        graphs[i].title = $translate.instant(titles[i]);
        graphs[i].fillColors = colors[i];
        graphs[i].colorField = colors[i];
        graphs[i].valueField = values[i];
        graphs[i].labelText = '[[value]]';
        graphs[i].fontSize = 14;
        graphs[i].legendColor = colors[i];
        graphs[i].columnWidth = 0.6;
        graphs[i].color = Config.chartColors.brandWhite;
        graphs[i].balloonText = mediaQualityBalloonText + balloonText;
        if (i) {
          graphs[i].clustered = false;
        }
      }

      var catAxis = angular.copy(axis);
      catAxis.gridPosition = 'start';

      var valueAxes = [angular.copy(axis)];
      valueAxes[0].totalColor = Config.chartColors.brandWhite;
      valueAxes[0].labelsEnabled = false;
      valueAxes[0].stackType = 'regular';
      valueAxes[0].axisAlpha = 0;

      var legend = angular.copy(legendBase);
      legend.autoMargins = false;
      legend.equalWidths = false;
      legend.horizontalGap = 5;
      legend.valueAlign = 'left';
      legend.valueWidth = 0;
      legend.verticalGap = 20;
      legend.reversedOrder = true;

      var numFormat = angular.copy(numFormatBase);
      mediaQualityGraph = createGraph(data, mediaQualityDiv, 'serial', graphs, valueAxes, catAxis, legend, numFormat, false);
    }

    function invalidateMediaQualityGraphSize() {
      if (mediaQualityGraph !== null) {
        mediaQualityGraph.invalidateSize();
      }
    }

    function updateMediaQualityGraph(data) {
      // TO-DO define Chart objects in controller
      // if (mediaQualityGraph !== null) {
      //   if (data.length === 0) {
      //     mediaQualityGraph.dataProvider = dummyData(mediaQualityDiv);
      //   } else {
      //     mediaQualityGraph.dataProvider = data;
      //   }
      // }
      createMediaQualityGraph(data);
      invalidateMediaQualityGraphSize();
    }

  }
})();
