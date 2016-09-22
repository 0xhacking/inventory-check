(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToQueueCtrl', AARouteToQueueCtrl);

  /* @ngInject */
  function AARouteToQueueCtrl($scope, $translate, $modal, QueueHelperService, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService) {

    var vm = this;

    vm.queueSelected = {
      description: '',
      id: ''
    };

    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceHolder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
    vm.queues = [];

    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    var rtQueue = 'routeToQueue';
    var fromRouteCall = false;
    vm.openQueueTreatmentModal = openQueueTreatmentModal;

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;
    /////////////////////
    function openQueueTreatmentModal() {
      $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/routeToQueue/aaNewTreatmentModal.tpl.html',
        controller: 'AANewTreatmentModalCtrl',
        controllerAs: 'aaNewTreatmentModalCtrl',
        type: 'full'
      });
    }

    function populateUiModel() {

      if (fromRouteCall) {
        vm.queueSelected.id = vm.menuEntry.actions[0].getValue();
      } else {
        vm.queueSelected.id = vm.menuKeyEntry.actions[0].getValue();
      }
      vm.queueSelected.description = _.result(_.find(vm.queues, {
        'id': vm.queueSelected.id
      }), 'description', '');
    }

    function saveUiModel() {
      if (fromRouteCall) {
        vm.menuEntry.actions[0].setValue(vm.queueSelected.id);
      } else {
        vm.menuKeyEntry.actions[0].setValue(vm.queueSelected.id);
      }
      AACommonService.setPhoneMenuStatus(true);
    }

    function getQueues() {

      return QueueHelperService.listQueues().then(function (aaQueueList) {
        _.each(aaQueueList, function (aaQueue) {
          var idPos = aaQueue.queueUrl.lastIndexOf("/");
          vm.queues.push({
            description: aaQueue.queueName,
            id: aaQueue.queueUrl.substr(idPos + 1)
          });
        });
      });

    }

    function activate() {

      if ($scope.fromRouteCall) {
        var ui = AAUiModelService.getUiModel();
        vm.uiMenu = ui[$scope.schedule];
        vm.menuEntry = vm.uiMenu.entries[$scope.index];
        fromRouteCall = true;

        if (vm.menuEntry.actions.length === 0) {
          action = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
          vm.menuEntry.addAction(action);
        } else {
          // make sure action is HG not AA, User, extNum, etc
          if (!(vm.menuEntry.actions[0].getName() === rtQueue)) {
            vm.menuEntry.actions[0].setName(rtQueue);
            vm.menuEntry.actions[0].setValue('');
          } // else let saved value be used
        }
      } else {
        vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        if ($scope.keyIndex < vm.menuEntry.entries.length) {
          vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
          vm.menuKeyEntry.addAction(action);
        }

      }
      getQueues().then(function () {
        populateUiModel();
      });

    }
    activate();
  }
})();
