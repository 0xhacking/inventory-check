'use strict';

//Defining a controller for Utilization with required dependencies.
angular.module('Mediafusion')
  .controller('ThresholdCtrl', ['$scope', '$rootScope', '$state', 'Log', 'ThresholdService',
    function ($scope, $rootScope, $state, Log, ThresholdService) {

      //Gridoptions describes about table structure and behaviour.
      $scope.test = ThresholdService.name;
      $scope.systemTypes = [];
      $scope.systemNames = [];
      $scope.querythresholdmetric = [];
      $scope.metric = null;
      $scope.metricTypes = [];
      $scope.metricCounters = [];
      $scope.metricInsCounters = [];
      $scope.events = [];
      $scope.sysTypeSelected = "";
      /*{
              "orgId": "Cisco",
              "systemType": "All"
            };*/

      $scope.systemSelected = "All";
      $scope.metricTypeSelected = "";
      $scope.metricCounterSelected = "";
      $scope.metricInsCounterSelected = "";
      $scope.operatorSelected = "";
      $scope.thresholdName = "";
      $scope.valuePercentage = "";
      $scope.severitySelected = "";
      $scope.eventSelected = "";
      $scope.tempThreshold = "";

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showThresholdDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      $scope.gridOptions = {
        data: 'queryThresholdList',
        multiSelect: false,
        showFilter: true,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 40,
        useExternalSorting: false,

        columnDefs: [{
          field: 'metricType',
          displayName: 'Metric Type'
        }, {
          field: 'thresholdName',
          displayName: 'Threshold Name'
        }, {
          field: 'rule',
          displayName: 'Threshold Rule'
        }, {
          field: 'eventName',
          displayName: 'Event Name'
        }, {
          field: 'counter',
          displayName: 'Metric'
        }, {
          field: 'action',
          displayName: 'Action'
        }]
      };

      $scope.operators = [{
        "name": "Greaterthan",
        "value": ">"
      }, {
        "name": "Lessthan",
        "value": "<"
      }];

      $scope.severity = [{
        "name": "CRITICAL"

      }, {
        "name": "MAJOR"

      }, {
        "name": "MINOR"

      }, {
        "name": "WARNING"

      }, {
        "name": "INFO"

      }, {
        "name": "NORMAL"

      }, {
        "name": "UNKNOWN"

      }];

      /**
       * getThresholdList function will fetch and populate Threshold list table with the Threshold info from its
       * repective thresholdMetricService.
       * queryThresholdList should be populated.
       */
      var getThresholdList = function (startAt) {

        var pageNo = startAt || 1;
        ThresholdService.queryThresholdList(pageNo, function (data, status) {

          if (data.success) {
            if (pageNo === 1) {
              $scope.queryThresholdList = data;
            } else {
              $scope.queryThresholdList = $scope.queryThresholdList.concat(data);
              $scope.querythresholdcounters = data;
            }

            for (var index = 0; index < $scope.queryThresholdList.length; index++) {
              $scope.queryThresholdList[index].rule = $scope.queryThresholdList[index].counter + " " + $scope.queryThresholdList[index].operator + " " + $scope.queryThresholdList[index].value;
            }

          } else {
            Log.debug('Query existing users failed. Status: ' + status);
          }

        });
      };

      var getEventsList = function () {

        ThresholdService.listEvents(function (data, status) {
          $scope.events = data;
        });
      };

      /*$scope.getSystemTypesList = function () {
        ThresholdService.listSystemTypes(function (data, status) {
          $scope.systemTypes = data;
        });
      };

      $scope.getSystemsByType = function () {
        console.log("scope.sysTypeSelected is : "+ $scope.sysTypeSelected.systemType);
        ThresholdService.listSystems($scope.sysTypeSelected, function (data, status) {
          $scope.systemNames = data;
        });
      };*/

      $scope.showThresholdDetails = function (threshold) {
        $scope.querythresholdmetric = threshold;

        $scope.overriderule = threshold.counter.concat(threshold.operator);
        $scope.thresholdRule = threshold.counter.concat(threshold.operator, threshold.value);
        $scope.thresholdName = threshold.thresholdName;
        $scope.eventName = threshold.eventName;
        $scope.metricType = threshold.metricType;
        $scope.counter = threshold.counter;
        $scope.operator = threshold.operator;
        $scope.orgId = threshold.orgId;
        $scope.parentId = threshold.id;
        $scope.id = threshold.id;
        $scope.systemType = threshold.systemType;
        $scope.hostName = threshold.hostName;
        $scope.value = threshold.value;

        $state.go('threshold.preview');

      };

      $scope.getMetricTypes = function () {
        ThresholdService.listMetricTypes(function (data, status) {
          $scope.metricTypes = data;
        });
        getEventsList();
      };

      $scope.getMetricCountersByMetricType = function () {
        ThresholdService.listMetricCounters($scope.metricTypeSelected.metricType, function (data, status) {
          $scope.metricCounters = data;
        });
      };

      $scope.getMetricInsCountersByMetricType = function () {
        ThresholdService.listMetricInsCounters($scope.metricTypeSelected.metricType, $scope.metricCounterSelected.counterName, function (data, status) {
          $scope.metricInsCounters = data;
        });
      };

      $scope.saveThreshold = function () {
        var operator = "";
        for (var index = 0; index < $scope.operators.length; index++) {
          if ($scope.operators[index].name == $scope.operatorSelected.name) {
            operator = $scope.operators[index].value;
            break;
          }
        }
        var threshold = {
          "thresholdName": $scope.thresholdName,
          "metricType": $scope.metricTypeSelected.metricType,
          "counter": $scope.metricCounterSelected.counterName + "." + $scope.metricInsCounterSelected.counterName,
          //"counterName": $scope.metricInsCounterSelected.counterName,
          "operator": operator,
          "value": $scope.valuePercentage,
          "eventName": $scope.eventSelected.name,
          "systemType": "Any",
          "hostName": "Any"
        };

        ThresholdService.addThreshold(threshold, function (data, status) {
          getThresholdList();
        });
      };

      $scope.cancel = function () {
        $scope.thresholdName = "";
        $scope.metricTypeSelected = "";
        $scope.metricCounterSelected = "";
        $scope.metricInsCounterSelected = "";
        $scope.operatorSelected = "";
        $scope.valuePercentage = "";
        $scope.eventSelected = "";
      };

      $scope.saveEvents = function () {
        var severity = "";
        for (var index = 0; index < $scope.severity.length; index++) {
          if ($scope.severity[index].name == $scope.severity.name) {
            severity = $scope.severity[index].name;
            break;
          }
        }
        var events = {
          "name": $scope.eventName,
          "defaultSeverity": "CRITICAL",
          "assignedSeverity": severity,
          "enabled": "true"
        };

        ThresholdService.addEvents(events, function (data, status) {});
      };

      $scope.eventsCancel = function () {
        $scope.eventName = "";
        $scope.severitySelected = "";
      };

      $rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('threshold.preview')) {
          $scope.thresholdPreviewActive = true;
        } else {
          $scope.thresholdPreviewActive = false;
        }
      });

      getThresholdList();
    }

  ]);
