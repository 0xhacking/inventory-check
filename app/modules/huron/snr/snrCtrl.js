(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('SingleNumberReachInfoCtrl', SingleNumberReachInfoCtrl);

  function SingleNumberReachInfoCtrl($scope, $stateParams, $timeout, RemoteDestinationService, TelephonyInfoService, TelephoneNumberService, Notification, $translate, DialPlanService, Authinfo) {
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.saveSingleNumberReach = saveSingleNumberReach;
    vm.reset = reset;
    vm.setSnr = setSnr;
    vm.snrInfo = angular.copy(TelephonyInfoService.getTelephonyInfo().snrInfo);
    vm.regionCode = '';

    vm.callDestInputs = ['external', 'uri', 'custom'];
    vm.getRegionCode = getRegionCode;

    function getRegionCode() {
      return DialPlanService.getCustomerVoice(Authinfo.getOrgId());
    }

    function setSnr(info) {
      vm.snrInfo.remoteDest = info;
    }

    vm.snrWaitSecondsOptions = [{
      name: '20',
      value: '20000'
    }, {
      name: '30',
      value: '30000'
    }, {
      name: '45',
      value: '45000'
    }, {
      name: '60',
      value: '60000'
    }];

    vm.snrOptions = [{
      label: 'All Lines',
      line: 'all'
    }, {
      label: 'Only certain lines',
      line: 'specific'
    }];
    vm.snrLineOption = vm.snrOptions[0];

    init();

    $scope.$on('telephonyInfoUpdated', function () {
      init();
    });

    function init() {
      var snrInfo = TelephonyInfoService.getTelephonyInfo().snrInfo;
      vm.snrInfo.singleNumberReachEnabled = snrInfo.singleNumberReachEnabled;

      if (snrInfo.remoteDest) {
        vm.snrInfo.remoteDest = snrInfo.remoteDest;
      } else if (snrInfo.destination) {
        vm.snrInfo.remoteDest = TelephoneNumberService.getDestinationObject(snrInfo.destination);
      } else {
        resetForm();
      }

      vm.snrInfo.remoteDestinations = snrInfo.remoteDestinations;

      function isSelected(option) {
        return option.value === snrInfo.answerTooLateTimer;
      }

      if (vm.snrInfo.singleNumberReachEnabled) {
        vm.snrWaitSeconds = vm.snrWaitSecondsOptions.filter(isSelected)[0];
      } else {
        vm.snrWaitSeconds = {
          name: '20',
          value: '20000'
        };
      }
    }

    function resetForm() {
      if (vm.form) {
        $timeout(function () {
          vm.form.$setPristine();
          vm.form.$setUntouched();
        }, 100);
      }
    }

    function reset() {
      resetForm();
      init();
    }

    /*
     * Temporary function until the country select can be changed to send the unformatted number
     */
    function removePhoneNumberFormatting(number) {
      if (!number && !_.isString(number)) {
        return number;
      }
      return _.replace(number, /[-\s]/g, "");
    }

    function createRemoteDestinationInfo(user, destination, answerTooLateTimer) {
      var rdBean = {
        'destination': removePhoneNumberFormatting(destination.phoneNumber),
        'name': 'RD-' + getRandomString(),
        'autoAssignRemoteDestinationProfile': true,
        'answerTooLateTimer': answerTooLateTimer
      };
      var result = {
        msg: null,
        type: 'null'
      };

      return RemoteDestinationService.save({
        customerId: user.meta.organizationID,
        userId: user.id
      }, rdBean,
        function () {
          TelephonyInfoService.updateSnr(vm.snrInfo);

          result.msg = $translate.instant('singleNumberReachPanel.success');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },
        function (response) {
          Notification.errorResponse(response, 'singleNumberReachPanel.error');
        }).$promise;
    }

    function deleteRemoteDestinationInfo(user) {
      var result = {
        msg: null,
        type: 'null'
      };

      return RemoteDestinationService.delete({
        customerId: user.meta.organizationID,
        userId: user.id,
        remoteDestId: vm.snrInfo.remoteDestinations[0].uuid
      },
        function () {
          vm.snrInfo.remoteDest.phoneNumber = null;
          vm.snrInfo.remoteDestinations = null;
          vm.snrInfo.singleNumberReachEnabled = false;
          TelephonyInfoService.updateSnr(vm.snrInfo);

          result.msg = $translate.instant('singleNumberReachPanel.removeSuccess');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },
        function (response) {
          Notification.errorResponse(response, 'singleNumberReachPanel.error');
        }).$promise;
    }

    function updateRemoteDestinationInfo(user, destination, answerTooLateTimer) {
      var rdBean = {
        'destination': removePhoneNumberFormatting(destination.phoneNumber),
        'answerTooLateTimer': answerTooLateTimer
      };
      var result = {
        msg: null,
        type: 'null'
      };

      return RemoteDestinationService.update({
        customerId: user.meta.organizationID,
        userId: user.id,
        remoteDestId: vm.snrInfo.remoteDestinations[0].uuid
      }, rdBean,
        function () {
          vm.snrInfo.answerTooLateTimer = answerTooLateTimer;
          TelephonyInfoService.updateSnr(vm.snrInfo);

          result.msg = $translate.instant('singleNumberReachPanel.success');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },
        function (response) {
          Notification.errorResponse(response, 'singleNumberReachPanel.error');
        }).$promise;
    }

    function saveSingleNumberReach() {
      if (_.isArray(vm.snrInfo.remoteDestinations) && vm.snrInfo.remoteDestinations.length > 0) {
        if (!vm.snrInfo.singleNumberReachEnabled) {
          deleteRemoteDestinationInfo(vm.currentUser).then(function () {
            resetForm();
          });
        } else {
          updateRemoteDestinationInfo(vm.currentUser, vm.snrInfo.remoteDest, vm.snrWaitSeconds.value).then(function () {
            resetForm();
          });
        }
      } else if (vm.snrInfo.singleNumberReachEnabled) {
        createRemoteDestinationInfo(vm.currentUser, vm.snrInfo.remoteDest, vm.snrWaitSeconds.value)
          .then(function () {
            TelephonyInfoService.getRemoteDestinationInfo(vm.currentUser.id);
            resetForm();
          });
      } else {
        // Nothing to delete, notify success
        resetForm();
        Notification.success('singleNumberReachPanel.removeSuccess');
      }
    }

    function getRandomString() {
      var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var randomString = '';
      for (var i = 0; i < 12; i++) {
        var randIndex = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randIndex, randIndex + 1);
      }
      return randomString;
    }
  }
})();
