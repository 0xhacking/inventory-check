'use strict';

angular.module('Core')
  .controller('PartnerReportsCtrl', ['$scope', '$window', 'Config', 'ReportsService', '$log', 'Authinfo', 'PartnerService', '$translate', 'CannedDataService',
    function ($scope, $window, Config, ReportsService, $log, Authinfo, PartnerService, $translate, CannedDataService) {
      var activeUsersChart, avgCallsChart, contentSharedChart, entitlementsChart, avgConvChart,
        convOneOnOneChart, convGroupChart, callsLoadedChart, callsAvgDurationChart, contentSharedSizeChart;

      var chartRefreshProperties = ['entitlements', 'activeUsers', 'avgCalls', 'avgConversations',
        'convOneOnOne', 'convGroup', 'calls', 'callsAvgDuration', 'contentShared', 'contentShareSizes'
      ];

      var orgNameMap = {};
      var responseTime;

      $scope.counts = {};
      $scope.reportStatus = {};
      $scope.customers = [];
      var weekOf = $translate.instant('reports.weekOf');

      $scope.currentSelection = 'All Customers';

      $scope.getManagedOrgs = function () {
        $scope.totalOrgsData = [];
        PartnerService.getManagedOrgsList(function (data, status) {
          if (data.success) {
            if (data.organizations.length > 0) {
              for (var index in data.organizations) {
                var org = data.organizations[index];
                var orgObj = {
                  customerOrgId: org.customerOrgId,
                  customerName: org.customerName,
                };
                $scope.totalOrgsData.push(orgObj);
              }
              $scope.totalOrgsData.sort(function (a, b) {
                var org1 = a.customerName;
                var org2 = b.customerName;
                return org1.localeCompare(org2);
              });
            }
          }

        });
      };

      var isAggregateView = function () {
        return $scope.currentSelection === 'All Customers';
      };

      $scope.getManagedOrgs();

      var currentDate = moment();
      var dummyChartVals = [];
      for (var i = 0; i < 5; i++) {
        currentDate = currentDate.add(7, 'days');
        var isoDate = currentDate.toISOString();
        var dummyObj = {
          data: [{
            'date': isoDate,
            'count': ''
          }],
          orgName: ''
        };

        dummyChartVals.push(dummyObj);
      }

      var currentDateSingle = moment();
      var singleDummyChartVals = [];
      for (var j = 0; j < 5; j++) {
        currentDateSingle = currentDateSingle.subtract(7, 'days');
        var isoDateSingle = currentDateSingle.toISOString();
        var dummyObjSingle = {
          'date': isoDateSingle,
          'count': ''
        };

        singleDummyChartVals.push(dummyObjSingle);
      }

      $scope.isRefresh = function (property) {
        return $scope.reportStatus[property] === 'refresh';
      };

      $scope.isEmpty = function (property) {
        return $scope.reportStatus[property] === 'empty';
      };

      $scope.hasError = function (property) {
        return $scope.reportStatus[property] === 'error';
      };

      $scope.getCustomerReports = function (useCache, org) {
        $scope.currentSelection = org.customerName;
        for (var property in chartRefreshProperties) {
          $scope.reportStatus[chartRefreshProperties[property]] = 'refresh';
        }
        if (!CannedDataService.isDemoAccount(Authinfo.getOrgId())) {
          ReportsService.getPartnerMetrics(useCache, org.customerOrgId);
        } else {
          CannedDataService.getIndCustomerData(org.customerOrgId);
        }
      };

      $scope.reloadReports = function (useCache) {
        $scope.currentSelection = 'All Customers';

        for (var property in chartRefreshProperties) {
          $scope.reportStatus[chartRefreshProperties[property]] = 'refresh';
        }

        if (!CannedDataService.isDemoAccount(Authinfo.getOrgId())) {
          ReportsService.getPartnerMetrics(useCache);
        } else {
          CannedDataService.getAllCustomersData();
        }
      };

      $scope.reloadReports(true);

      var makeChart = function (id, colors, data, title, operation, yAxisTitle, shouldShowCursor) {

        if (angular.element('#' + id).length > 0) {

          if ($scope.currentSelection === 'All Customers') {
            var orgCount = Object.keys(orgNameMap).length;
            var aggregatedData = [];
            for (var i = 0; i < data.length; i++) {
              var obj = data[i];
              var date = obj.date;
              var sum = 0;
              Object.keys(obj).forEach(function (k) {
                if (k.indexOf('count') > -1) {
                  sum += obj[k];
                }
              });
              var dataSection = {};
              dataSection.date = date;
              dataSection.count = sum;
              aggregatedData.push(dataSection);
            }
            data = aggregatedData;
          }

          var chartObject = {
            'type': 'serial',
            'theme': 'none',
            'fontFamily': 'CiscoSansTT Extra Light',
            'colors': [colors],
            'backgroundColor': '#ffffff',
            'backgroundAlpha': 1,
            'legend': {
              'equalWidths': false,
              'autoMargins': false,
              'periodValueText': '[[value.' + [operation] + ']]',
              'position': 'top',
              'valueWidth': 10,
              'fontSize': 22,
              'markerType': 'none',
              'spacing': 0,
              'valueAlign': 'right',
              'useMarkerColorForLabels': false,
              'useMarkerColorForValues': true,
              'marginLeft': -20,
              'marginRight': 0,
              'color': '#444'
            },
            'dataProvider': data,
            'valueAxes': [{
              'axisColor': '#DDD',
              'fontFamily': 'Arial',
              'gridAlpha': 0,
              'axisAlpha': 1,
              'color': '#666',
              'title': yAxisTitle,
              'titleColor': '#666'
            }],
            'graphs': [],
            'chartCursor': {
              'enabled': shouldShowCursor,
              'valueLineEnabled': true,
              'valueLineBalloonEnabled': true,
              'cursorColor': '#666',
              'valueBalloonsEnabled': false,
              'cursorPosition': 'mouse'
            },
            'numberFormatter': {
              'precision': 0,
              'decimalSeparator': '.',
              'thousandsSeparator': ','
            },
            'plotAreaBorderAlpha': 0,
            'plotAreaBorderColor': '#DDD',
            'marginTop': 20,
            'marginRight': 20,
            'marginLeft': 10,
            'marginBottom': 10,
            'categoryField': 'date',
            'categoryAxis': {
              'gridPosition': 'start',
              'axisColor': '#DDD',
              'fontFamily': 'Arial',
              'gridAlpha': 1,
              'gridColor': '#DDD',
              'color': '#666',
              'title': weekOf,
              'titleColor': '#666'
            }
          };

          if (angular.element('#tab-reports').length > 0) {
            delete chartObject.legend;
          }

          chartObject.graphs.push({
            'type': 'line',
            'bullet': 'round',
            'lineColor': colors,
            'fillAlphas': 0,
            'lineAlpha': 1,
            'lineThickness': 3,
            'hidden': false,
            'valueField': 'count',
            'title': title,
            'balloonText': '[[value]]',
          });

          return AmCharts.makeChart(id, chartObject);
        }
      };

      var formatMultipleOrgData = function (data) {
        var formmatedData = [];
        var dateMap = {};

        var dataId = 0;
        for (var i = 0; i < data.length; i++) {
          var obj = data[i];
          var currentOrgName = obj.orgName;
          var countData = obj.data;
          var customerNameKey = 'customerName' + dataId;
          var countKey = 'count' + dataId;
          dataId++;

          if (!orgNameMap[customerNameKey]) {
            orgNameMap[customerNameKey] = currentOrgName;
          }

          for (var j = 0; j < countData.length; j++) {
            var date = new Date(countData[j].date);
            date = moment.utc(date).local().format('MMM D');
            if (dateMap[date]) {
              dateMap[date][customerNameKey] = currentOrgName;
              dateMap[date][countKey] = countData[j].count;
            } else {
              dateMap[date] = [];
              dateMap[date][customerNameKey] = currentOrgName;
              dateMap[date][countKey] = countData[j].count;
            }
          }
        }

        for (var date2 in dateMap) {
          var chartSection = {
            'date': date2
          };
          var currentDateObj = dateMap[date2];
          for (var obj2 in currentDateObj) {
            chartSection[obj2] = currentDateObj[obj2];
            chartSection[obj2] = currentDateObj[obj2];
          }
          formmatedData.push(chartSection);
        }
        formmatedData.reverse();
        return formmatedData;
      };

      var formatTimeChartData = function (data) {
        for (var obj in data) {
          var date = new Date(data[obj].date);
          data[obj].date = moment.utc(date).local().format('MMM D');
        }
        return data;
      };

      var updateChart = function (data, color, id, title, operation, yAxisTitle, shouldShowCursor) {
        var formattedData = null;
        if ($scope.currentSelection === 'All Customers') {
          formattedData = formatMultipleOrgData(data);
        } else {
          formattedData = formatTimeChartData(data);
        }

        var chart = makeChart(id, color, formattedData, title, operation, yAxisTitle, shouldShowCursor);

        if (chart) {
          chart.validateData();
        }

        return chart;
      };

      var isEmpty = function (data, title) {

        if ($scope.currentSelection !== 'All Customers') {
          if (data && data.length > 0) {
            return false;
          } else {
            return true;
          }
        } else {
          for (var obj in data) {
            if (data[obj].data.length > 0) {
              return false;
            }
          }
          return true;
        }
      };

      var getCharts = function (response, property, id, title, color, operation, yAxisTitle, refreshDivName) {
        var shouldShowCursor = true;
        if (response.data.success) {
          var data;
          if (!isEmpty(response.data.data, title)) {
            angular.element('#' + refreshDivName).html('<i class=\'icon icon-spinner icon-2x\'/>');
            $scope.reportStatus[property] = 'ready';
            data = response.data.data;
          } else {
            $scope.reportStatus[property] = 'refresh';
            angular.element('#' + id).addClass('dummy-data');
            angular.element('#' + refreshDivName).html('<h3 class="dummy-data-message">No Data</h3>');
            if ($scope.currentSelection === 'All Customers') {
              data = dummyChartVals;
            } else {
              data = singleDummyChartVals;
            }
            shouldShowCursor = false;
            operation = 'sum';
          }

          responseTime = response.data.date;
          $scope.refreshTime = responseTime;
          var chartObj = updateChart(data, color, id, title, operation, yAxisTitle, shouldShowCursor);
          return chartObj;
        } else {
          $scope.reportStatus[property] = 'error';
          return;
        }
      };

      var loadActiveUserCount = function (event, response) {
        if (response.data.success) {
          $scope.counts.activeUsers = Math.round(response.data.data);
        }
      };

      var loadAverageCallCount = function (event, response) {
        if (response.data.success) {
          $scope.counts.averageCalls = Math.round(response.data.data);
        }
      };

      var loadContentSharedCount = function (event, response) {
        if (response.data.success) {
          $scope.counts.contentShared = Math.round(response.data.data);
        }
      };

      var loadEntitlementCount = function (event, response) {
        if (response.data.success) {
          $scope.counts.entitlements = Math.round(response.data.data);
        }
      };

      var label = '';
      $scope.$on('entitlementsLoaded', function (event, response) {
        label = $translate.instant('reports.UsersOnboarded');
        var axis = $translate.instant('reports.numberUsersAxis');
        entitlementsChart = getCharts(response, 'entitlements', 'avgEntitlementsdiv', label, Config.chartColors.blue, 'sum', axis, 'avg-entitlements-refresh');
      });

      $scope.$on('avgCallsPerUserLoaded', function (event, response) {
        label = $translate.instant('reports.AvgCallsPerUser');
        var axis = $translate.instant('reports.numberCallsAxis');
        avgCallsChart = getCharts(response, 'avgCalls', 'avgCallsdiv', label, Config.chartColors.blue, 'average', axis, 'avg-calls-refresh');
      });

      $scope.$on('avgConversationsLoaded', function (event, response) {
        label = $translate.instant('reports.AvgRoomsPerUser');
        var axis = $translate.instant('reports.numberOfRoomsAxis');
        avgConvChart = getCharts(response, 'avgConversations', 'avgConversationsdiv', label, Config.chartColors.blue, 'average', axis, 'avg-conversations-refresh');
      });

      $scope.$on('activeUsersLoaded', function (event, response) {
        label = $translate.instant('reports.ActiveUsers');
        var axis = $translate.instant('reports.numberActiveAxis');
        activeUsersChart = getCharts(response, 'activeUsers', 'activeUsersdiv', label, Config.chartColors.blue, 'average', axis, 'active-users-refresh');
      });

      $scope.$on('convOneOnOneLoaded', function (event, response) {
        label = $translate.instant('reports.OneOnOneRooms');
        var axis = $translate.instant('reports.oneRoomAxis');
        convOneOnOneChart = getCharts(response, 'convOneOnOne', 'convOneOnOnediv', label, Config.chartColors.blue, 'sum', axis, 'conv-one-on-one-refresh');
      });

      $scope.$on('convGroupLoaded', function (event, response) {
        label = $translate.instant('reports.GroupRooms');
        var axis = $translate.instant('reports.groupRoomsAxis');
        convGroupChart = getCharts(response, 'convGroup', 'convGroupdiv', label, Config.chartColors.blue, 'sum', axis, 'conv-group-refresh');
      });

      $scope.$on('callsLoaded', function (event, response) {
        label = $translate.instant('reports.VideoCalls');
        var axis = $translate.instant('reports.videoCallsAxis');
        callsLoadedChart = getCharts(response, 'calls', 'callsdiv', label, Config.chartColors.blue, 'sum', axis, 'calls-refresh');
      });

      $scope.$on('callsAvgDurationLoaded', function (event, response) {
        label = $translate.instant('reports.AvgDurationofCalls');
        var axis = $translate.instant('reports.avgCallsAxis');
        callsAvgDurationChart = getCharts(response, 'callsAvgDuration', 'callsAvgDurationdiv', label, Config.chartColors.blue, 'average', axis, 'calls-avg-duration-refresh');
      });

      $scope.$on('contentSharedLoaded', function (event, response) {
        label = $translate.instant('reports.ContentShared');
        var axis = $translate.instant('reports.filesSharedAxis');
        contentSharedChart = getCharts(response, 'contentShared', 'contentShareddiv', label, Config.chartColors.blue, 'sum', axis, 'content-shared-refresh');
      });

      $scope.$on('contentShareSizesLoaded', function (event, response) {
        label = $translate.instant('reports.AmountofContentShared');
        var axis = $translate.instant('reports.gbSharedAxis');
        contentSharedSizeChart = getCharts(response, 'contentShareSizes', 'contentShareSizesdiv', label, Config.chartColors.blue, 'sum', axis, 'content-share-sizes-refresh');
      });

      $scope.$on('activeUserCountLoaded', loadActiveUserCount);
      $scope.$on('averageCallCountLoaded', loadAverageCallCount);
      $scope.$on('contentSharedCountLoaded', loadContentSharedCount);
      $scope.$on('entitlementCountLoaded', loadEntitlementCount);

      $scope.resizeActiveUsersChart = function () {
        if (activeUsersChart) {
          activeUsersChart.invalidateSize();
        }
      };

      $scope.resizeAverageCallsChart = function () {
        if (avgCallsChart) {
          avgCallsChart.invalidateSize();
        }
      };

      $scope.resizeContentSharedChart = function () {
        if (contentSharedChart) {
          contentSharedChart.invalidateSize();
        }
      };
    }
  ]);
