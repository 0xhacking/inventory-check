(function () {
  'use strict';

  angular.module('Core')
    .service('PartnerService', PartnerService);

  /* @ngInject */
  function PartnerService($http, $rootScope, $q, $translate, $filter, Config, Log, Authinfo, Auth, TrialService, UrlConfig) {

    var trialsUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials';
    var managedOrgsUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';

    var customerStatus = {
      FREE: 0,
      TRIAL: 1,
      ACTIVE: 2,
      CANCELED: 99,
      NO_LICENSE: -1,
      NOTE_EXPIRED: 0,
      NOTE_EXPIRE_TODAY: 0,
      NOTE_NO_LICENSE: 0,
      NOTE_CANCELED: 0,
      NOTE_NOT_EXPIRED: 99
    };

    var factory = {
      customerStatus: customerStatus,
      getTrialsList: getTrialsList,
      getManagedOrgsList: getManagedOrgsList,
      isLicenseATrial: isLicenseATrial,
      isLicenseActive: isLicenseActive,
      isLicenseFree: isLicenseFree,
      getLicense: getLicense,
      isLicenseInfoAvailable: isLicenseInfoAvailable,
      setServiceSortOrder: setServiceSortOrder,
      setNotesSortOrder: setNotesSortOrder,
      loadRetrievedDataToList: loadRetrievedDataToList,
      exportCSV: exportCSV,
      parseLicensesAndOffers: parseLicensesAndOffers
    };

    return factory;

    function getTrialsList() {
      return $http.get(trialsUrl);
    }

    function getManagedOrgsList() {
      return $http.get(managedOrgsUrl);
    }

    // Series of fns dont make any sense, unless isTrial = null means something...
    function isLicenseATrial(license) {
      return license && license.isTrial === true;
    }

    function isLicenseActive(license) {
      return license && license.isTrial === false;
    }

    function isLicenseFree(license) {
      return angular.isUndefined(license.isTrial);
    }
    // end series of fn's

    function getLicense(licenses, offerCode) {
      return _.find(licenses, {
        offerName: offerCode
      }) || {};
    }

    function isLicenseInfoAvailable(licenses) {
      return angular.isArray(licenses);
    }

    function setServiceSortOrder(license) {
      if (_.isEmpty(license)) {
        license.sortOrder = customerStatus.NO_LICENSE;
      } else if (license.status === 'CANCELED') {
        license.sortOrder = customerStatus.CANCELED;
      } else if (isLicenseFree(license)) {
        license.sortOrder = customerStatus.FREE;
      } else if (isLicenseATrial(license)) {
        license.sortOrder = customerStatus.TRIAL;
      } else if (isLicenseActive(license)) {
        license.sortOrder = customerStatus.ACTIVE;
      } else {
        license.sortOrder = customerStatus.NO_LICENSE;
      }
    }

    function setNotesSortOrder(rowData) {
      rowData.notes = {};
      if (isLicenseInfoAvailable(rowData.licenseList)) {
        if (rowData.status === 'CANCELED') {
          rowData.notes.sortOrder = customerStatus.NOTE_CANCELED;
          rowData.notes.text = $translate.instant('customerPage.suspended');
        } else if (rowData.status === 'ACTIVE' && rowData.daysLeft > 0) {
          rowData.notes.sortOrder = customerStatus.NOTE_NOT_EXPIRED;
          rowData.notes.daysLeft = rowData.daysLeft;
          rowData.notes.text = $translate.instant('customerPage.daysRemaining', {
            count: rowData.daysLeft
          });
        } else if (rowData.isTrial && rowData.status === 'ACTIVE' && rowData.daysLeft === 0) {
          rowData.notes.sortOrder = customerStatus.NOTE_EXPIRE_TODAY;
          rowData.notes.daysLeft = 0;
          rowData.notes.text = $translate.instant('customerPage.expiringToday');
        } else if (rowData.status === 'ACTIVE' && rowData.daysLeft < 0) {
          rowData.notes.sortOrder = customerStatus.NOTE_EXPIRED;
          rowData.notes.daysLeft = -1;
          rowData.notes.text = $translate.instant('customerPage.expired');
        } else {
          rowData.notes.sortOrder = customerStatus.NOTE_NO_LICENSE;
          rowData.notes.text = $translate.instant('customerPage.licenseInfoNotAvailable');
        }
      } else {
        rowData.notes.sortOrder = customerStatus.NOTE_NO_LICENSE;
        rowData.notes.text = $translate.instant('customerPage.licenseInfoNotAvailable');
      }
    }

    function loadRetrievedDataToList(list, isTrialData) {
      return _.map(list, function (customer) {
        return massageDataForCustomer(customer, isTrialData);
      });
    }

    function massageDataForCustomer(customer, isTrialData) {
      var edate = moment(customer.startDate).add(customer.trialPeriod, 'days').format('MMM D, YYYY');
      var dataObj = {
        trialId: customer.trialId,
        customerOrgId: customer.customerOrgId,
        customerName: customer.customerName,
        customerEmail: customer.customerEmail,
        endDate: edate,
        numUsers: customer.licenseCount,
        daysLeft: 0,
        usage: 0,
        licenses: 0,
        deviceLicenses: 0,
        licenseList: [],
        messaging: null,
        conferencing: null,
        communications: null,
        roomSystems: null,
        sparkConferencing: null,
        webexEEConferencing: null,
        webexCMR: null,
        daysUsed: 0,
        percentUsed: 0,
        duration: customer.trialPeriod,
        offer: {},
        offers: customer.offers,
        status: customer.state,
        state: customer.state,
        isAllowedToManage: true,
        isSquaredUcOffer: false,
        notes: {}
      };

      var licensesAndOffersData = parseLicensesAndOffers(customer);
      angular.extend(dataObj, licensesAndOffersData);

      dataObj.isAllowedToManage = isTrialData || customer.isAllowedToManage;
      dataObj.unmodifiedLicenses = _.cloneDeep(customer.licenses);
      dataObj.licenseList = customer.licenses;

      var daysDone = TrialService.calcDaysUsed(customer.startDate);
      dataObj.daysUsed = daysDone;
      dataObj.percentUsed = Math.round((daysDone / customer.trialPeriod) * 100);

      var daysLeft = TrialService.calcDaysLeft(customer.startDate, customer.trialPeriod);
      dataObj.daysLeft = daysLeft;
      if (isTrialData) {
        if (daysLeft < 0) {
          dataObj.status = $translate.instant('customerPage.expired');
          dataObj.state = "EXPIRED";
        }
      }

      var serviceEntry = {
        status: dataObj.status,
        daysLeft: daysLeft,
        customerName: dataObj.customerName
      };

      // havent figured out what this is doing yet...
      dataObj.messaging = initializeService(customer.licenses, Config.offerCodes.MS, serviceEntry);
      dataObj.communications = initializeService(customer.licenses, Config.offerCodes.CO, serviceEntry);
      dataObj.roomSystems = initializeService(customer.licenses, Config.offerCodes.SD, serviceEntry);
      dataObj.sparkConferencing = initializeService(customer.licenses, Config.offerCodes.CF, serviceEntry);
      dataObj.webexEEConferencing = initializeService(customer.licenses, Config.offerCodes.EE, serviceEntry);
      dataObj.webexCMR = initializeService(customer.licenses, Config.offerCodes.CMR, serviceEntry);

      // 12/17/2015 - Timothy Trinh
      // setting conferencing to sparkConferencing for now to preserve how
      // the customer list page currently works.
      dataObj.conferencing = dataObj.sparkConferencing;

      setNotesSortOrder(dataObj);
      return dataObj;
    }

    function initializeService(licenses, offerCode, serviceEntry) {
      var licensesGotten = getLicense(licenses, offerCode);
      angular.extend(licensesGotten, serviceEntry);
      setServiceSortOrder(licensesGotten);

      return licensesGotten;
    }

    function exportCSV() {
      var deferred = $q.defer();

      var customers = [];

      $rootScope.exporting = true;
      $rootScope.$broadcast('EXPORTING');

      // dont catch exception, if there was a problem, throw it
      // (this is preexisting behavior)
      return getManagedOrgsList()
        .then(function (response) {
          // data to export for CSV file customer.conferencing.features[j]
          var exportedCustomers = _.map(response.data.organizations, function (customer) {
            var exportedCustomer = {};

            exportedCustomer.customerName = customer.customerName;
            exportedCustomer.adminEmail = customer.customerEmail;
            exportedCustomer.messagingEntitlements = '';
            exportedCustomer.conferenceEntitlements = '';
            exportedCustomer.communicationsEntitlements = '';
            exportedCustomer.roomSystemsEntitlements = '';

            var messagingLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.MESSAGING
            });
            var conferenceLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.CONFERENCING
            });
            var communicationsLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.COMMUNICATION
            });
            var roomSystemsLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.SHARED_DEVICES
            });

            if (messagingLicense && angular.isArray(messagingLicense.features)) {
              exportedCustomer.messagingEntitlements = messagingLicense.features.join(' ');
            }
            if (conferenceLicense && angular.isArray(conferenceLicense.features)) {
              exportedCustomer.conferenceEntitlements = conferenceLicense.features.join(' ');
            }
            if (communicationsLicense && angular.isArray(communicationsLicense.features)) {
              exportedCustomer.communicationsEntitlements = communicationsLicense.features.join(' ');
            }
            if (roomSystemsLicense && angular.isArray(roomSystemsLicense.features)) {
              exportedCustomer.roomSystemsEntitlements = roomSystemsLicense.features.join(' ');
            }
            return exportedCustomer;
          });

          // header line for CSV file
          // 12/17/2015 - Timothy Trinh
          // Did not bother to add webex entitlements to this section because it may change.
          var header = {};
          header.customerName = $translate.instant('customerPage.csvHeaderCustomerName');
          header.adminEmail = $translate.instant('customerPage.csvHeaderAdminEmail');
          header.messagingEntitlements = $translate.instant('customerPage.csvHeaderMessagingEntitlements');
          header.conferencingEntitlements = $translate.instant('customerPage.csvHeaderConferencingEntitlements');
          header.communicationsEntitlements = $translate.instant('customerPage.csvHeaderCommunicationsEntitlements');
          header.roomSystemsEntitlements = $translate.instant('customerPage.csvHeaderRoomSystemsEntitlements');

          exportedCustomers.unshift(header);
          return exportedCustomers;
        });
    }

    function parseLicensesAndOffers(customer) {
      var partial = {
        licenses: 0,
        deviceLicenses: 0,
        isSquaredUcOffer: false,
        usage: 0,
        offer: {}
      };

      var deviceServiceText = [];
      var userServices = [];

      _.forEach(_.get(customer, 'licenses', []), function (licenseInfo) {
        if (!licenseInfo) {
          return;
        }
        switch (licenseInfo.licenseType) {
        case Config.licenseTypes.COMMUNICATION:
          partial.isSquaredUcOffer = true;
          break;
        }
      });

      for (var offer in _.get(customer, 'offers', [])) {
        var offerInfo = customer.offers[offer];
        if (!offerInfo) {
          continue;
        }

        partial.usage = offerInfo.usageCount;
        if (offerInfo.id === Config.offerTypes.roomSystems) {
          partial.deviceLicenses = offerInfo.licenseCount;
        } else {
          partial.licenses = offerInfo.licenseCount;
        }

        switch (offerInfo.id) {
        case Config.offerTypes.spark1:
        case Config.offerTypes.message:
        case Config.offerTypes.collab:
          userServices.push($translate.instant('trials.message'));
          break;
        case Config.offerTypes.call:
        case Config.offerTypes.squaredUC:
          partial.isSquaredUcOffer = true;
          userServices.push($translate.instant('trials.call'));
          break;
        case Config.offerTypes.webex:
        case Config.offerTypes.meetings:
          userServices.push($translate.instant('customerPage.EE'));
          break;
        case Config.offerTypes.meeting:
          userServices.push($translate.instant('trials.meeting'));
          break;
        case Config.offerTypes.roomSystems:
          deviceServiceText.push($translate.instant('trials.roomSystem'));
          break;
        }
      }

      partial.offer.deviceBasedServices = _.uniq(deviceServiceText).join(', ');
      partial.offer.userServices = _.uniq(userServices).join(', ');

      return partial;
    }
  }
})();
