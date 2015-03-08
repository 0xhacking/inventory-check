(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('ucDirectoryNumber', ucDirectoryNumber);

  function ucDirectoryNumber() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/directoryNumber/directoryNumber.tpl.html'
    };

    return directive;
  }

})();
