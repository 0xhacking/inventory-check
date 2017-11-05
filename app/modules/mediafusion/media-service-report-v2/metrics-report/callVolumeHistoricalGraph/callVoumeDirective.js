(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucCallVolumeHistoricalGraph', ucCallVolumeHistoricalGraph);

  function ucCallVolumeHistoricalGraph() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service-report-v2/metrics-report/callVolumeHistoricalGraph/callVolume.tpl.html'
    };

    return directive;
  }

})();
