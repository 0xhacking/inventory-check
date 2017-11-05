(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucUtilizationHistoricalGraph', ucUtilizationHistoricalGraph);

  function ucUtilizationHistoricalGraph() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service-report-v2/metrics-report/utilizationHistoricalGraph/utilization.tpl.html'
    };

    return directive;
  }

})();
