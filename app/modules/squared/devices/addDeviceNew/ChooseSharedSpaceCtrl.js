(function () {
  'use strict';

  angular.module('Core')
    .controller('ChooseSharedSpaceCtrl', ChooseSharedSpaceCtrl);
  /* @ngInject */
  function ChooseSharedSpaceCtrl(Userservice, CsdmDataModelService, CsdmHuronPlaceService, Notification, $stateParams, $translate, Authinfo) {
    var vm = this;
    vm.wizardData = $stateParams.wizard.state().data;

    vm.onlyNew = function () {
      return vm.wizardData.function == 'addPlace' || (!vm.wizardData.showPlaces && vm.wizardData.deviceType == 'cloudberry');
    };

    vm.isNewCollapsed = !vm.onlyNew();
    vm.isExistingCollapsed = true;
    vm.selected = null;
    vm.radioSelect = null;
    vm.placesLoaded = false;
    vm.isLoading = false;
    vm.rooms = undefined;
    vm.hasRooms = undefined;

    function init() {
      loadList();
      fetchDisplayNameForLoggedInUser();
    }

    init();

    vm.localizedCreateInstructions = function () {
      if (!vm.wizardData.showPlaces) {
        return $translate.instant('addDeviceWizard.chooseSharedSpace.deviceInstalledInstructions');
      }
      if (vm.wizardData.deviceType === 'huron') {
        return $translate.instant('placesPage.placesDefinition');
      }
      return $translate.instant('addDeviceWizard.chooseSharedSpace.newPlaceInstructions');
    };

    function fetchDisplayNameForLoggedInUser() {
      Userservice.getUser('me', function (data) {
        if (data.success) {
          vm.adminDisplayName = data.displayName;
        }
      });
    }

    function loadList() {
      if (vm.wizardData.showPlaces) {
        if (vm.wizardData.deviceType == 'cloudberry') {
          CsdmDataModelService.getPlacesMap().then(function (placesList) {
            vm.rooms = _(placesList).filter(function (place) {
              return _.isEmpty(place.devices) && place.type == 'cloudberry';
            }).sortBy('displayName').value();
            vm.hasRooms = vm.rooms.length > 0;
            vm.placesLoaded = true;
          });
        } else {
          CsdmDataModelService.getPlacesMap().then(function (placesList) {
            vm.rooms = _(placesList).filter(function (place) {
              return place.type == 'huron';
            }).sortBy('displayName').value();
            vm.hasRooms = vm.rooms.length > 0;
            vm.placesLoaded = true;
          });
        }
      }
    }

    vm.selectPlace = function ($item) {
      vm.place = $item;
      vm.deviceName = $item.displayName;
      vm.selected = $item.displayName;
    };

    vm.existing = function () {
      vm.radioSelect = "existing";
      vm.toggle();
    };

    vm.create = function () {
      vm.radioSelect = "create";
      vm.toggle();
    };

    vm.toggle = function () {
      vm.isNewCollapsed = vm.radioSelect == "existing";
      vm.isExistingCollapsed = vm.radioSelect == "create";
    };
    var minlength = 3;
    var maxlength = 64;
    vm.message = {
      required: $translate.instant('common.invalidRequired'),
      min: $translate.instant('common.invalidMinLength', {
        'min': minlength
      }),
      max: $translate.instant('common.invalidMaxLength', {
        'max': maxlength
      })
    };
    vm.isNameValid = function () {
      if (vm.place) {
        return true;
      } // hack;
      return vm.deviceName && vm.deviceName.length >= minlength && vm.deviceName.length < maxlength;
    };
    vm.next = function () {
      vm.isLoading = true;
      var nextOption = vm.wizardData.deviceType;
      if (nextOption == 'huron') {
        if (vm.wizardData.function == 'addPlace') {
          nextOption += '_' + 'create';
        } else {
          nextOption += '_' + vm.radioSelect;
        }
      }

      function success(code) {
        vm.isLoading = false;
        $stateParams.wizard.next({
          deviceName: vm.deviceName,
          code: code,
          // expiryTime: code.expiryTime,
          cisUuid: Authinfo.getUserId(),
          email: Authinfo.getPrimaryEmail(),
          displayName: vm.adminDisplayName,
          organizationId: Authinfo.getOrgId()
        }, nextOption);
      }

      function error(err) {
        Notification.error(err);
        vm.isLoading = false;
      }

      if (vm.place) {
        if (vm.wizardData.deviceType === "cloudberry") {
          CsdmDataModelService
            .createCodeForExisting(vm.place.cisUuid)
            .then(success, error);
        } else {
          CsdmHuronPlaceService
            .createOtp(vm.place.cisUuid)
            .then(success, error);
        }
      } else {
        if (vm.wizardData.deviceType === "cloudberry") {
          CsdmDataModelService.createCsdmPlace(vm.deviceName, vm.wizardData.deviceType).then(function (place) {
            vm.place = place;
            CsdmDataModelService
              .createCodeForExisting(place.cisUuid)
              .then(success, error);
          }, error);
        } else { //New Place
          success();
        }
      }
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };
  }
})();
