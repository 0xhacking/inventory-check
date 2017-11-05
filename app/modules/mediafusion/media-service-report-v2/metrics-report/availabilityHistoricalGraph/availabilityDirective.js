(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucAvailabilityHistoricalGraph', ucAvailabilityHistoricalGraph);

  function ucAvailabilityHistoricalGraph() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service-report-v2/metrics-report/availabilityHistoricalGraph/availability.tpl.html'
    };

    return directive;
  }

})();
