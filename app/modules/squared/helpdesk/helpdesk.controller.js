require('./helpdesk.scss');

(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskController(HelpdeskSplunkReporterService, $q, HelpdeskService, $translate, $scope, $state, $modal, HelpdeskSearchHistoryService, HelpdeskHuronService, LicenseService, Config, $window, Authinfo) {
    $scope.$on('$viewContentLoaded', function () {
      setSearchFieldFocus();
      $window.document.title = $translate.instant("helpdesk.browserTabHeaderTitle");
    });
    var vm = this;
    vm.search = search;
    vm.searchResultsPageSize = 5;
    vm.searchResultsLimit = 20;
    vm.initSearchWithOrgFilter = initSearchWithOrgFilter;
    vm.initSearchWithoutOrgFilter = initSearchWithoutOrgFilter;
    vm.searchingForUsers = false;
    vm.searchingForOrgs = false;
    vm.searchingForOrders = false;
    vm.searchingForDevices = false;
    vm.lookingUpOrgFilter = false;
    vm.searchString = '';
    vm.keyPressHandler = keyPressHandler;
    vm.showMoreResults = showMoreResults;
    vm.showDeviceResultPane = showDeviceResultPane;
    vm.showUsersResultPane = showUsersResultPane;
    vm.showOrgsResultPane = showOrgsResultPane;
    vm.showOrdersResultPane = showOrdersResultPane;
    vm.setCurrentSearch = setCurrentSearch;
    vm.showSearchHelp = showSearchHelp;
    vm.isCustomerHelpDesk = !Authinfo.isInDelegatedAdministrationOrg();
    vm.orderNumberSize = 8;
    vm.isOrderSearchEnabled = false;
    vm.isOrderSearchEnabled = Authinfo.isCisco() || Authinfo.isCiscoMock();

    $scope.$on('helpdeskLoadSearchEvent', function (event, args) {
      var search = args.message;
      setCurrentSearch(search);
      HelpdeskSplunkReporterService.reportOperation(HelpdeskSplunkReporterService.SEARCH_HISTORY);
    });

    function showSearchHelp() {
      var searchHelpUrl = "modules/squared/helpdesk/helpdesk-search-help-dialog.html";
      var searchHelpMobileUrl = "modules/squared/helpdesk/helpdesk-search-help-dialog-mobile.html";
      var isSearchOrderEnabled = vm.isOrderSearchEnabled;
      $modal.open({
        templateUrl: HelpdeskService.checkIfMobile() ? searchHelpMobileUrl : searchHelpUrl,
        controller: function () {
          var vm = this;
          vm.isCustomerHelpDesk = !Authinfo.isInDelegatedAdministrationOrg();
          vm.isOrderSearchEnabled = isSearchOrderEnabled;
        },
        controllerAs: 'searchHelpModalCtrl'
      });
      HelpdeskSplunkReporterService.reportOperation(HelpdeskSplunkReporterService.SEARCH_HELP);
    }

    function setCurrentSearch(search) {
      _.assign(vm.currentSearch, search);
      vm.searchString = search.searchString;
      HelpdeskService.findAndResolveOrgsForUserResults(
        vm.currentSearch.userSearchResults,
        vm.currentSearch.orgFilter,
        vm.currentSearch.userLimit);
      HelpdeskHuronService.setOwnerAndDeviceDetails(_.take(vm.currentSearch.deviceSearchResults, vm.currentSearch.deviceLimit));
      $state.go('helpdesk.search');
      setSearchFieldFocus();
    }

    vm.currentSearch = {
      searchString: '',
      userSearchResults: null,
      orgSearchResults: null,
      orderSearchResults: null,
      deviceSearchResults: null,
      userSearchFailure: null,
      orgSearchFailure: null,
      orderSearchFailure: null,
      deviceSearchFailure: null,
      orgFilter: vm.isCustomerHelpDesk ? {
        id: Authinfo.getOrgId(),
        displayName: Authinfo.getOrgName()
      } : null,
      orgLimit: vm.searchResultsPageSize,
      userLimit: vm.searchResultsPageSize,
      deviceLimit: vm.searchResultsPageSize,
      orderLimit: vm.searchResultsPageSize,
      initSearch: function (searchString) {
        this.searchString = searchString;
        this.userSearchResults = null;
        this.orgSearchResults = null;
        this.orderSearchResults = null;
        this.deviceSearchResults = null;
        this.userSearchFailure = null;
        this.orgSearchFailure = null;
        this.orderSearchFailure = null;
        this.deviceSearchFailure = null;
        this.orgLimit = vm.searchResultsPageSize;
        this.userLimit = vm.searchResultsPageSize;
        this.deviceLimit = vm.searchResultsPageSize;
        this.orderLimit = vm.searchResultsPageSize;
        setSearchFieldFocus();
      },
      clear: function () {
        this.initSearch('');
        if (!vm.isCustomerHelpDesk) {
          this.orgFilter = null;
        }
      }
    };

    if (vm.isCustomerHelpDesk) {
      initSearchWithOrgFilter(vm.currentSearch.orgFilter);
    }

    function search() {
      if (!vm.searchString) return;
      if (HelpdeskService.noOutstandingRequests()) {
        doSearch();
      } else {
        HelpdeskService.cancelAllRequests().then(doSearch);
      }
    }

    function doSearch() {
      var startTime = moment();
      vm.currentSearch.initSearch(vm.searchString);
      var orgFilterId = vm.currentSearch.orgFilter ? vm.currentSearch.orgFilter.id : null;
      var promises = [];
      promises.push(searchUsers(vm.searchString, orgFilterId));
      if (!orgFilterId) {
        promises.push(searchOrgs(vm.searchString));
        if (vm.isOrderSearchEnabled) {
          promises.push(searchOrders(vm.searchString));
        }
      } else {
        vm.isOrderSearchEnabled = false;
        promises = promises.concat(searchDevices(vm.searchString, vm.currentSearch.orgFilter));
      }

      $q.all(promises).then(function (res) {
        reportSearchSummary(vm.searchString, res, startTime, orgFilterId);
      });
    }

    function searchUsers(searchString, orgId) {
      var searchDone = $q.defer();
      if (searchString.length >= 3) {
        vm.searchingForUsers = true;
        HelpdeskService.searchUsers(searchString, orgId, vm.searchResultsLimit, null, true).then(function (res) {
          vm.currentSearch.userSearchResults = res;
          vm.currentSearch.userSearchFailure = null;
          vm.searchingForUsers = false;
          HelpdeskService.findAndResolveOrgsForUserResults(
            vm.currentSearch.userSearchResults,
            vm.currentSearch.orgFilter,
            vm.currentSearch.userLimit);
          HelpdeskSearchHistoryService.saveSearch(vm.currentSearch);
          vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches();
        }, function (err) {
          vm.searchingForUsers = false;
          vm.currentSearch.userSearchResults = null;
          if (err.status === 400) {
            vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.badUserSearchInput');
          } else if (err.cancelled === true || err.timedout === true) {
            vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.cancelled');
          } else {
            vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.unexpectedError');
          }
        }).finally(function () {
          searchDone.resolve(stats(HelpdeskSplunkReporterService.USER_SEARCH, vm.currentSearch.userSearchFailure || vm.currentSearch.userSearchResults));
        });
      } else {
        vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.badUserSearchInput');
        searchDone.resolve(stats(HelpdeskSplunkReporterService.USER_SEARCH, vm.currentSearch.userSearchFailure));
      }
      return searchDone.promise;
    }

    function searchOrgs(searchString) {
      var searchDone = $q.defer();

      if (searchString.length >= 3) {
        vm.searchingForOrgs = true;
        HelpdeskService.searchOrgs(searchString, vm.searchResultsLimit).then(function (res) {
          vm.currentSearch.orgSearchResults = res;
          vm.currentSearch.orgSearchFailure = null;
          vm.searchingForOrgs = false;
          HelpdeskSearchHistoryService.saveSearch(vm.currentSearch);
          vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches();
        }, function (err) {
          vm.searchingForOrgs = false;
          vm.currentSearch.orgSearchResults = null;
          vm.currentSearch.orgSearchFailure = null;
          if (err.status === 400) {
            var message = _.get(err.data, "message");
            if (message && message.indexOf("Search phrase is too generic" != -1)) {
              vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.tooManySearchResults');
            } else {
              vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.badOrgSearchInput');
            }
          } else if (err.cancelled === true || err.timedout === true) {
            vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.cancelled');
          } else {
            vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.unexpectedError');
          }
        }).finally(function () {
          searchDone.resolve(stats(HelpdeskSplunkReporterService.ORG_SEARCH, vm.currentSearch.orgSearchFailure || vm.currentSearch.orgSearchResults));
        });
      } else {
        vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.badOrgSearchInput');
        searchDone.resolve(stats(HelpdeskSplunkReporterService.ORG_SEARCH, vm.currentSearch.orgSearchFailure));
      }
      return searchDone.promise;
    }

    function searchDevices(searchString, org) {
      var promises = [];
      var orgIsEntitledToCloudBerry = LicenseService.orgIsEntitledTo(org, Config.entitlements.room_system);
      var orgIsEntitledToHuron = LicenseService.orgIsEntitledTo(org, Config.entitlements.huron);
      vm.searchingForDevices = orgIsEntitledToCloudBerry || orgIsEntitledToHuron;
      if (!(orgIsEntitledToCloudBerry || orgIsEntitledToHuron)) {
        vm.currentSearch.deviceSearchFailure = $translate.instant(vm.isCustomerHelpDesk ? 'helpdesk.noDeviceEntitlementsCustomerOrg' : 'helpdesk.noDeviceEntitlements');
      }
      if (orgIsEntitledToCloudBerry) {
        promises.push(searchForCloudberryDevices(searchString, org));
      }
      if (orgIsEntitledToHuron) {
        promises = promises.concat(searchForHuronDevices(searchString, org));
      }
      return promises;
    }

    function searchForCloudberryDevices(searchString, org) {
      var searchDone = $q.defer();
      vm.searchingForCloudberryDevices = true;
      HelpdeskService.searchCloudberryDevices(searchString, org.id, vm.searchResultsLimit).then(function (res) {
        if (vm.currentSearch.deviceSearchResults) {
          res = vm.currentSearch.deviceSearchResults.concat(res);
        }
        vm.currentSearch.deviceSearchResults = _.sortBy(res, function (device) {
          return device.displayName ? device.displayName.toLowerCase() : '';
        });
        setOrgOnDeviceSearchResults(vm.currentSearch.deviceSearchResults);
        HelpdeskSearchHistoryService.saveSearch(vm.currentSearch);
        vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches();
      }, function () {
        vm.currentSearch.deviceSearchFailure = $translate.instant('helpdesk.unexpectedError');
      }).finally(function () {
        vm.searchingForCloudberryDevices = false;
        vm.searchingForDevices = vm.searchingForHuronDevices || vm.searchingForHuronDevicesMatchingNumber;
        searchDone.resolve(stats(HelpdeskSplunkReporterService.DEVICE_SEARCH_CLOUDBERRY, vm.currentSearch.deviceSearchResults || vm.currentSearch.deviceSearchFailure));
      });
      return searchDone.promise;
    }

    function searchForHuronDevices(searchString, org) {
      var searchDone = $q.defer();

      vm.searchingForHuronDevices = true;
      HelpdeskHuronService.searchDevices(searchString, org.id, vm.searchResultsLimit).then(function (res) {
        if (vm.currentSearch.deviceSearchResults) {
          res = vm.currentSearch.deviceSearchResults.concat(res);
        }
        vm.currentSearch.deviceSearchResults = _.sortBy(res, function (device) {
          return device.displayName ? device.displayName.toLowerCase() : '';
        });
        setOrgOnDeviceSearchResults(vm.currentSearch.deviceSearchResults);
        HelpdeskHuronService.setOwnerAndDeviceDetails(_.take(vm.currentSearch.deviceSearchResults, vm.currentSearch.deviceLimit));
        HelpdeskSearchHistoryService.saveSearch(vm.currentSearch);
        vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches();
      }, function (err) {
        if (err.status === 404) {
          vm.currentSearch.deviceSearchFailure = $translate.instant('helpdesk.huronNotActivated');
        } else {
          vm.currentSearch.deviceSearchFailure = $translate.instant('helpdesk.unexpectedError');
        }
      }).finally(function () {
        vm.searchingForHuronDevices = false;
        vm.searchingForDevices = vm.searchingForCloudberryDevices || vm.searchingForHuronDevicesMatchingNumber;
        searchDone.resolve(stats(HelpdeskSplunkReporterService.DEVICE_SEARCH_HURON_NUMBER, vm.currentSearch.deviceSearchResults || vm.currentSearch.deviceSearchFailure));
      });

      var search2Done = $q.defer();
      vm.searchingForHuronDevicesMatchingNumber = true;
      HelpdeskHuronService.findDevicesMatchingNumber(searchString, org.id, vm.searchResultsLimit).then(function (res) {
        if (vm.currentSearch.deviceSearchResults) {
          res = vm.currentSearch.deviceSearchResults.concat(res);
        }
        vm.currentSearch.deviceSearchResults = _.sortBy(res, function (device) {
          return device.displayName ? device.displayName.toLowerCase() : '';
        });
        setOrgOnDeviceSearchResults(vm.currentSearch.deviceSearchResults);
        HelpdeskHuronService.setOwnerAndDeviceDetails(_.take(vm.currentSearch.deviceSearchResults, vm.currentSearch.deviceLimit));
        HelpdeskSearchHistoryService.saveSearch(vm.currentSearch);
        vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches();
      }, function (err) {
        if (err.status === 404) {
          vm.currentSearch.deviceSearchFailure = $translate.instant('helpdesk.huronNotActivated');
        } else {
          vm.currentSearch.deviceSearchFailure = $translate.instant('helpdesk.unexpectedError');
        }
      }).finally(function () {
        vm.searchingForHuronDevicesMatchingNumber = false;
        vm.searchingForDevices = vm.searchingForCloudberryDevices || vm.searchingForHuronDevices;
        search2Done.resolve(stats(HelpdeskSplunkReporterService.DEVICE_SEARCH_HURON, vm.currentSearch.deviceSearchResults || vm.currentSearch.deviceSearchFailure));
      });
      return [searchDone.promise, search2Done.promise];
    }

    function searchOrders(searchString) {
      var searchDone = $q.defer();
      if (isValidOrderEntry(searchString)) {
        vm.searchingForOrders = true;
        HelpdeskService.searchOrders(searchString).then(function (res) {
          var order = [];
          var found = _.find(res, function (el) { return el.orderStatus === "PROVISIONED"; });
          if (!_.isUndefined(found)) {
            order.push(found);
          }

          if (order.length === 0) {
            vm.currentSearch.orderSearchResults = null;
            vm.currentSearch.orderSearchFailure = $translate.instant('helpdesk.noSearchHits');
          } else {
            vm.currentSearch.orderSearchResults = order;
            vm.currentSearch.orderSearchFailure = null;
          }
          vm.searchingForOrders = false;
          HelpdeskSearchHistoryService.saveSearch(vm.currentSearch);
          vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches();
        }, function (err) {
          vm.searchingForOrders = false;
          vm.currentSearch.orderSearchResults = null;
          vm.currentSearch.orderSearchFailure = null;
          if (err.status === 404) {
            var errorCode = _.get(err.data, "errorCode");
            // Compare the error code with 'Order not found' (400117)
            if (errorCode === 400117) {
              vm.currentSearch.orderSearchFailure = $translate.instant('helpdesk.noSearchHits');
            } else {
              vm.currentSearch.orderSearchFailure = $translate.instant('helpdesk.badOrderSearchInput');
            }
          } else if (err.cancelled === true || err.timedout === true) {
            vm.currentSearch.orderSearchFailure = $translate.instant('helpdesk.cancelled');
          } else {
            vm.currentSearch.orderSearchFailure = $translate.instant('helpdesk.unexpectedError');
          }
        }).finally(function () {
          searchDone.resolve(stats(HelpdeskSplunkReporterService.ORDER_SEARCH, vm.currentSearch.orderSearchFailure || vm.currentSearch.orderSearchResults));
        });
      } else {
        vm.searchingForOrders = false;
        vm.currentSearch.orderSearchFailure = $translate.instant('helpdesk.badOrderSearchInput');
        searchDone.resolve(stats(HelpdeskSplunkReporterService.ORDER_SEARCH, vm.currentSearch.orderSearchFailure));
      }
      return searchDone.promise;
    }

    function isValidOrderEntry(searchString) {
      // A valid order search entry should has a prefix of 'ssw' or minimum 8-digit followed by a hyphen '-'
      if (searchString.toLowerCase().indexOf("ssw") === 0) {
        return true;
      }
      var n = searchString.search('-');
      var prefix = (n === -1) ? searchString : searchString.substring(0, n);

      if (!isNaN(prefix) && prefix.length >= vm.orderNumberSize) {
        return true;
      }
      return false;
    }

    function initSearchWithOrgFilter(org) {
      vm.lookingUpOrgFilter = true;
      vm.searchingForDevices = false;
      vm.searchingForUsers = false;
      if (HelpdeskService.noOutstandingRequests()) {
        vm.searchString = '';
        vm.currentSearch.clear();
        HelpdeskService.getOrg(org.id).then(function (fullOrg) {
          vm.lookingUpOrgFilter = false;
          vm.currentSearch.orgFilter = fullOrg;
        }, _.noop);
      } else {
        HelpdeskService.cancelAllRequests().then(function () {
          vm.searchString = '';
          vm.currentSearch.clear();
          HelpdeskService.getOrg(org.id).then(function (fullOrg) {
            vm.lookingUpOrgFilter = false;
            vm.currentSearch.orgFilter = fullOrg;
          }, _.noop);
        });
      }
    }

    function initSearchWithoutOrgFilter() {
      vm.searchString = '';
      vm.currentSearch.clear();
    }

    function showUsersResultPane() {
      return vm.searchingForUsers || vm.currentSearch.userSearchResults || vm.currentSearch.userSearchFailure;
    }

    function showOrgsResultPane() {
      return vm.searchingForOrgs || vm.currentSearch.orgSearchResults || vm.currentSearch.orgSearchFailure;
    }

    function showOrdersResultPane() {
      return vm.searchingForOrders || vm.currentSearch.orderSearchResults || vm.currentSearch.orderSearchFailure;
    }

    function showDeviceResultPane() {
      return vm.currentSearch.orgFilter && (vm.searchingForDevices || vm.currentSearch.deviceSearchResults || vm.currentSearch.deviceSearchFailure);
    }

    function showMoreResults(type) {
      switch (type) {
        case 'user':
          vm.currentSearch.userLimit += vm.searchResultsPageSize;
          HelpdeskService.findAndResolveOrgsForUserResults(
          vm.currentSearch.userSearchResults,
          vm.currentSearch.orgFilter,
          vm.currentSearch.userLimit);
          break;
        case 'org':
          vm.currentSearch.orgLimit += vm.searchResultsPageSize;
          break;
        case 'order':
          vm.currentSearch.orderLimit += vm.searchResultsPageSize;
          break;
        case 'device':
          vm.currentSearch.deviceLimit += vm.searchResultsPageSize;
          HelpdeskHuronService.setOwnerAndDeviceDetails(_.take(vm.currentSearch.deviceSearchResults, vm.currentSearch.deviceLimit));
          break;
      }
    }

    function setOrgOnDeviceSearchResults(deviceSearchResults) {
      _.each(deviceSearchResults, function (device) {
        device.organization = {
          id: vm.currentSearch.orgFilter.id,
          displayName: vm.currentSearch.orgFilter.displayName
        };
      });
    }

    function keyPressHandler(event) {
      var LEFT_ARROW = 37;
      var UP_ARROW = 38;
      var RIGHT_ARROW = 39;
      var DOWN_ARROW = 40;
      var ESC = 27;
      var ENTER = 13;
      var S = 83;

      var activeElement = angular.element($window.document.activeElement);
      var inputFieldHasFocus = activeElement[0]["id"] === "searchInput";
      if (inputFieldHasFocus && !(event.keyCode === 27 || event.keyCode === 13)) {
        return; // if not escape and enter, nothing to do
      }
      var activeTabIndex = activeElement[0]["tabIndex"];
      var newTabIndex = -1;

      switch (event.keyCode) {
        case LEFT_ARROW:
          newTabIndex = activeTabIndex - 1;
          break;

        case UP_ARROW:
          newTabIndex = activeTabIndex - 10;
          break;

        case RIGHT_ARROW:
          newTabIndex = activeTabIndex + 1;
          break;

        case DOWN_ARROW:
          newTabIndex = activeTabIndex + 10;
          break;

        case ESC:
          if (inputFieldHasFocus) {
            initSearchWithoutOrgFilter();
          } else {
            angular.element('#searchInput').focus().select();
            newTabIndex = -1;
          }
          break;

        case ENTER:
          if (!inputFieldHasFocus) {
            activeElement.click();
          }
          break;

        case S:
          var orgLink = JSON.parse(activeElement.find("a")[0]["name"]);
        // TODO: Avoid throwing console error when element not found !
          if (orgLink) {
            initSearchWithOrgFilter(orgLink);
          }
          break;
      }

      if (newTabIndex != -1) {
        $('[tabindex=' + newTabIndex + ']').focus();
      }
    }

    function setSearchFieldFocus() {
      if (HelpdeskService.checkIfMobile()) {
        angular.element('#searchInput').blur();
      } else {
        angular.element('#searchInput').focus();
      }
    }

    function stats(searchType, details) {
      return {
        "searchType": searchType,
        "details": details
      };
    }

    function reportSearchSummary(searchString, res, startTime, orgId) {
      HelpdeskSplunkReporterService.reportStats(searchString, res, startTime, orgId);
    }

  }
  angular
    .module('Squared')
    .controller('HelpdeskController', HelpdeskController);
}());
