(function () {
  'use strict';

  angular.module('uc.hurondetails', ['uc.lines'],
    function (formlyConfigProvider) {
      var commonWrappers = ['ciscoWrapper'];
      formlyConfigProvider.setType({
        name: 'custom-combobox',
        templateUrl: 'modules/huron/settings/customCombobox/formly-field-custom-combobox.tpl.html',
        wrapper: commonWrappers
      });
      formlyConfigProvider.setType({
        name: 'nested',
        template: '<formly-form model="model[options.key]" fields="options.data.fields"></formly-form>',
        wrapper: commonWrappers
      });
      formlyConfigProvider.setType({
        name: 'switch',
        template: '<cs-toggle-switch ng-model="model[options.key]" toggle-id="model[options.key]" name="toggleSwitch"></cs-toggle-switch>',
        wrapper: commonWrappers
      });
    }
  );

})();
