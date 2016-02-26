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
        type: Config.offerTypes.call,
        enabled: false,
        details: {
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

    function createPstnEntity(customerOrgId) {
      return reserveNumbers()
        .then(_.partial(createPstnCustomer, customerOrgId))
        .then(_.partial(orderNumbers, customerOrgId))
        .then(_.partial(createCustomerSite, customerOrgId));
    }

    function reserveNumbers() {
      return PstnSetupService.reserveCarrierInventory(
        '',
        _trialData.details.pstnProvider.uuid,
        _trialData.details.pstnNumberInfo.numbers,
        false
      ).catch(function (response) {
        Notification.errorResponse(response, 'trialModal.pstn.error.reserveFail');
        return $q.reject(response);
      });

    }

    function createPstnCustomer(customerOrgId) {
      return PstnSetupService.createCustomer(
        customerOrgId,
        _trialData.details.pstnContractInfo.companyName,
        _trialData.details.pstnContractInfo.signeeFirstName,
        _trialData.details.pstnContractInfo.signeeLastName,
        _trialData.details.pstnContractInfo.email,
        _trialData.details.pstnProvider.uuid,
        _trialData.details.pstnNumberInfo.numbers
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

    function resetAddress() {
      _trialData.details.emergAddr.streetAddress = '';
      _trialData.details.emergAddr.unit = '';
      _trialData.details.emergAddr.city = '';
      _trialData.details.emergAddr.state = '';
      _trialData.details.emergAddr.zip = '';
    }
  }
})();
