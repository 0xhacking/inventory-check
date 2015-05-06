'use strict';

/* global $ */

angular.module('Mediafusion')
  .controller('ThresholdPreviewCtrl', ['$scope', '$state', 'ThresholdService',
    function ($scope, $state, ThresholdService) {

      $scope.systemTypes = [];
      $scope.systemNames = [];
      $scope.sysTypeSelected = "";
      $scope.systemSelected = "All";

      //console.log("in threshold Preview Ctrl");
      $scope.closePreview = function () {
        // console.log("we are here");
        $state.go('threshold');
      };

      $scope.getSystemTypesList = function () {
        ThresholdService.listSystemTypes(function (data, status) {
          $scope.systemTypes = data;
        });
      };

      $scope.getSystemsByType = function () {
        ThresholdService.listSystems($scope.sysTypeSelected.systemType, function (data, status) {
          $scope.systemNames = data;
        });
      };

      $scope.saveOverrideThreshold = function () {

        var threshold = {
          "thresholdName": $scope.thresholdName,
          "metricType": $scope.metricType,
          "counter": $scope.counter,
          "operator": $scope.operator,
          "value": $scope.valuePercentage,
          "eventName": $scope.eventName,
          "systemType": $scope.sysTypeSelected.systemType,
          "hostName": $scope.systemSelected,
          "parentId": $scope.parentId
        };

        ThresholdService.addThreshold(threshold, function (data, status) {});
      };

      $scope.overrideCancel = function () {
        $scope.systemSelected = "";
        $scope.valuePercentage = "";
        $scope.sysTypeSelected = "";
      };

    }
  ]);
