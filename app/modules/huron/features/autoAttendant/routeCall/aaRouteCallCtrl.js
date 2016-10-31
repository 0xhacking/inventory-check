(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteCallMenuCtrl', AARouteCallMenuCtrl);

  /* @ngInject */
  function AARouteCallMenuCtrl($scope, $translate, AAUiModelService, AACommonService, AAScrollBar) {

    var vm = this;
    vm.actionPlaceholder = $translate.instant('autoAttendant.actionPlaceholder');

    vm.options = [{
      "label": $translate.instant('autoAttendant.phoneMenuRouteUser'),
      "value": "routeToUser"
    }, {
      "label": $translate.instant('autoAttendant.phoneMenuRouteVM'),
      "value": "routeToVoiceMail"
    }, {
      "label": $translate.instant('autoAttendant.phoneMenuRouteHunt'),
      "value": "routeToHuntGroup"
    }, {
      "label": $translate.instant('autoAttendant.phoneMenuRouteAA'),
      "value": "goto"
    }, {
      "label": $translate.instant('autoAttendant.phoneMenuRouteToExtNum'),
      "value": "route"
    }];

    vm.selected = {
      label: '',
      value: ''
    };

    vm.setSelects = setSelects;
    vm.selectChanged = selectChanged;

    function setSelects() {

      var val;

      /* look for matching action in menuEntries
         Set label from our list. Will trigger the html and the
         appropriate controller will setup the select list
       */

      _.forEach(vm.options, function (option) {
        val = _.find(vm.menuEntry.actions, {
          name: option.value
        });
        if (!_.isUndefined(val)) {
          if (val.name === option.value) {
            vm.selected = option;
            return true;
          }
        }

      });

    }

    function selectChanged() {
      AAScrollBar.resizeBuilderScrollBar();
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();
      vm.menuEntry = ui[$scope.schedule].entries[$scope.index];
      vm.options.sort(AACommonService.sortByProperty('label'));
      setSelects();

    }

    activate();
  }
})();
