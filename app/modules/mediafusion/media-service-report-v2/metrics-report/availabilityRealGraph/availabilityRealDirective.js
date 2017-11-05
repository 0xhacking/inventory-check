(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucAvailabilityRealGraph', ucAvailabilityRealGraph);

  function ucAvailabilityRealGraph() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service-report-v2/metrics-report/availabilityRealGraph/availabilityRealGraph.tpl.html'
    };

    return directive;
  }

})();
