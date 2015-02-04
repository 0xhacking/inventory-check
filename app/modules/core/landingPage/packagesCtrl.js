'use strict';

angular.module('Core')

.controller('PackagesCtrl', ['$scope',
  function ($scope) {

    $scope.packageInfo = {
      name: 'Premium UC Packages',
      termMax: 50,
      termUsed: 13,
      termRemaining: 37,
      termUnits: 'days'
    };

  }
])
