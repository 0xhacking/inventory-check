(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('InternationalDialingInfoCtrl', InternationalDialingInfoCtrl);

  /* @ngInject */
  function InternationalDialingInfoCtrl($stateParams, $translate, Notification, InternationalDialing) {
    var vm = this;

    var cbUseGlobal = {
      label: $translate.instant('internationalDialingPanel.useGlobal'),
      value: '-1'
    };
    var cbAlwaysAllow = {
      label: $translate.instant('internationalDialingPanel.alwaysAllow'),
      value: '1'
    };
    var cbNeverAllow = {
      label: $translate.instant('internationalDialingPanel.neverAllow'),
      value: '0'
    };

    vm.currentUser = $stateParams.currentUser;
    vm.save = save;
    vm.init = init;
    vm.reset = reset;
    vm.saveInProcess = false;
    vm.validInternationalDialingOptions = [];

    vm.fields = [{
      key: 'internationalDialingEnabled',
      type: 'select',
      templateOptions: {
        labelfield: "label",
        valuefield: "value",
        options: vm.validInternationalDialingOptions
      }
    }];

    vm.model = {
      internationalDialingEnabled: cbUseGlobal,
      internationalDialingUuid: null
    };

    init();

    function init() {
      vm.validInternationalDialingOptions.push(cbUseGlobal);
      vm.validInternationalDialingOptions.push(cbAlwaysAllow);
      vm.validInternationalDialingOptions.push(cbNeverAllow);
      initInternationalDialing();
    }

    function initInternationalDialing() {
      return InternationalDialing.listCosRestrictions(vm.currentUser.id).then(function (cosRestriction) {
        var overRide = null;
        var custRestriction = null;

        if (cosRestriction.user.length > 0) {
          for (var j = 0; j < cosRestriction.user.length; j++) {
            if (cosRestriction.user[j].restriction === InternationalDialing.INTERNATIONAL_DIALING) {
              overRide = true;
              break;
            }
          }
        }
        if (cosRestriction.customer.length > 0) {
          for (var k = 0; k < cosRestriction.customer.length; k++) {
            if (cosRestriction.customer[k].restriction === InternationalDialing.INTERNATIONAL_DIALING) {
              custRestriction = true;
              break;
            }
          }
        }

        if (overRide) {
          if (cosRestriction.user[0].blocked) {
            vm.model.internationalDialingEnabled = cbNeverAllow;
          } else {
            vm.model.internationalDialingEnabled = cbAlwaysAllow;
          }
          vm.model.internationalDialingUuid = cosRestriction.user[0].uuid;
        }
        if (custRestriction) {
          cbUseGlobal.label = $translate.instant('internationalDialingPanel.useGlobal') + "(" + $translate.instant('internationalDialingPanel.off') + ")";
        } else {
          cbUseGlobal.label = $translate.instant('internationalDialingPanel.useGlobal') + "(" + $translate.instant('internationalDialingPanel.on') + ")";
        }
        if (!overRide) {
          vm.model.internationalDialingEnabled = cbUseGlobal;
          vm.model.internationalDialingUuid = null;
        }
      });
    }

    function resetForm() {
      if (vm.form) {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    function reset() {
      resetForm();
    }

    function save() {
      var cosType = {
        restriction: InternationalDialing.INTERNATIONAL_DIALING,
        blocked: false
      };

      if (vm.model.internationalDialingEnabled.value === "0") {
        cosType.blocked = true;
      } else {
        cosType.blocked = false;
      }

      vm.saveInProcess = true;
      return InternationalDialing.updateCosRestriction(vm.currentUser.id, vm.model.internationalDialingEnabled,
          vm.model.internationalDialingUuid, cosType).then(function () {
            initInternationalDialing();

            Notification.success('internationalDialingPanel.success');
            resetForm();
          })
        .catch(function (response) {
          Notification.errorResponse(response, 'internationalDialingPanel.error');
        })
        .finally(function () {
          vm.saveInProcess = false;
        });
    }
  }
})();
