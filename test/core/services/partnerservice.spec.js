'use strict';

describe('Partner Service', function () {
  beforeEach(module('Core'));

  var $httpBackend, $rootScope, PartnerService, Authinfo, Config;

  var testData;

  beforeEach(function () {
    module(function ($provide) {
      Authinfo = {
        getOrgId: function () {
          return '12345';
        }
      };

      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(function (_$httpBackend_, _$rootScope_, _PartnerService_, _Config_, _Authinfo_) {
    $httpBackend = _$httpBackend_;
    PartnerService = _PartnerService_;
    Config = _Config_;
    Authinfo = _Authinfo_;
    $rootScope = _$rootScope_;

    testData = getJSONFixture('core/json/partner/partnerservice.json');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should successfully match the values of all the properties in customerStatus', function () {
    expect(PartnerService.customerStatus.FREE).toBe(0);
    expect(PartnerService.customerStatus.TRIAL).toBe(1);
    expect(PartnerService.customerStatus.ACTIVE).toBe(2);
    expect(PartnerService.customerStatus.CANCELED).toBe(99);
    expect(PartnerService.customerStatus.NO_LICENSE).toBe(-1);
    expect(PartnerService.customerStatus.NOTE_EXPIRED).toBe(0);
    expect(PartnerService.customerStatus.NOTE_EXPIRE_TODAY).toBe(0);
    expect(PartnerService.customerStatus.NOTE_NO_LICENSE).toBe(0);
    expect(PartnerService.customerStatus.NOTE_CANCELED).toBe(0);
    expect(PartnerService.customerStatus.NOTE_NOT_EXPIRED).toBe(99);
  });

  it('should successfully return an array of 3 customers from calling getTrialsList', function () {
    $httpBackend.whenGET(PartnerService.trialsUrl).respond(testData.trialsResponse.status, testData.trialsResponse.data);

    PartnerService.getTrialsList(function (data, status) {
      expect(status).toBe(200);
      expect(data.trials.length).toBe(3);
      expect(data.trials).toEqual(testData.trialsResponse.data.trials);
    });

    $httpBackend.flush();
  });

  it('should successfully return an array of 5 customers from calling getManagedOrgsList', function () {
    $httpBackend.whenGET(PartnerService.managedOrgsUrl).respond(testData.managedOrgsResponse.status, testData.managedOrgsResponse.data);

    PartnerService.getManagedOrgsList(function (data, status) {
      expect(status).toBe(200);
      expect(data.organizations.length).toBe(5);
      expect(data.organizations).toEqual(testData.managedOrgsResponse.data.organizations);
    });

    $httpBackend.flush();
  });

  it('should successfully return a boolean on whether or not a license is a trial license from calling isLicenseATrial', function () {
    expect(PartnerService.isLicenseATrial(testData.licenses[0])).toBe(true);
    expect(PartnerService.isLicenseATrial(testData.licenses[3])).toBe(false);
    expect(PartnerService.isLicenseATrial(testData.licenses[4])).toBe(false);
  });

  it('should successfully return a boolean on whether or not a license is an active license from calling isLicenseActive', function () {
    expect(PartnerService.isLicenseActive(testData.licenses[0])).toBe(false);
    expect(PartnerService.isLicenseActive(testData.licenses[3])).toBe(false);
    expect(PartnerService.isLicenseActive(testData.licenses[4])).toBe(true);
  });

  it('should successfully return a boolean on whether or not a license is a free license from calling isLicenseFree', function () {
    expect(PartnerService.isLicenseFree(testData.licenses[0])).toBe(false);
    expect(PartnerService.isLicenseFree(testData.licenses[3])).toBe(true);
    expect(PartnerService.isLicenseFree(testData.licenses[4])).toBe(false);
  });

  it('should successfully return the corresponding license object or an empty object from calling getLicense', function () {
    expect(PartnerService.getLicense(testData.licenses, "messaging")).toEqual(testData.licenses[0]);
    expect(PartnerService.getLicense(testData.licenses, "conferencing")).toEqual(testData.licenses[1]);
    expect(PartnerService.getLicense(testData.licenses, "communications")).toEqual(testData.licenses[2]);
  });

  it('should successfully return a boolean on whether or not a license is available from calling isLicenseInfoAvailable', function () {
    var licenses = [];
    expect(PartnerService.isLicenseInfoAvailable(licenses)).toBe(false);
    expect(PartnerService.isLicenseInfoAvailable(testData.licenses)).toBe(true);
  });

  it('should successfully add sortOrder property to license from calling setServiceSortOrder', function () {
    var licenses = [];
    PartnerService.setServiceSortOrder(licenses);
    expect(licenses.sortOrder).toBe(PartnerService.customerStatus.NO_LICENSE);

    // Status is "ACTIVE".
    var customerActive = testData.licenses[3];
    PartnerService.setServiceSortOrder(customerActive);
    expect(customerActive.sortOrder).toBe(PartnerService.customerStatus.FREE);

    // Status is "TRIAL".
    var customerTrial = testData.licenses[0];
    PartnerService.setServiceSortOrder(customerTrial);
    expect(customerTrial.sortOrder).toBe(PartnerService.customerStatus.TRIAL);

    // Status is "ACTIVE"
    var customerFree = testData.licenses[4];
    PartnerService.setServiceSortOrder(customerFree);
    expect(customerFree.sortOrder).toBe(PartnerService.customerStatus.ACTIVE);

    // Status is "CANCELED"
    var customerCanceled = testData.licenses[5];
    PartnerService.setServiceSortOrder(customerCanceled);
    expect(customerCanceled.sortOrder).toBe(PartnerService.customerStatus.CANCELED);
  });

  it('should successfully add notes property to customer from calling setNotesSortOrder', function () {
    // Customer's status and daysLeft properties are "ACTIVE" and 45.
    var customerActive = testData.customers[0];
    PartnerService.setNotesSortOrder(customerActive);
    expect(customerActive.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_NOT_EXPIRED);
    expect(customerActive.notes.daysLeft).toBe(45);
    expect(customerActive.notes.text).toBe('customerPage.daysRemaining');

    // Customer's isTrial, status, and daysLeft properties are true, "ACTIVE", and 0.
    var customerExpireToday = testData.customers[1];
    PartnerService.setNotesSortOrder(customerExpireToday);
    expect(customerExpireToday.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_EXPIRE_TODAY);
    expect(customerExpireToday.notes.daysLeft).toBe(0);
    expect(customerExpireToday.notes.text).toBe('customerPage.expiringToday');

    // Customer's status and daysLeft properties are "ACTIVE" and -30
    var customerExpired = testData.customers[2];
    PartnerService.setNotesSortOrder(customerExpired);
    expect(customerExpired.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_EXPIRED);
    expect(customerExpired.notes.daysLeft).toBe(-1);
    expect(customerExpired.notes.text).toBe('customerPage.expired');

    // Customer's status property is "PENDING"
    var customerNoLicense = testData.customers[3];
    PartnerService.setNotesSortOrder(customerNoLicense);
    expect(customerNoLicense.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_NO_LICENSE);
    expect(customerNoLicense.notes.text).toBe('customerPage.licenseInfoNotAvailable');

    // Customer does not have a licenseList property
    customerNoLicense = testData.customers[4];
    PartnerService.setNotesSortOrder(customerNoLicense);
    expect(customerNoLicense.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_NO_LICENSE);
    expect(customerNoLicense.notes.text).toBe('customerPage.licenseInfoNotAvailable');

    // Customer status property is "CANCELED"
    var customerCanceled = testData.customers[5];
    PartnerService.setNotesSortOrder(customerCanceled);
    expect(customerCanceled.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_CANCELED);
    expect(customerCanceled.notes.text).toBe('customerPage.suspended');
  });

  it('should successfully return an array of customers with additional properties from calling loadRetrievedDataToList', function () {
    var returnLists = [];
    returnLists = PartnerService.loadRetrievedDataToList(testData.managedOrgsResponse.data.organizations, true);
    // Five customers, three active, two expired
    expect(returnLists[0].length).toBe(5);
    expect(returnLists[1].length).toBe(2);
    expect(returnLists[2].length).toBe(3);

    // Two licenses converted to License List. First license has four entitlements
    expect(returnLists[0][0].licenseList.length).toBe(2);
    expect(returnLists[0][0].licenseList[0].features.length).toBe(4);
    expect(returnLists[0][0].licenseList[0].features).toEqual(testData.managedOrgsResponse.data.organizations[0].licenses[0].features);

    // Verify conferencing, messaging and communications objects are created
    expect(returnLists[1][1].conferencing.features.length).toBe(3);
    expect(returnLists[1][1].messaging.features.length).toBe(4);
    expect(returnLists[1][1].communications.sortOrder).toBe(PartnerService.customerStatus.FREE);

    // Verify notes object is created by checking value of sort order
    expect(returnLists[0][3].notes.sortOrder).toBe(PartnerService.customerStatus.FREE);

    // Verify sort order is set is added to license list
    expect(returnLists[0][2].licenseList[1].sortOrder).toBe(PartnerService.customerStatus.TRIAL);
  });

  it('should successfully return an array of customers from calling exportCSV', function () {
    $httpBackend.whenGET(PartnerService.managedOrgsUrl).respond(testData.managedOrgsResponse.status, testData.managedOrgsResponse.data);

    var promise = PartnerService.exportCSV();
    promise.then(function (customers) {
      expect(customers).toEqual(testData.exportCSVResult);
    });

    $httpBackend.flush();
  });
});
