(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToHGCtrl', AARouteToHGCtrl);

  /* @ngInject */
  function AARouteToHGCtrl($scope, $translate, HuntGroupService, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService) {

    var vm = this;

    vm.hgSelected = {
      description: '',
      id: ''
    };

    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceHolder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
    vm.huntGroups = [];

    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    var rtHG = 'routeToHuntGroup';

    var fromRouteCall = false;

    /////////////////////

    function populateUiModel() {
      var queueSettings;
      if (fromRouteCall) { //from Route Call
        queueSettings = vm.menuEntry.actions[0].queueSettings;
        if (queueSettings) {
          if (_.has(queueSettings, 'fallback.actions[0]')) {
            vm.hgSelected.id = queueSettings.fallback.actions[0].getValue();
          }
        } else {
          vm.hgSelected.id = vm.menuEntry.actions[0].getValue();
        }
      } else { //from phone menu
        queueSettings = vm.menuKeyEntry.actions[0].queueSettings;
        if (queueSettings) { //from queueSettings modal
          if (_.has(queueSettings, 'fallback.actions[0]')) {
            vm.hgSelected.id = queueSettings.fallback.actions[0].getValue();
          }
        } else {
          vm.hgSelected.id = vm.menuKeyEntry.actions[0].getValue();
        }
      }
      vm.hgSelected.description = _.result(_.find(vm.huntGroups, {
        'id': vm.hgSelected.id
      }), 'description', '');
    }

    function saveUiModel() {

      AACommonService.setPhoneMenuStatus(true);
      var entry;

      if (fromRouteCall) {
        entry = vm.menuEntry;
      } else {
        entry = vm.menuKeyEntry;
      }
      var action = _.get(entry, 'actions[0].queueSettings.fallback.actions[0]', entry.actions[0]);
      action.setValue(vm.hgSelected.id);

    }

    function getHuntGroups() {

      return HuntGroupService.getListOfHuntGroups().then(function (hgPool) {
        _.each(hgPool, function (aHuntGroup) {
          vm.huntGroups.push({
            description: aHuntGroup.name.concat(' (').concat(_.head(_.map(aHuntGroup.numbers, 'number'))).concat(')'),
            id: aHuntGroup.uuid
          });
        });
      });

    }

    function activate() {

      if ($scope.fromRouteCall) {
        var ui = AAUiModelService.getUiModel();
        vm.uiMenu = ui[$scope.schedule];
        vm.menuEntry = vm.uiMenu.entries[$scope.index];
        fromRouteCall = true;

        if (!$scope.fromFallback) {
          if (vm.menuEntry.actions.length === 0) {
            action = AutoAttendantCeMenuModelService.newCeActionEntry(rtHG, '');
            vm.menuEntry.addAction(action);
          } else {
            // make sure action is HG not AA, User, extNum, etc
            if (!(vm.menuEntry.actions[0].getName() === rtHG)) {
              vm.menuEntry.actions[0].setName(rtHG);
              vm.menuEntry.actions[0].setValue('');
              delete vm.menuEntry.actions[0].queueSettings;
            } // else let saved value be used
          }
        }
      } else {
        vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        if ($scope.keyIndex < vm.menuEntry.entries.length) {
          vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtHG, '');
          vm.menuKeyEntry.addAction(action);
        }
      }

      getHuntGroups().then(function () {
        vm.huntGroups.sort(AACommonService.sortByProperty('description'));
        populateUiModel();
      });

    }

    activate();

  }
})();
