'use strict';
/* global moment */

angular.module('Core')
  .controller('PartnerHomeCtrl', ['$scope', '$rootScope', '$stateParams', 'Notification', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate', 'PartnerService', '$filter', '$state', 'ExternalNumberPool', 'LogMetricsService', '$log',

    function ($scope, $rootScope, $stateParams, Notification, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate, PartnerService, $filter, $state, ExternalNumberPool, LogMetricsService, $log) {

      var FREE = 0,
        TRIAL = 1,
        ACTIVE = 2,
        CANCELED = 99,
        NO_LICENSE = -1,
        NOTE_EXPIRED = 0,
        NOTE_EXPIRE_TODAY = 0,
        NOTE_NO_LICENSE = 0,
        NOTE_CANCELED = 0,
        NOTE_NOT_EXPIRED = 99;
      $scope.load = true;
      $scope.currentDataPosition = 0;
      if ($state.params.filter) {
        $scope.activeFilter = $state.params.filter;
      } else {
        $scope.activeFilter = 'all';
      }

      $scope.daysExpired = 5;
      $scope.displayRows = 10;
      $scope.expiredRows = 3;
      $scope.currentTrial = null;
      $scope.showTrialsRefresh = true;
      $scope.filter = 'ALL';
      $scope.isCustomerPartner = Authinfo.isCustomerPartner;
      setNotesTextOrder();

      $scope.openAddTrialModal = function () {
        $state.go('trialAdd.info').then(function () {
          $state.modal.result.finally(function () {
            getTrialsList();
            getManagedOrgsList();
          });
        });
      };

      $scope.openEditTrialModal = function () {
        $state.go('trialEdit.info', {
          showPartnerEdit: true,
          currentTrial: $scope.currentTrial
        }).then(function () {
          $state.modal.result.finally(function () {
            getTrialsList();
            getManagedOrgsList();
          });
        });
      };

      $scope.setTrial = function (trial) {
        $scope.currentTrial = trial;
      };

      $scope.getProgressStatus = function (obj) {
        if (!obj) {
          obj = $scope.currentTrial;
        }
        if (obj.daysLeft <= 5) {
          return 'danger';
        } else if (obj.daysLeft < (obj.duration / 2)) {
          return 'warning';
        } else {
          return 'success';
        }
      };

      function loadRetrievedDataToList(retrievedData, list, isTrialData) {
        for (var index in retrievedData) {
          var data = retrievedData[index];
          var edate = moment(data.startDate).add(data.trialPeriod, 'days').format('MMM D, YYYY');
          var dataObj = {
            trialId: data.trialId,
            customerOrgId: data.customerOrgId,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            endDate: edate,
            numUsers: data.licenseCount,
            daysLeft: 0,
            usage: 0,
            licenses: 0,
            licenseList: [],
            messaging: null,
            conferencing: null,
            communications: null,
            daysUsed: 0,
            percentUsed: 0,
            duration: data.trialPeriod,
            offer: '',
            status: data.state,
            state: data.state,
            isAllowedToManage: true,
            isSquaredUcOffer: false
          };

          dataObj.isAllowedToManage = isTrialData || data.isAllowedToManage;

          if (data.offers) {
            dataObj.offers = data.offers;
            var offerNames = [];
            for (var cnt in data.offers) {
              var offer = data.offers[cnt];
              if (!offer) {
                continue;
              }
              switch (offer.id) {
              case Config.trials.collab:
                offerNames.push($translate.instant('trials.collab'));
                break;
              case Config.trials.squaredUC:
                dataObj.isSquaredUcOffer = true;
                offerNames.push($translate.instant('trials.squaredUC'));
                break;
              }
              dataObj.usage = offer.usageCount;
              dataObj.licenses = offer.licenseCount;
            }
            dataObj.offer = offerNames.join(', ');
          }

          dataObj.licenseList = data.licenses;
          dataObj.messaging = getLicense(data.licenses, 'messaging');
          dataObj.conferencing = getLicense(data.licenses, 'conferencing');
          dataObj.communications = getLicense(data.licenses, 'communications');

          var now = moment().format('MMM D, YYYY');
          var then = edate;
          var start = moment(data.startDate).format('MMM D, YYYY');

          var daysDone = moment(now).diff(start, 'days');
          dataObj.daysUsed = daysDone;
          dataObj.percentUsed = Math.round((daysDone / data.trialPeriod) * 100);

          var daysLeft = moment(then).diff(now, 'days');
          dataObj.daysLeft = daysLeft;
          if (isTrialData) {
            if (daysLeft >= 0) {
              $scope.activeList.push(dataObj);
            } else {
              dataObj.status = $translate.instant('customerPage.expired');
              $scope.expiredList.push(dataObj);
            }
          }

          var tmpServiceObj = {
            status: dataObj.status,
            daysLeft: daysLeft,
            customerName: dataObj.customerName
          };
          angular.extend(dataObj.messaging, tmpServiceObj);
          angular.extend(dataObj.conferencing, tmpServiceObj);
          angular.extend(dataObj.communications, tmpServiceObj);
          setServiceSortOrder(dataObj.messaging, dataObj.licenseList);
          setServiceSortOrder(dataObj.conferencing, dataObj.licenseList);
          setServiceSortOrder(dataObj.communications, dataObj.licenseList);

          dataObj.notes = {};
          setNotesSortOrder(dataObj);

          list.push(dataObj);
        }
      }

      function getTrialsList() {
        $scope.showTrialsRefresh = true;
        $scope.activeList = [];
        $scope.expiredList = [];
        $scope.trialsList = [];
        PartnerService.getTrialsList(function (data, status) {
          $scope.showTrialsRefresh = false;
          if (data.success && data.trials) {
            if (data.trials.length > 0) {
              loadRetrievedDataToList(data.trials, $scope.trialsList, true);
              $scope.showExpired = $scope.expiredList.length > 0;
              Log.debug('active trial records found:' + $scope.activeList.length);
              Log.debug('total trial records found:' + $scope.trialsList.length);
            } else {
              $scope.getPending = false;
              Log.debug('No trial records found');
            }
            $scope.totalTrials = $scope.trialsList.length;
          } else {
            Log.debug('Failed to retrieve trial information. Status: ' + status);
            $scope.getPending = false;
            Notification.notify([$translate.instant('partnerHomePage.errGetTrialsQuery', {
              status: status
            })], 'error');
          }
        });
      }

      function getManagedOrgsList() {
        $scope.showManagedOrgsRefresh = true;
        $scope.managedOrgsList = [];
        PartnerService.getManagedOrgsList(function (data, status) {
          $scope.showManagedOrgsRefresh = false;
          if (data.success && data.organizations) {
            if (data.organizations.length > 0) {
              loadRetrievedDataToList(data.organizations, $scope.managedOrgsList, false);
              Log.debug('total managed orgs records found:' + $scope.managedOrgsList.length);
            } else {
              Log.debug('No managed orgs records found');
            }
            $scope.totalOrgs = $scope.managedOrgsList.length;
          } else {
            Log.debug('Failed to retrieve managed orgs information. Status: ' + status);
            Notification.notify([$translate.instant('partnerHomePage.errGetTrialsQuery', {
              status: status
            })], 'error');
          }
        });
      }

      $scope.closeActionsDropdown = function () {
        angular.element('.open').removeClass('open');
      };

      if (!$scope.isCustomerPartner) {
        getTrialsList();
      }
      getManagedOrgsList();

      $scope.activeCount = 0;
      if ($scope.activeList) {
        $scope.activeCount = $scope.activeList.length;
      }
      if ($scope.activeFilter === 'all') {
        $scope.gridData = $scope.managedOrgsList;
      } else {
        $scope.gridData = $scope.trialsList;
      }

      $scope.newTrialName = null;
      $scope.trialsGrid = {
        data: 'activeList',
        multiSelect: false,
        showFilter: true,
        rowHeight: 38,
        headerRowHeight: 38,
        selectedItems: [],
        sortInfo: {
          fields: ['endDate', 'customerName', 'numUsers'],
          directions: ['asc']
        },

        columnDefs: [{
          field: 'customerName',
          displayName: $translate.instant('partnerHomePage.trialsCustomerName')
        }, {
          field: 'endDate',
          displayName: $translate.instant('partnerHomePage.trialsEndDate')
        }, {
          field: 'numUsers',
          displayName: $translate.instant('partnerHomePage.trialsNumUsers')
        }]
      };

      var actionsTemplate = '<span dropdown>' +
        '<button id="{{row.entity.customerName}}ActionsButton" class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-primary" role="menu">' +
        '<li ng-show="row.entity.isAllowedToManage" id="{{row.entity.customerName}}LaunchCustomerButton"><a href="" ng-click="$event.stopPropagation(); closeActionsDropdown();" ui-sref="login_swap({customerOrgId: row.entity.customerOrgId, customerOrgName: row.entity.customerName})" target="_blank"><span translate="customerPage.launchButton"></span></a></li>' +
        '<li cr-feature-toggle feature-show="pstnSetup" ng-show="row.entity.isSquaredUcOffer" id="{{row.entity.customerName}}PstnSetup"><a href="" ng-click="$event.stopPropagation(); closeActionsDropdown();" ui-sref="pstnSetup({customerId: row.entity.customerOrgId, customerName: row.entity.customerName})"><span translate="pstnSetup.setupPstn"></span></a></li>' +
        '<li cr-feature-toggle feature-hide="pstnSetup" ng-show="row.entity.isSquaredUcOffer" id="{{row.entity.customerName}}UploadNumbers"><a href="" ng-click="$event.stopPropagation(); closeActionsDropdown();" ui-sref="didadd({currentOrg: row.entity})"><span translate="customerPage.uploadNumbers"></span></a></li>' +
        '</ul>' +
        '</span>';

      var rowTemplate = '<div id="{{row.entity.customerName}}" orgId="{{row.entity.customerOrgId}}" ng-style="{ \'cursor\': row.cursor }"' +
        ' ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"' +
        ' ng-click="showCustomerDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var serviceTemplate = '<div class="ngCellText align-center">' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && isLicenseTypeActive(row.entity, col.field)"' +
        ' class="badge" ng-class="{\'badge-active\': row.entity.status != \'CANCELED\', \'badge-disabled\': row.entity.status === \'CANCELED\'}"' +
        ' translate="customerPage.active"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && isLicenseTypeATrial(row.entity, col.field)"' +
        ' class="badge" ng-class="{\'badge-trial\': row.entity.status != \'CANCELED\', \'badge-disabled\': row.entity.status === \'CANCELED\'}" translate="customerPage.trial"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && isLicenseTypeFree(row.entity, col.field)"' +
        ' ng-class="{\'free\': row.entity.status != \'CANCELED\', \'free-disabled\': row.entity.status === \'CANCELED\'}" translate="customerPage.free"></span></div>';

      var notesTemplate = '<div class="ngCellText">' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'ACTIVE\' && row.entity.daysLeft > 0"' +
        ' translate="customerPage.daysRemaining" translate-values="{count: row.entity.daysLeft}"></span>' +
        '<span ng-if="row.entity.isTrial && isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'ACTIVE\' && row.entity.daysLeft === 0"' +
        ' class="red" translate="customerPage.expiringToday"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'ACTIVE\' && row.entity.daysLeft < 0"' +
        ' class="red" translate="customerPage.expired"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'CANCELED\'"' +
        ' translate="customerPage.suspended"> </span>' +
        '<span ng-if="!isLicenseInfoAvailable(row.entity.licenseList)"' +
        ' class="red" translate="customerPage.licenseInfoNotAvailable"></span></div>';

      $scope.gridOptions = {
        data: 'gridData',
        multiSelect: false,
        showFilter: false,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: false,
        sortInfo: {
          fields: ['customerName'],
          directions: ['asc']
        },

        columnDefs: [{
          field: 'customerName',
          displayName: $translate.instant('customerPage.customerNameHeader'),
          width: '25%'
        }, {
          field: 'messaging',
          displayName: $translate.instant('customerPage.messaging'),
          width: '12%',
          cellTemplate: serviceTemplate,
          headerClass: 'align-center',
          sortFn: serviceSort
        }, {
          field: 'conferencing',
          displayName: $translate.instant('customerPage.conferencing'),
          width: '12%',
          cellTemplate: serviceTemplate,
          headerClass: 'align-center',
          sortFn: serviceSort
        }, {
          field: 'communications',
          displayName: $translate.instant('customerPage.communications'),
          width: '12%',
          cellTemplate: serviceTemplate,
          headerClass: 'align-center',
          sortFn: serviceSort
        }, {
          field: 'notes',
          displayName: $translate.instant('customerPage.notes'),
          cellTemplate: notesTemplate,
          sortFn: notesSort
        }, {
          field: 'action',
          displayName: $translate.instant('customerPage.actionHeader'),
          sortable: false,
          cellTemplate: actionsTemplate,
          width: '90px'
        }]
      };

      function setServiceSortOrder(license, licenses) {
        if (!licenses || licenses.length === 0) {
          license.sortOrder = NO_LICENSE;
        } else {
          if (license.status === 'CANCELED') {
            license.sortOrder = CANCELED;
          } else if (isLicenseFree(license)) {
            license.sortOrder = FREE;
          } else if (isLicenseATrial(license)) {
            license.sortOrder = TRIAL;
          } else if (isLicenseActive(license)) {
            license.sortOrder = ACTIVE;
          } else {
            license.sortOrder = NO_LICENSE;
          }
        }
      }

      function serviceSort(a, b) {
        if (a.sortOrder === TRIAL && b.sortOrder === TRIAL) {
          // if a and b are both trials, sort by expiration length
          return sortByDays(a, b);
        } else if (a.sortOrder === b.sortOrder) {
          // if a & b have the same sort order, sort by name
          return sortByName(a, b);
        } else {
          return a.sortOrder - b.sortOrder;
        }
      }

      function sortByDays(a, b) {
        if (a.daysLeft !== b.daysLeft) {
          return a.daysLeft - b.daysLeft;
        } else {
          return sortByName(a, b);
        }
      }

      function sortByName(a, b) {
        if (a.customerName.toLowerCase() > b.customerName.toLowerCase()) {
          return 1;
        } else if (a.customerName.toLowerCase() < b.customerName.toLowerCase()) {
          return -1;
        } else {
          return 0;
        }
      }

      function setNotesTextOrder() {
        var textSuspended = $translate.instant('customerPage.suspended'),
          textExpiringToday = $translate.instant('customerPage.expiringToday'),
          textExpired = $translate.instant('customerPage.expired'),
          textLicenseInfoNotAvailable = $translate.instant('customerPage.licenseInfoNotAvailable');
        var textArray = [
          textSuspended,
          textExpiringToday,
          textExpired,
          textLicenseInfoNotAvailable
        ];
        textArray.sort();
        angular.forEach(textArray, function (text, index) {
          if (text === textSuspended) {
            NOTE_CANCELED = index;
          } else if (text === textExpiringToday) {
            NOTE_EXPIRE_TODAY = index;
          } else if (text === textExpired) {
            NOTE_EXPIRED = index;
          } else if (text === textLicenseInfoNotAvailable) {
            NOTE_NO_LICENSE = index;
          }
        });
      }

      function setNotesSortOrder(rowData) {
        rowData.notes = {};
        if ($scope.isLicenseInfoAvailable(rowData.licenseList)) {
          if (rowData.status === 'CANCELED') {
            rowData.notes.sortOrder = NOTE_CANCELED;
            rowData.notes.text = $translate.instant('customerPage.suspended');
          } else if (rowData.status === 'ACTIVE' && rowData.daysLeft > 0) {
            rowData.notes.sortOrder = NOTE_NOT_EXPIRED;
            rowData.notes.daysLeft = rowData.daysLeft;
            rowData.notes.text = $translate.instant('customerPage.daysRemaining', {
              count: rowData.daysLeft
            });
          } else if (rowData.isTrial && rowData.status === 'ACTIVE' && rowData.daysLeft === 0) {
            rowData.notes.sortOrder = NOTE_EXPIRE_TODAY;
            rowData.notes.daysLeft = 0;
            rowData.notes.text = $translate.instant('customerPage.expiringToday');
          } else if (rowData.status === 'ACTIVE' && rowData.daysLeft < 0) {
            rowData.notes.sortOrder = NOTE_EXPIRED;
            rowData.notes.daysLeft = -1;
            rowData.notes.text = $translate.instant('customerPage.expired');
          } else {
            rowData.notes.sortOrder = NOTE_NO_LICENSE;
            rowData.notes.text = $translate.instant('customerPage.licenseInfoNotAvailable');
          }
        } else {
          rowData.notes.sortOrder = NOTE_NO_LICENSE;
          rowData.notes.text = $translate.instant('customerPage.licenseInfoNotAvailable');
        }
      }

      function notesSort(a, b) {
        if (a.sortOrder === NOTE_NOT_EXPIRED && b.sortOrder === NOTE_NOT_EXPIRED) {
          return a.daysLeft - b.daysLeft;
        } else {
          return a.sortOrder - b.sortOrder;
        }
      }

      $scope.showCustomerDetails = function (customer) {
        $scope.currentTrial = customer;
        $state.go('customer-overview', {
          currentCustomer: customer
        });
      };

      $scope.sort = {
        by: 'customerName',
        order: 'ascending'
      };

      $scope.exportBtn = {
        disabled: true
      };

      $scope.$on('ngGridEventScroll', function () {
        if ($scope.load) {
          $scope.currentDataPosition++;
          $scope.load = false;
          getTrialsList($scope.currentDataPosition * Config.usersperpage + 1);
        }
      });

      $scope.filterList = function (filterBy) {
        $scope.filter = filterBy;
        $scope.trialsList = filterBy === 'ALL' ? $scope.trialsList : $scope.activeList;
      };

      $scope.setFilter = function (filter) {
        $scope.activeFilter = filter;
        if (filter === 'trials') {
          $scope.gridData = $scope.trialsList;
        } else if (filter === 'all') {
          $scope.gridData = $scope.managedOrgsList;
        }
      };

      function getLicense(licenses, licenseTypeField) {
        var offerNames;
        if (licenseTypeField === 'messaging') {
          offerNames = ['MS'];
        } else if (licenseTypeField === 'conferencing') {
          offerNames = ['MC', 'CF', 'EE', 'TC', 'SC'];
        } else if (licenseTypeField === 'communications') {
          offerNames = ['CO'];
        }

        if (angular.isDefined(licenses) && angular.isDefined(licenses.length)) {
          for (var i = 0; i < licenses.length; i++) {
            for (var j = 0; j < offerNames.length; j++) {
              if (licenses[i].offerName === offerNames[j]) {
                return licenses[i];
              }
            }
          }
        }
        return {};
      }

      $scope.isLicenseInfoAvailable = function (licenses) {
        return angular.isArray(licenses) && licenses.length > 0;
      };

      function isLicenseATrial(license) {
        return license && license.isTrial === true;
      }

      function isLicenseActive(license) {
        return license && license.isTrial === false;
      }

      function isLicenseFree(license) {
        return angular.isUndefined(license.isTrial);
      }

      var getLicenseObj = function (rowData, licenseTypeField) {
        var license = null;
        if (licenseTypeField === 'messaging') {
          license = rowData.messaging;
        } else if (licenseTypeField === 'conferencing') {
          license = rowData.conferencing;
        } else if (licenseTypeField === 'communications') {
          license = rowData.communications;
        }
        return license;
      };

      $scope.isLicenseTypeATrial = function (rowData, licenseTypeField) {
        return isLicenseATrial(getLicenseObj(rowData, licenseTypeField));
      };

      $scope.isLicenseTypeActive = function (rowData, licenseTypeField) {
        return isLicenseActive(getLicenseObj(rowData, licenseTypeField));
      };

      $scope.isLicenseTypeFree = function (rowData, licenseTypeField) {
        return isLicenseFree(getLicenseObj(rowData, licenseTypeField));
      };

      if ($state.current.name === "partnercustomers.list") {
        LogMetricsService.logMetrics('Partner in customers page', LogMetricsService.getEventType('partnerCustomersPage'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
      }
    }
  ]);
