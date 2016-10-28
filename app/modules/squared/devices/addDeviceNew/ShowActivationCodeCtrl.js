(function () {
  'use strict';

  angular.module('Core')
    .controller('ShowActivationCodeCtrl', ShowActivationCodeCtrl);
  /* @ngInject */
  function ShowActivationCodeCtrl($q, UserListService, OtpService, CsdmDataModelService, $stateParams, ActivationCodeEmailService, $translate, Notification, CsdmEmailService) {
    var vm = this;
    vm.wizardData = $stateParams.wizard.state().data;
    vm.hideBackButton = vm.wizardData.function == "showCode";
    vm.showEmail = false;
    vm.selectedUser = "" + vm.wizardData.displayName + " (" + vm.wizardData.email + ")";
    vm.email = {
      to: vm.wizardData.email,
      id: vm.wizardData.cisUuid
    };
    vm.qrCode = undefined;
    vm.timeLeft = '';
    vm.isLoading = true;

    vm.activationCode = vm.wizardData.activationCode || (vm.wizardData.code && vm.wizardData.code.activationCode) || '';

    vm.onCopySuccess = function () {
      Notification.success(
        'generateActivationCodeModal.clipboardSuccess',
        undefined,
        'generateActivationCodeModal.clipboardSuccessTitle'
      );
    };

    vm.onCopyError = function () {
      Notification.error(
        'generateActivationCodeModal.clipboardError',
        undefined,
        'generateActivationCodeModal.clipboardErrorTitle'
      );
    };

    function generateQRCode() {
      OtpService.getQrCodeUrl(vm.wizardData.activationCode || vm.wizardData.code.activationCode).then(function (qrcode) {
        var arrayData = '';
        for (var i in Object.keys(qrcode)) {
          if (qrcode.hasOwnProperty(i)) {
            arrayData += qrcode[i];
          }
        }
        vm.qrCode = arrayData;
        vm.isLoading = false;
      });
    }

    if (vm.wizardData.deviceType !== 'huron' && (!vm.wizardData.code || !vm.wizardData.code.activationCode)) {
      var success = function success(code) {
        if (code) {
          vm.wizardData.code = code;
          vm.activationCode = code.activationCode;
          vm.friendlyActivationCode = formatActivationCode(code.activationCode);
          generateQRCode();
        }
      };
      var error =
        function error(err) {
          Notification.errorWithTrackingId(err);
          vm.isLoading = false;
        };
      if (vm.place) {
        CsdmDataModelService
          .createCodeForExisting(vm.place.cisUuid)
          .then(success, error);
      } else {
        if (vm.wizardData.deviceType === "cloudberry") {
          CsdmDataModelService.createCsdmPlace(vm.wizardData.deviceName, vm.wizardData.deviceType).then(function (place) {
            vm.place = place;
            CsdmDataModelService
              .createCodeForExisting(place.cisUuid)
              .then(success, error);
          }, error);
        } else { //New Place
          success();
        }
      }
    } else {
      generateQRCode();
    }

    vm.activationFlowType = function () {
      if (vm.wizardData.deviceType === "cloudberry") {
        if (vm.wizardData.showPlaces) {
          return "places";
        }
        return "devices";
      }
      if (vm.wizardData.accountType === "shared") {
        return "places";
      }
      return "users";
    };

    function formatActivationCode(activationCode) {
      return activationCode ? activationCode.match(/.{4}/g).join('-') : '';
    }

    vm.friendlyActivationCode = formatActivationCode(vm.activationCode);

    vm.activateEmail = function () {
      vm.showEmail = true;
    };

    var timezone = jstz.determine().name();
    if (timezone === null || _.isUndefined(timezone)) {
      timezone = 'UTC';
    }
    vm.getExpiresOn = function () {
      return moment(vm.wizardData.expiryTime || (vm.wizardData.code && vm.wizardData.code.expiresOn) || undefined).local().tz(timezone).format('LLL (z)');
    };

    vm.onTextClick = function ($event) {
      $event.target.select();
    };

    vm.searchUser = function (searchString) {
      var deferred = $q.defer();
      if (searchString.length >= 3) {
        var callback = function (data) {
          var userList = data.Resources.map(function (r) {
            var name = null;
            if (r.name) {
              name = r.name.givenName;
              if (r.name.familyName) {
                name += ' ' + r.name.familyName;
              }
            }
            if (_.isEmpty(name)) {
              name = r.displayName;
            }
            if (_.isEmpty(name)) {
              name = r.userName;
            }
            r.extractedName = name;
            return r;
          });
          deferred.resolve(userList);
        };
        UserListService.listUsers(0, 10, null, null, callback, searchString, false);
      } else {
        deferred.resolve([]);
      }
      return deferred.promise;
    };

    vm.selectUser = function ($item) {
      vm.selectedUser = "" + $item.extractedName + " (" + $item.userName + ")";
      vm.email.to = $item.userName;
      vm.email.id = $item.id;
      vm.foundUser = "";
    };

    vm.sendActivationCodeEmail = function sendActivationCodeEmail() {
      if (vm.wizardData.deviceType === 'huron' && vm.wizardData.accountType === 'personal') {
        var emailInfo = {
          email: vm.email.to,
          firstName: vm.email.to,
          oneTimePassword: vm.activationCode,
          expiresOn: vm.getExpiresOn(),
          userId: vm.wizardData.cisUuid,
          customerId: vm.wizardData.organizationId
        };

        ActivationCodeEmailService.save({}, emailInfo, function () {
          Notification.notify(
            [$translate.instant('generateActivationCodeModal.emailSuccess', {
              'address': vm.email.to
            })],
            'success',
            $translate.instant('generateActivationCodeModal.emailSuccessTitle')
          );

        }, function () {
          Notification.notify(
            [$translate.instant('generateActivationCodeModal.emailError', {
              'address': vm.email.to
            })],
            'error',
            $translate.instant('generateActivationCodeModal.emailErrorTitle')
          );
        });
      } else {
        var cbEmailInfo = {
          toCustomerId: vm.wizardData.organizationId,
          toUserId: vm.email.id,
          machineAccountCustomerId: vm.wizardData.organizationId,
          machineAccountId: vm.wizardData.code.cisUuid,
          activationCode: vm.activationCode,
          expiryTime: vm.getExpiresOn()
        };
        var mailFunction;
        if (vm.wizardData.deviceType === 'cloudberry') {
          mailFunction = CsdmEmailService.sendCloudberryEmail;
        } else {
          mailFunction = CsdmEmailService.sendHuronEmail;
        }

        mailFunction(cbEmailInfo)
          .then(function () {
            Notification.notify(
              [$translate.instant('generateActivationCodeModal.emailSuccess', {
                'address': vm.email.to
              })],
              'success',
              $translate.instant('generateActivationCodeModal.emailSuccessTitle')
            );
          }, function () {
            Notification.notify(
              [$translate.instant('generateActivationCodeModal.emailError', {
                'address': vm.email.to
              })],
              'error',
              $translate.instant('generateActivationCodeModal.emailErrorTitle')
            );
          });
      }
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };
  }
})();
