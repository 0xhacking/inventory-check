'use strict';
/* global moment, $ */

angular.module('Squared')
  .controller('DevicesCtrlRedux',

    /* @ngInject */
    function ($scope, $state, $templateCache, DeviceFilter, CsdmCodeService, CsdmDeviceService, AddDeviceModal) {
      var vm = this;

      vm.deviceFilter = DeviceFilter;

      vm.codesListSubscription = CsdmCodeService.subscribe(angular.noop, {
        scope: $scope
      });

      vm.deviceListSubscription = CsdmDeviceService.subscribe(angular.noop, {
        scope: $scope
      });

      vm.updateListAndFilter = function () {
        var filtered = _.chain({})
          .extend(CsdmDeviceService.getDeviceList())
          .extend(CsdmCodeService.getCodeList())
          .values()
          .value();
        return DeviceFilter.getFilteredList(filtered);
      };

      vm.gridOptions = {
        data: 'sc.updateListAndFilter()',
        rowHeight: 75,
        showFilter: false,
        multiSelect: false,
        headerRowHeight: 44,
        sortInfo: {
          directions: ['asc'],
          fields: ['displayName']
        },
        rowTemplate: getTemplate('_rowTpl'),

        columnDefs: [{
          field: 'displayName',
          displayName: 'Belongs to',
          cellTemplate: getTemplate('_nameTpl'),
          sortFn: sortFn
        }, {
          field: 'readableState',
          displayName: 'Status',
          cellTemplate: getTemplate('_statusTpl'),
          sortFn: sortFn
        }, {
          field: 'product',
          displayName: 'Type',
          cellTemplate: getTemplate('_productTpl'),
          sortFn: sortFn
        }]
      };

      vm.showDeviceDetails = function (device) {
        vm.currentDevice = device; // fixme: modals depend on state set here
        $state.go('device-overview-redux', {
          currentDevice: device
        });
      };

      vm.showAddDeviceDialog = function () {
        AddDeviceModal.open();
      };

      function getTemplate(name) {
        return $templateCache.get('modules/squared/devicesRedux/templates/' + name + '.html');
      }

      function sortFn(a, b) {
        if (a && a.localeCompare) {
          return a.localeCompare(b);
        }
        return 1;
      }

    }
  );
