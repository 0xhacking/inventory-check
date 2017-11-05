(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucUtilizationRealGraph', ucUtilizationRealGraph);

  function ucUtilizationRealGraph() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service-report-v2/metrics-report/utilizationRealGraph/utilizationRealGraph.tpl.html'
    };

    return directive;
  }

})();
