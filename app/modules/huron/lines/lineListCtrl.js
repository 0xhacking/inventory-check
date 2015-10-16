(function () {
  'use strict';
  /* global $ */

  angular
    .module('Huron')
    .controller('LinesListCtrl', LinesListCtrl);

  /* @ngInject */
  function LinesListCtrl($scope, $timeout, $translate, LineListService, Log, Config, Notification) {

    var vm = this;

    vm.currentDataPosition = 0;
    vm.gridRefresh = true; // triggers the spinner over the grid
    vm.searchStr = '';
    vm.timeoutVal = 1000;
    vm.timer = 0;
    vm.activeFilter = 'all';
    vm.userPreviewActive = false;
    vm.userDetailsActive = false;
    vm.load = false;
    $scope.gridData = [];

    vm.sort = {
      by: 'userid',
      order: '-asc'
    };

    // Defines Grid Filter "All"
    vm.placeholder = {
      name: $translate.instant('linesPage.allLines'),
      filterValue: 'all',
      count: 0
    };

    // Defines Grid Filters "Unassigned" and "Assigned"
    vm.filters = [{
      name: $translate.instant('linesPage.unassignedLines'),
      filterValue: 'unassignedLines',
      count: 0
    }, {
      name: $translate.instant('linesPage.assignedLines'),
      filterValue: 'assignedLines',
      count: 0
    }];

    // Set data filter
    vm.setFilter = function (filter) {
      if (vm.activeFilter !== filter) {
        vm.activeFilter = filter;
        getLineList();
      }
    };

    // On click, filter line list and set active filter
    vm.filterList = function (str) {
      if (vm.timer) {
        $timeout.cancel(vm.timer);
        vm.timer = 0;
      }

      vm.timer = $timeout(function () {

        // Require at least three characters based on user experience with
        // existing Users Page where CI requires three char before
        // making backend request to update data
        if (str.length >= 3 || str === '') {
          vm.searchStr = str;
          getLineList();
        }
      }, vm.timeoutVal);
    };

    // Get count of line association data;
    // total, unassigned, assigned lines
    function getCount() {
      LineListService.getCount(vm.searchStr)
        .then(function (response) {
          vm.placeholder.count = response.totalCount || 0;
          vm.filters[0].count = response.unassignedCount || 0;
          vm.filters[1].count = response.assignedCount || 0;
        })
        .catch(function (response) {
          Log.debug('Query for line association record counts failed.');
          Notification.errorResponse(response, 'linesPage.getCountError');
        });
    } // End of function getCount

    // Get line association data to populate the grid
    function getLineList(startAt) {
      vm.gridRefresh = true;

      // Update counts when line association data needs to be refreshed
      getCount();

      // Clear currentLine if a new search begins
      var startIndex = startAt || 0;
      vm.currentLine = null;

      // Get "unassigned" internal and external lines
      LineListService.getLineList(startIndex, Config.usersperpage, vm.sort.by, vm.sort.order, vm.searchStr, vm.activeFilter)
        .then(function (response) {

          $timeout(function () {
            vm.load = true;
          });

          if (startIndex === 0) {
            $scope.gridData = response;
          } else {
            $scope.gridData = $scope.gridData.concat(response);
          }

          vm.gridRefresh = false;
        })
        .catch(function (response) {
          Log.debug('Query for line associations failed.');
          Notification.errorResponse(response, 'linesPage.lineListError');
          vm.gridRefresh = false;
        });
    } // End of function getLineList

    var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showUserDetails(row.entity)">' +
      '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"></div>' +
      '<div ng-cell></div>' +
      '</div>';

    var gridRowHeight = 44;

    vm.gridOptions = {
      data: 'gridData',
      multiSelect: false,
      showFilter: false,
      rowHeight: gridRowHeight,
      rowTemplate: rowTemplate,
      headerRowHeight: gridRowHeight,
      useExternalSorting: false,
      enableRowSelection: false,
      sortInfo: { // make the sort arrow appear at grid load time
        fields: ['userId'],
        directions: ['asc']
      },

      columnDefs: [{
        field: 'internalNumber',
        displayName: $translate.instant('linesPage.internalNumberHeader'),
        width: '30%',
        cellClass: 'internalNumberColumn',
        sortable: true
      }, {
        field: 'externalNumber',
        displayName: $translate.instant('linesPage.externalNumberHeader'),
        sortable: true
      }, {
        field: 'userId',
        displayName: $translate.instant('linesPage.userEmailHeader'),
        sortable: true

      }]
    };

    $scope.$on('ngGridEventScroll', function () {
      if (vm.load) {
        vm.currentDataPosition++;
        vm.load = false;
        getLineList(vm.currentDataPosition * Config.usersperpage + 1);
      }
    });

    $scope.$on('ngGridEventSorted', function (event, data) {
      // assume event data will always contain sort fields and directions
      var sortBy = data.fields[0].toLowerCase();
      var sortOrder = '-' + data.directions[0].toLowerCase();

      if (vm.sort.by !== sortBy || vm.sort.order !== sortOrder) {
        vm.sort.by = sortBy;
        vm.sort.order = sortOrder;

        if (vm.load) {
          vm.load = false;
          getLineList();
        }
      }
    });

    getLineList();

    // list is updated by adding or entitling a user
    $scope.$on('lineListUpdated', function () {
      getLineList();
    });
  }
})();
