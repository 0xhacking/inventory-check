(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerListCtrl', CustomerListCtrl);

  /* @ngInject */
  function CustomerListCtrl($q, $scope, Config, Authinfo, $stateParams, $translate, $state, $templateCache, PartnerService, PstnSetupService, $window, TrialService, Orgservice, Log, Notification, NumberSearchServiceV2) {
    $scope.isCustomerPartner = Authinfo.isCustomerPartner ? true : false;
    $scope.activeBadge = false;

    $scope.setFilter = setFilter;
    $scope.openAddTrialModal = openAddTrialModal;
    $scope.openEditTrialModal = openEditTrialModal;
    $scope.getTrialsList = getTrialsList;
    $scope.partnerClicked = partnerClicked;
    $scope.isPartnerOrg = isPartnerOrg;
    $scope.isLicenseTypeATrial = isLicenseTypeATrial;
    $scope.isLicenseTypeActive = isLicenseTypeActive;
    $scope.isLicenseTypeFree = isLicenseTypeFree;
    $scope.isLicenseInfoAvailable = isLicenseInfoAvailable;
    $scope.closeActionsDropdown = closeActionsDropdown;
    $scope.setTrial = setTrial;
    $scope.showCustomerDetails = showCustomerDetails;
    $scope.addNumbers = addNumbers;

    // expecting this guy to be unset on init, and set every time after
    // check resetLists fn to see how its being used
    $scope.activeFilter = 'all';

    // for testing purposes
    $scope._helpers = {
      serviceSort: serviceSort,
      sortByDays: sortByDays,
      sortByName: sortByName,
      partnerAtTopSort: partnerAtTopSort,
      setNotesTextOrder: setNotesTextOrder,
      notesSort: notesSort,
      resetLists: resetLists,
      launchCustomerPortal: launchCustomerPortal,
      getLicenseObj: getLicenseObj,
    };

    var actionTemplate = $templateCache.get('modules/core/customers/customerList/grid/actionColumn.tpl.html');
    var nameTemplate = $templateCache.get('modules/core/customers/customerList/grid/nameColumn.tpl.html');
    var serviceTemplate = $templateCache.get('modules/core/customers/customerList/grid/serviceColumn.tpl.html');
    var noteTemplate = $templateCache.get('modules/core/customers/customerList/grid/noteColumn.tpl.html');

    $scope.isOrgSetup = isOrgSetup;
    $scope.isOwnOrg = isOwnOrg;

    function isOrgSetup(customer) {
      return _.every(customer.unmodifiedLicenses, {
        status: 'ACTIVE'
      });
    }

    function isOwnOrg(customer) {
      return customer.customerName === Authinfo.getOrgName();
    }

    $scope.gridOptions = {
      data: 'gridData',
      multiSelect: false,
      rowHeight: 44,
      enableRowHeaderSelection: false,
      enableColumnMenus: false,
      enableColumnResizing: true,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.showCustomerDetails(row.entity);
        });
        gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          if ($scope.load) {
            $scope.currentDataPosition++;
            $scope.load = false;
            // lol getTrialsList doesnt take any params...
            getTrialsList($scope.currentDataPosition * Config.usersperpage + 1);
            $scope.gridApi.infiniteScroll.dataLoaded();
          }
        });
      },
      columnDefs: [{
        field: 'customerName',
        displayName: $translate.instant('customerPage.customerNameHeader'),
        width: '25%',
        cellTemplate: nameTemplate,
        cellClass: 'ui-grid-add-column-border',
        sortingAlgorithm: partnerAtTopSort,
        sort: {
          direction: 'asc',
          priority: 0,
        },
      }, {
        field: 'messaging',
        displayName: $translate.instant('customerPage.message'),
        width: '12%',
        cellTemplate: serviceTemplate,
        headerCellClass: 'align-center',
        sortingAlgorithm: serviceSort
      }, {
        field: 'conferencing',
        displayName: $translate.instant('customerPage.meeting'),
        width: '12%',
        cellTemplate: serviceTemplate,
        headerCellClass: 'align-center',
        sortingAlgorithm: serviceSort
      }, {
        field: 'communications',
        displayName: $translate.instant('customerPage.call'),
        width: '12%',
        cellTemplate: serviceTemplate,
        headerCellClass: 'align-center',
        sortingAlgorithm: serviceSort
      }, {
        field: 'roomSystems',
        displayName: $translate.instant('customerPage.roomSystems'),
        width: '12%',
        cellTemplate: serviceTemplate,
        headerCellClass: 'align-center',
        sortingAlgorithm: serviceSort
      }, {
        field: 'notes',
        displayName: $translate.instant('customerPage.notes'),
        cellTemplate: noteTemplate,
        sortingAlgorithm: notesSort
      }, {
        field: 'action',
        displayName: $translate.instant('customerPage.actionHeader'),
        sortable: false,
        cellTemplate: actionTemplate,
        width: '95',
        cellClass: 'align-center'
      }]
    };

    init();

    function init() {
      setNotesTextOrder();
      resetLists().then(function () {
        setFilter($stateParams.filter);
      });
    }

    function serviceSort(a, b) {
      if (a.sortOrder === PartnerService.customerStatus.TRIAL && b.sortOrder === PartnerService.customerStatus.TRIAL) {
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
      var first = a.customerName || a;
      var second = b.customerName || b;
      if (first.toLowerCase() > second.toLowerCase()) {
        return 1;
      } else if (first.toLowerCase() < second.toLowerCase()) {
        return -1;
      } else {
        return 0;
      }
    }

    // Sort function to keep partner org at top
    function partnerAtTopSort(a, b) {
      var orgName = Authinfo.getOrgName();
      if (a === orgName || b === orgName) {
        return -1;
      } else {
        return sortByName(a, b);
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
          PartnerService.customerStatus.NOTE_CANCELED = index;
        } else if (text === textExpiringToday) {
          PartnerService.customerStatus.NOTE_EXPIRE_TODAY = index;
        } else if (text === textExpired) {
          PartnerService.customerStatus.NOTE_EXPIRED = index;
        } else if (text === textLicenseInfoNotAvailable) {
          PartnerService.customerStatus.NOTE_NO_LICENSE = index;
        }
      });
    }

    function notesSort(a, b) {
      if (a.sortOrder === PartnerService.customerStatus.NOTE_NOT_EXPIRED &&
        b.sortOrder === PartnerService.customerStatus.NOTE_NOT_EXPIRED) {
        return a.daysLeft - b.daysLeft;
      } else {
        return a.sortOrder - b.sortOrder;
      }
    }

    function setFilter(filter) {
      $scope.activeFilter = filter || 'all';
      if (filter === 'trials') {
        $scope.gridData = $scope.trialsList;
      } else {
        $scope.gridData = $scope.managedOrgsList;
      }
    }

    function getMyOrgDetails() {
      return $q(function (resolve, reject) {
        var accountId = Authinfo.getOrgId();
        Orgservice.getAdminOrg(function (data, status) {
          if (status === 200) {
            var myOrg = PartnerService.loadRetrievedDataToList([data], false);
            myOrg.customerName = Authinfo.getOrgName();
            myOrg.customerOrgId = Authinfo.getOrgId();

            resolve(myOrg);
          } else {
            reject('Unable to query for signed-in users org');
            Log.debug('Failed to retrieve partner org information. Status: ' + status);
          }
        }, accountId);
      });
    }

    function getManagedOrgsList() {
      $scope.showManagedOrgsRefresh = true;
      var promiselist = [PartnerService.getManagedOrgsList()];

      if (Authinfo.isPartnerAdmin()) {
        // move our org to the top of the list
        // dont know why this is here yet
        // this should be handled by a sorting fn
        promiselist.push(getMyOrgDetails());
      }

      return $q.all(promiselist)
        .catch(function (err) {
          Log.debug('Failed to retrieve managed orgs information. Status: ' + err.status);
          Notification.error('partnerHomePage.errGetTrialsQuery', {
            status: err.status
          });

          $scope.showManagedOrgsRefresh = false;
        })
        .then(function (results) {
          var managed = PartnerService.loadRetrievedDataToList(_.get(results, '[0].data.organizations', []), false);

          if (results[1]) {
            managed.unshift(results[1]);
          }

          $scope.managedOrgsList = managed;
          $scope.totalOrgs = $scope.managedOrgsList.length;

          // dont use a .finally(..) since this $q.all is returned
          // (if you .finally(..), the next `then` doesnt get called)
          $scope.showManagedOrgsRefresh = false;
        });
    }

    // WARNING: not sure if this is needed, getManagedOrgsList contains a superset of this list
    // can be filtered by `createdBy` and `license.isTrial` but we have a second endpoint that
    // may at one point in the future return something other than the subset
    function getTrialsList() {
      return PartnerService.getTrialsList()
        .catch(function (err) {
          Log.debug('Failed to retrieve trial information. Status: ' + err.status);
          Notification.error('partnerHomePage.errGetTrialsQuery', {
            status: err.status
          });
        })
        .then(function (response) {
          $scope.trialsList = PartnerService.loadRetrievedDataToList(_.get(response, 'data.trials', []), true);
          $scope.totalTrials = $scope.trialsList.length;
        });
    }

    function openAddTrialModal() {
      $state.go('trialAdd.info').then(function () {
        $state.modal.result.finally(resetLists);
      });
    }

    function openEditTrialModal() {
      TrialService.getTrial($scope.currentTrial.trialId).then(function (response) {
        $state.go('trialEdit.info', {
          currentTrial: $scope.currentTrial,
          details: response
        }).then(function () {
          $state.modal.result.finally(resetLists);
        });
      });
    }

    function resetLists() {
      return $q.all([getTrialsList(), getManagedOrgsList()]);
    }

    function launchCustomerPortal(trial) {
      var customer = trial;

      $window.open($state.href('login_swap', {
        customerOrgId: customer.customerOrgId,
        customerOrgName: customer.customerName
      }));
    }

    function isLicenseInfoAvailable(licenses) {
      return PartnerService.isLicenseInfoAvailable(licenses);
    }

    function getLicenseObj(rowData, licenseTypeField) {
      return rowData[licenseTypeField] || null;
    }

    function isLicenseTypeATrial(rowData, licenseTypeField) {
      return PartnerService.isLicenseATrial(getLicenseObj(rowData, licenseTypeField));
    }

    function isLicenseTypeActive(rowData, licenseTypeField) {
      return PartnerService.isLicenseActive(getLicenseObj(rowData, licenseTypeField));
    }

    function isLicenseTypeFree(rowData, licenseTypeField) {
      return PartnerService.isLicenseFree(getLicenseObj(rowData, licenseTypeField));
    }

    function partnerClicked(rowData) {
      $scope.activeBadge = isPartnerOrg(rowData);
    }

    function isPartnerOrg(rowData) {
      return rowData === Authinfo.getOrgId();
    }

    function setTrial(trial) {
      $scope.currentTrial = trial;
    }

    function showCustomerDetails(customer) {
      $scope.currentTrial = customer;
      $state.go('customer-overview', {
        currentCustomer: customer
      });
    }

    function closeActionsDropdown() {
      angular.element('.open').removeClass('open');
    }

    function addNumbers(org) {
      PstnSetupService.getCustomer(org.customerOrgId)
        .catch(_.partial(getExternalNumbers, org))
        .then(_.partial(goToPstnSetup, org));
    }

    function getExternalNumbers(org) {
      return NumberSearchServiceV2.get({
        customerId: org.customerOrgId,
        type: 'external'
      }).$promise.then(function (response) {
        if (_.get(response, 'numbers.length') !== 0) {
          $state.go('didadd', {
            currentOrg: org
          });
          return $q.reject(false);
        }
      });
    }

    function goToPstnSetup(org) {
      return $state.go('pstnSetup', {
        customerId: org.customerOrgId,
        customerName: org.customerName,
        customerEmail: org.customerEmail
      });
    }
  }
})();
