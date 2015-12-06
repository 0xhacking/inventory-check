(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnSwivelNumbersCtrl', PstnSwivelNumbersCtrl);

  /* @ngInject */
  function PstnSwivelNumbersCtrl($translate, $state, $timeout, PstnSetup, Notification, TelephoneNumberService) {
    var vm = this;

    vm.hasCarriers = PstnSetup.isCarrierExists;
    vm.singleCarrierReseller = PstnSetup.isSingleCarrierReseller;
    vm.validateSwivelNumbers = validateSwivelNumbers;
    vm.getExampleNumbers = TelephoneNumberService.getExampleNumbers;

    vm.tokenfieldid = 'swivelAddNumbers';
    vm.tokenplaceholder = $translate.instant('didManageModal.inputPlacehoder');
    vm.tokenoptions = {
      delimiter: [',', ';'],
      createTokensOnBlur: true,
      limit: 50,
      tokens: [],
      minLength: 9,
      beautify: false
    };
    vm.tokenmethods = {
      createtoken: createToken,
      createdtoken: createdToken,
      edittoken: editToken
    };

    init();

    ////////////////////////

    function init() {
      vm.provider = PstnSetup.getProvider();
      vm.swivelNumbers = PstnSetup.getNumbers();
      TelephoneNumberService.setRegionCode(vm.provider.country);
      $timeout(function () {
        setSwivelNumberTokens(vm.swivelNumbers);
      }, 100);
    }

    function editToken(e) {
      // If invalid token, show the label text in the edit input
      if (e.attrs.invalid) {
        e.attrs.value = e.attrs.label;
      }
    }

    function createToken(e) {
      var tokenNumber = e.attrs.label;
      e.attrs.value = TelephoneNumberService.getDIDValue(tokenNumber);
      e.attrs.label = TelephoneNumberService.getDIDLabel(tokenNumber);

      var duplicate = _.find(getSwivelNumberTokens(), {
        value: e.attrs.value
      });
      if (duplicate) {
        e.attrs.duplicate = true;
      }
    }

    function createdToken(e) {
      if (e.attrs.duplicate) {
        $timeout(function () {
          var tokens = getSwivelNumberTokens();
          _.remove(tokens, function (e) {
            return e.duplicate;
          });
          Notification.error('pstnSetup.duplicateNumber', {
            number: e.attrs.label
          });
          setSwivelNumberTokens(tokens.map(function (token) {
            return token.value;
          }));
        });
      } else if (!TelephoneNumberService.validateDID(e.attrs.value)) {
        angular.element(e.relatedTarget).addClass('invalid');
        e.attrs.invalid = true;
      }
    }

    function setSwivelNumberTokens(tokens) {
      angular.element('#' + vm.tokenfieldid).tokenfield('setTokens', tokens);
    }

    function getSwivelNumberTokens() {
      return angular.element('#' + vm.tokenfieldid).tokenfield('getTokens');
    }

    function validateSwivelNumbers() {
      var tokens = getSwivelNumberTokens() || [];
      var invalid = _.find(tokens, {
        invalid: true
      });
      if (invalid) {
        Notification.error('pstnSetup.invalidNumberPrompt');
      } else if (tokens.length === 0) {
        Notification.error('pstnSetup.orderNumbersPrompt');
      } else {
        PstnSetup.setNumbers(tokens);
        $state.go('pstnSetup.review');
      }
    }

  }
})();
