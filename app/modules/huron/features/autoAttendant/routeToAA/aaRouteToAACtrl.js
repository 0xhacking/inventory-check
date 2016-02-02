(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToAACtrl', AARouteToAACtrl);

  /* @ngInject */
  function AARouteToAACtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AACommonService) {

    var vm = this;

    vm.aaModel = {};
    vm.menuEntry = {};

    // cs-select associated inputs:
    vm.selectPlaceholder = $translate.instant('autoAttendant.selectAAPlaceHolder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
    vm.options = [];
    vm.aaName = '';

    vm.saveUiModel = saveUiModel;

    /////////////////////

    function aaName2CeId(aaName) {
      var ceInfos = vm.aaModel.ceInfos;
      var ceInfo = _.find(ceInfos, function (ceInfo) {
        return this === ceInfo.name;
      }, aaName);
      if (angular.isDefined(ceInfo)) {
        var index = ceInfo.ceUrl.lastIndexOf('/');
        if (index < 0) {
          return '';
        }
        return ceInfo.ceUrl.substr(index + 1);
      }
      return '';
    }

    function ceId2aaName(ceId) {
      var ceInfos = vm.aaModel.ceInfos;
      var ceInfo = _.find(ceInfos, function (ceInfo) {
        var index = ceInfo.ceUrl.lastIndexOf('/');
        if (index < 0) {
          return false;
        }
        return this === ceInfo.ceUrl.substr(index + 1);
      }, ceId);
      if (angular.isDefined(ceInfo)) {
        return ceInfo.name;
      }
      return '';
    }

    function populateUiModel() {
      vm.aaName = ceId2aaName(vm.menuEntry.actions[0].value);
    }

    function saveUiModel() {
      vm.menuEntry.actions[0].setValue(aaName2CeId(vm.aaName));
      AACommonService.setPhoneMenuStatus(true);
    }

    function activate() {

      var uiModel = AAUiModelService.getUiModel();
      var uiCombinedMenu = uiModel[$scope.schedule];
      var uiPhoneMenu = uiCombinedMenu.entries[$scope.index];

      // Read an existing routeToAA entry if exist or initialize it if not
      if ($scope.keyIndex < uiPhoneMenu.entries.length) {
        vm.menuEntry = uiPhoneMenu.entries[$scope.keyIndex];
      } else {
        vm.menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('goto', '');
        vm.menuEntry.addAction(action);
      }

      // Deduce list of Auto Attendants
      vm.aaModel = AAModelService.getAAModel();
      var ceInfos = vm.aaModel.ceInfos;
      var options = _.pluck(ceInfos, 'name');
      options = _.without(options, uiModel.ceInfo.name);
      options.sort(function (a, b) {
        return a.localeCompare(b);
      });
      vm.options = options;

      populateUiModel();
    }

    activate();

  }
})();
