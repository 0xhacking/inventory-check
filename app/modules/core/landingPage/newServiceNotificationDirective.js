(function () {
  'use strict';

  angular
    .module('Core')
    .controller('NewServiceNotificationCtrl', ['$scope', function ($scope) {
      $scope.CalendarService = {
        text: 'homePage.setUpCalendarService'
      };
      $scope.CallAwareService = {
        text: 'homePage.setUpCallAwareService'
      };
      $scope.CallConnectService = {
        text: 'homePage.setUpCallConnectService'
      };

    }])

  .directive('newServiceNotification', newServiceNotification);

  function newServiceNotification() {
    var directive = {
      restrict: 'E',
      controller: 'NewServiceNotificationCtrl',
      scope: {
        newServiceInfo: '=info',
        clickSetup: '&',
        clickClose: '&'
      },
      templateUrl: 'modules/core/landingPage/newServiceNotification.tpl.html'
    };

    return directive;
  }

})();
