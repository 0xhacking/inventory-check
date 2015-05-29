(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('MissingServicesController',

      /* @ngInject */
      function ($scope) {
        $scope.$watch('services', function (services) {
          if (!services || !services.enabledOnly) {
            return;
          }
          $scope.servicesMissing = _.find(services.enabledOnly, function (service) {
            return service.status == 'error';
          });
          if ($scope.servicesMissing) $scope.showInfoPanel = true;
        });
      }
    )
    .directive('herculesMissingServices', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'MissingServicesController',
          templateUrl: 'modules/hercules/dashboard-info-panel/missing-services.html'
        };
      }
    ]);
})();
