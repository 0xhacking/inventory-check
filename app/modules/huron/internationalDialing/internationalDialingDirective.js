(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('ucInternationalDialing', ucInternationalDialing);

  function ucInternationalDialing() {
    var directive = {
      controller: 'InternationalDialingInfoCtrl',
      controllerAs: 'internationalDialing',
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/internationalDialing/internationalDialing.tpl.html'
    };

    return directive;
  }

})();
