(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucCallVolumeRealGraph', ucCallVolumeRealGraph);

  function ucCallVolumeRealGraph() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service-report-v2/metrics-report/callVolumeRealGraph/callVolumeRealGraph.tpl.html'
    };

    return directive;
  }

})();
