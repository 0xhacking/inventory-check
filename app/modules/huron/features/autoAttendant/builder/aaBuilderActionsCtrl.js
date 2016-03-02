(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderActionsCtrl', AABuilderActionsCtrl);

  /* @ngInject */
  function AABuilderActionsCtrl($scope, $translate, $controller, AAUiModelService, AutoAttendantCeMenuModelService, Config, AACommonService) {

    var vm = this;

    vm.options = [{
      title: $translate.instant('autoAttendant.actionSayMessage'),
      controller: 'AASayMessageCtrl as aaSay',
      url: 'modules/huron/features/autoAttendant/sayMessage/aaSayMessage.tpl.html',
      hint: $translate.instant('autoAttendant.actionSayMessageHint'),
      help: $translate.instant('autoAttendant.sayMessageHelp'),
      actions: ['say']
    }, {
      title: $translate.instant('autoAttendant.actionPhoneMenu'),
      controller: 'AAPhoneMenuCtrl as aaPhoneMenu',
      url: 'modules/huron/features/autoAttendant/phoneMenu/aaPhoneMenu.tpl.html',
      hint: $translate.instant('autoAttendant.actionPhoneMenuHint'),
      help: $translate.instant('autoAttendant.phoneMenuHelp'),
      actions: ['runActionsOnInput']
    }, {
      title: $translate.instant('autoAttendant.actionRouteCall'),
      controller: 'AARouteCallMenuCtrl as aaRouteCallMenu',
      url: 'modules/huron/features/autoAttendant/routeCall/aaRouteCallMenu.tpl.html',
      hint: $translate.instant('autoAttendant.actionRouteCallHint'),
      help: $translate.instant('autoAttendant.routeCallMenuHelp'),
      actions: ['route', 'goto', 'routeToUser', 'routeToVoiceMail', 'routeToHuntGroup']
    }];

    vm.actionPlaceholder = $translate.instant("autoAttendant.actionPlaceholder");
    vm.option = ""; // no default option
    vm.schedule = "";
    vm.selectHint = "";

    vm.getOptionController = getOptionController;
    vm.selectOption = selectOption;
    vm.getSelectHint = getSelectHint;
    vm.removeAction = removeAction;

    vm.allowStepAddsDeletes = Config.isDev() || Config.isIntegration();

    /////////////////////

    function selectOption() {
      AACommonService.setActionStatus(true);
    }

    function getSelectHint() {
      if (!vm.selectHint) {
        _.each(vm.options, function (option, index) {
          if (option.title && option.hint) {
            vm.selectHint = vm.selectHint.concat("<i>").concat(option.title).concat("</i>").concat(" - ").concat(option.hint).concat("<br>");
            if (index < vm.options.length - 1) {
              vm.selectHint = vm.selectHint.concat("<br>");
            }
          }
        });
      }

      return vm.selectHint;
    }

    function getOptionController() {
      if (vm.option && vm.option.controller) {
        return $controller(vm.option.controller, {
          $scope: $scope
        });
      }
    }

    function removeAction(index) {
      var uiMenu = vm.ui[vm.schedule];
      uiMenu.deleteEntryAt(index);

      AACommonService.setActionStatus(true);
    }

    function setOption() {
      if ($scope.index >= 0) {
        var menuEntry = vm.ui[vm.schedule].getEntryAt($scope.index);
        if (menuEntry.type == "MENU_OPTION") {
          vm.option = vm.options[1];
        } else if (menuEntry.actions.length > 0 && menuEntry.actions[0].getName()) {
          for (var i = 0; i < vm.options.length; i++) {
            var isMatch = vm.options[i].actions.some(function (action) {
              return menuEntry.actions[0].getName() === action;
            });
            if (isMatch) {
              vm.option = vm.options[i];
            }
          }
        }
      }
    }

    function activate() {
      vm.schedule = $scope.schedule;
      vm.ui = AAUiModelService.getUiModel();
      setOption();
    }

    activate();
  }
})();
