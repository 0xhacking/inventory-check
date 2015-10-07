(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderMainCtrl', AABuilderMainCtrl); /* was AutoAttendantMainCtrl */

  /* @ngInject */
  function AABuilderMainCtrl($scope, $translate, $stateParams, AAUiModelService, AAModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AutoAttendantCeService, Notification) {
    var vm = this;
    vm.aaModel = {};
    vm.ui = {};
    vm.errorMessages = [];

    vm.saveAARecords = saveAARecords;
    vm.canSaveAA = canSaveAA;
    vm.getSaveErrorMessages = getSaveErrorMessages;
    vm.selectAA = selectAA;
    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    $scope.saveAARecords = saveAARecords;

    /////////////////////

    function updateCeInfos(ceInfos, ceInfo) {
      for (var i = 0; i < ceInfos.length; i++) {
        if (ceInfos[i].getName() === ceInfo.getName()) {
          break;
        }
      }

      if (i === ceInfos.length) {
        ceInfos.push(ceInfo);
      }

      return i;
    }

    function removeNumberAttribute(resources) {
      for (var i = 0; i < resources.length; i++) {
        delete resources[i].number;
      }

    }

    function populateUiModel() {
      vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

      vm.ui.openHours = vm.ui.openHours || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'openHours');
      vm.ui.closedHours = vm.ui.closedHours || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'closedHours');
      vm.ui.holidays = vm.ui.holidays || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'holidays');
      vm.ui.isOpenHours = true;
      if (!angular.isDefined(vm.ui.openHours)) {
        vm.ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.openHours.setType('MENU_WELCOME');
      }
      vm.ui.isClosedHours = false;
      vm.ui.isHolidays = false;
      if (angular.isDefined(vm.ui.closedHours) && vm.ui.closedHours.entries.length > 0) {
        vm.ui.isClosedHours = true;
      } else {
        vm.ui.closedHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.closedHours.setType('MENU_WELCOME');
      }
      if (angular.isDefined(vm.ui.holidays) && vm.ui.holidays.entries.length > 0) {
        vm.ui.isHolidays = true;
      } else {
        vm.ui.holidays = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.holidays.setType('MENU_WELCOME');
      }
    }

    function saveUiModel() {
      if (angular.isDefined(vm.ui.ceInfo) && angular.isDefined(vm.ui.ceInfo.getName()) && vm.ui.ceInfo.getName().length > 0) {
        AutoAttendantCeInfoModelService.setCeInfo(vm.aaModel.aaRecord, vm.ui.ceInfo);
      }
      if (vm.ui.isOpenHours && angular.isDefined(vm.ui.openHours)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'openHours', vm.ui.openHours);
      }
      if (vm.ui.isClosedHours && angular.isDefined(vm.ui.closedHours)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'closedHours', vm.ui.closedHours);
      } else {
        vm.ui.closedHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.closedHours.setType('MENU_WELCOME');
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'closedHours', vm.ui.closedHours);
      }
      if (vm.ui.isHolidays && angular.isDefined(vm.ui.holidays)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'holidays', vm.ui.holidays);
      } else {
        vm.ui.holidays = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.holidays.setType('MENU_WELCOME');
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'holidays', vm.ui.holidays);
      }
    }

    function saveAARecords() {

      vm.saveUiModel();

      var aaRecords = vm.aaModel.aaRecords;
      var aaRecord = vm.aaModel.aaRecord;

      for (var i = 0; i < aaRecords.length; i++) {
        if (aaRecords[i].callExperienceName === aaRecord.callExperienceName) {
          break;
        }
      }

      // Workaround: remove resource.number attribute before sending the ceDefinition to CES
      //
      var _aaRecord = angular.copy(aaRecord);
      removeNumberAttribute(_aaRecord.assignedResources);
      //

      if (i === aaRecords.length) {
        var ceUrlPromise = AutoAttendantCeService.createCe(_aaRecord);
        ceUrlPromise.then(
          function (response) {
            // create successfully
            var newAaRecord = {};
            newAaRecord.callExperienceName = aaRecord.callExperienceName;
            newAaRecord.assignedResources = angular.copy(aaRecord.assignedResources);
            newAaRecord.callExperienceURL = response.callExperienceURL;
            aaRecords.push(newAaRecord);
            vm.aaModel.ceInfos.push(AutoAttendantCeInfoModelService.getCeInfo(newAaRecord));
            Notification.success('autoAttendant.successCreateCe', {
              name: aaRecord.callExperienceName
            });

          },
          function (response) {
            Notification.error('autoAttendant.errorCreateCe', {
              name: aaRecord.callExperienceName,
              statusText: response.statusText,
              status: response.status
            });
          }
        );
      } else {
        var updateResponsePromise = AutoAttendantCeService.updateCe(
          aaRecords[i].callExperienceURL,
          _aaRecord);

        updateResponsePromise.then(
          function (response) {
            // update successfully
            aaRecords[i].callExperienceName = aaRecord.callExperienceName;
            aaRecords[i].assignedResources = angular.copy(aaRecord.assignedResources);
            vm.aaModel.ceInfos[i] = AutoAttendantCeInfoModelService.getCeInfo(aaRecords[i]);
            Notification.success('autoAttendant.successUpdateCe', {
              name: aaRecord.callExperienceName
            });

          },
          function (response) {
            Notification.error('autoAttendant.errorUpdateCe', {
              name: aaRecord.callExperienceName,
              statusText: response.statusText,
              status: response.status
            });
          }
        );
      }
    }

    function canSaveAA() {
      var canSave = true;
      return canSave;
    }

    function getSaveErrorMessages() {

      var messages = vm.errorMessages.join('<br>');

      return messages;
    }

    function selectAA(aaName) {
      vm.aaModel.aaName = aaName;
      if (angular.isUndefined(vm.aaModel.aaRecord)) {
        if (aaName === '') {
          vm.aaModel.aaRecord = AAModelService.newAARecord();
        } else {
          for (var i = 0; i < vm.aaModel.aaRecords.length; i++) {
            if (vm.aaModel.aaRecords[i].callExperienceName === aaName) {
              // vm.aaModel.aaRecord = angular.copy(vm.aaModel.aaRecords[i]);
              AutoAttendantCeService.readCe(vm.aaModel.aaRecords[i].callExperienceURL).then(
                function (data) {
                  vm.aaModel.aaRecord = data;

                  // Workaround for reading the dn number: by copying it from aaRecords[i], until
                  // dn number is officialy stored in ceDefintion.
                  vm.aaModel.aaRecord.assignedResources = angular.copy(vm.aaModel.aaRecords[i].assignedResources);
                  //
                  vm.populateUiModel();
                },
                function (response) {
                  Notification.error('autoAttendant.errorReadCe', {
                    name: aaName,
                    statusText: response.statusText,
                    status: response.status
                  });
                }
              );
              return;
            }
          }
        }
      }
      vm.populateUiModel();
    }

    function activate() {

      var aaName = $stateParams.aaName;
      vm.aaModel = AAModelService.getAAModel();
      vm.aaModel.aaRecord = undefined;
      AAUiModelService.initUiModel();
      vm.ui = AAUiModelService.getUiModel();
      vm.ui.ceInfo = {};
      vm.ui.ceInfo.name = aaName;

      vm.aaModel.dataReadyPromise.then(function (data) {
        selectAA(aaName);
      }, function (data) {
        selectAA(aaName);
      });
    }

    activate();

  }
})();
