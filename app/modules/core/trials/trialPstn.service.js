(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialPstnService', TrialPstnService);

  /* @ngInject */
  function TrialPstnService($q, Config, Notification, PstnServiceAddressService, PstnSetupService) {
    var _trialData;
    var service = {
      getData: getData,
      reset: reset,
      createPstnEntity: createPstnEntity,
      createPstnEntityV2: createPstnEntityV2,
      resetAddress: resetAddress,
    };

    return service;

    ////////////////

    function getData() {
      return _trialData || _makeTrial();
    }

    function reset() {
      _makeTrial();
    }

    function _makeTrial() {
      var defaults = {
        type: Config.offerTypes.pstn,
        enabled: false,
        skipped: false,
        details: {
          isTrial: true,
          pstnProvider: {},
          swivelNumbers: [],
          pstnContractInfo: {
            companyName: '',
            signeeFirstName: '',
            signeeLastName: '',
            email: ''
          },
          pstnNumberInfo: {
            state: {},
            areaCode: {},
            nxx: {},
            numbers: []
          },
          emergAddr: {
            streetAddress: '',
            unit: '',
            city: '',
            state: '',
            zip: ''
          }
        }
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }

    function createPstnEntity(customerOrgId, customerName) {
      if (_trialData.details.pstnProvider.apiImplementation === "SWIVEL") {
        _trialData.details.pstnNumberInfo.numbers = _trialData.details.swivelNumbers;
        _trialData.details.pstnContractInfo.companyName = customerName;
      }
      return reserveNumbers()
        .then(_.partial(createPstnCustomer, customerOrgId))
        .then(_.partial(orderNumbers, customerOrgId))
        .then(_.partial(createCustomerSite, customerOrgId));
    }

    function createPstnEntityV2(customerOrgId, customerName) {
      if (_trialData.details.pstnProvider.apiImplementation === "SWIVEL") {
        _trialData.details.pstnNumberInfo.numbers = _trialData.details.swivelNumbers;
        _trialData.details.pstnContractInfo.companyName = customerName;
      }
      return createPstnCustomerV2(customerOrgId)
        .then(_.partial(reserveNumbersWithCustomer, customerOrgId))
        .then(_.partial(orderNumbers, customerOrgId))
        .then(_.partial(createCustomerSite, customerOrgId));
    }

    function reserveNumbers() {
      if (_trialData.details.pstnProvider.apiImplementation !== "SWIVEL") {
        return PstnSetupService.reserveCarrierInventory(
          '',
          _trialData.details.pstnProvider.uuid,
          _trialData.details.pstnNumberInfo.numbers,
          false
        ).catch(function (response) {
          Notification.errorResponse(response, 'trialModal.pstn.error.reserveFail');
          return $q.reject(response);
        });
      } else {
        return $q.resolve();
      }
    }

    function reserveNumbersWithCustomer(customerOrgId) {
      if (_trialData.details.pstnProvider.apiImplementation !== "SWIVEL") {
        return PstnSetupService.reserveCarrierInventory(
          customerOrgId,
          _trialData.details.pstnProvider.uuid,
          _trialData.details.pstnNumberInfo.numbers,
          true
        ).catch(function (response) {
          Notification.errorResponse(response, 'trialModal.pstn.error.reserveFail');
          return $q.reject(response);
        });
      } else {
        return $q.resolve();
      }
    }

    function createPstnCustomer(customerOrgId) {
      return PstnSetupService.createCustomer(
        customerOrgId,
        _trialData.details.pstnContractInfo.companyName,
        _trialData.details.pstnContractInfo.signeeFirstName,
        _trialData.details.pstnContractInfo.signeeLastName,
        _trialData.details.pstnContractInfo.email,
        _trialData.details.pstnProvider.uuid,
        _trialData.details.pstnNumberInfo.numbers,
        _trialData.details.isTrial
      ).catch(function (response) {
        Notification.errorResponse(response, 'trialModal.pstn.error.customerFail');
        return $q.reject(response);
      });
    }

    function createPstnCustomerV2(customerOrgId) {
      return PstnSetupService.createCustomerV2(
        customerOrgId,
        _trialData.details.pstnContractInfo.companyName,
        _trialData.details.pstnContractInfo.signeeFirstName,
        _trialData.details.pstnContractInfo.signeeLastName,
        _trialData.details.pstnContractInfo.email,
        _trialData.details.pstnProvider.uuid,
        _trialData.details.isTrial
      ).catch(function (response) {
        Notification.errorResponse(response, 'trialModal.pstn.error.customerFail');
        return $q.reject(response);
      });
    }

    function orderNumbers(customerOrgId) {
      return PstnSetupService.orderNumbers(
        customerOrgId,
        _trialData.details.pstnProvider.uuid,
        _trialData.details.pstnNumberInfo.numbers
      ).catch(function (response) {
        Notification.errorResponse(response, 'trialModal.pstn.error.orderFail');
        return $q.reject(response);
      });
    }

    function createCustomerSite(customerOrgId) {
      if (_trialData.details.pstnProvider.apiImplementation !== "SWIVEL") {
        var address = {
          streetAddress: _trialData.details.emergAddr.streetAddress,
          unit: _trialData.details.emergAddr.unit,
          city: _trialData.details.emergAddr.city,
          state: _trialData.details.emergAddr.state,
          zip: _trialData.details.emergAddr.zip
        };
        return PstnServiceAddressService.createCustomerSite(
          customerOrgId,
          _trialData.details.pstnContractInfo.companyName,
          address
        ).catch(function (response) {
          Notification.errorResponse(response, 'trialModal.pstn.error.siteFail');
          return $q.reject(response);
        });
      }
    }

    function resetAddress() {
      _trialData.details.emergAddr.streetAddress = '';
      _trialData.details.emergAddr.unit = '';
      _trialData.details.emergAddr.city = '';
      _trialData.details.emergAddr.state = '';
      _trialData.details.emergAddr.zip = '';
    }
  }
})();
