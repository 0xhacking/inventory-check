'use strict';

describe('Controller: CustomerListCtrl', function () {
  var $httpBackend, $q, $scope, $state, Authinfo, Config, customerListToggle, HuronConfig, FeatureToggleService, Notification, Orgservice, PartnerService, TrialService;
  var $controller;

  var adminJSONFixture = getJSONFixture('core/json/organizations/adminServices.json');
  var partnerService = getJSONFixture('core/json/partner/partner.service.json');
  var managedOrgsResponse = partnerService.managedOrgsResponse;
  var trialsResponse = partnerService.trialsResponse;
  var orgId = '1';
  var orgName = 'testOrg';
  var testOrg = {
    customerOrgId: '1234-34534-afdagfg-425345-afaf',
    customerName: 'ControllerTestOrg',
    customerEmail: 'customer@cisco.com',
    daysLeft: NaN,
    communications: {
      isTrial: false,
      volume: 5
    },
    licenseList: [{
      isTrial: false,
      volume: 5,
      name: 'communications'
    }]
  };
  var numberResponse = {
    numbers: [1, 2, 3]
  };
  var noNumberResponse = {
    numbers: []
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$controller_, _$httpBackend_, _$q_, $rootScope, _$state_, _Authinfo_, _Config_, _HuronConfig_, _FeatureToggleService_, _Notification_, _Orgservice_, _PartnerService_, _TrialService_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = $rootScope.$new();
    $state = _$state_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    HuronConfig = _HuronConfig_;
    Notification = _Notification_;
    FeatureToggleService = _FeatureToggleService_;
    Orgservice = _Orgservice_;
    PartnerService = _PartnerService_;
    TrialService = _TrialService_;
    $scope.timeoutVal = 1;
    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };

    customerListToggle = false;

    spyOn($state, 'go');
    spyOn(Notification, 'error');

    spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
    spyOn(Authinfo, 'getOrgName').and.returnValue(orgName);
    spyOn(Authinfo, 'isPartnerAdmin').and.returnValue(true);

    spyOn(PartnerService, 'getManagedOrgsList').and.returnValue($q.when(managedOrgsResponse));
    spyOn(PartnerService, 'modifyManagedOrgs').and.returnValue($q.when({}));

    spyOn(Authinfo, 'isCare').and.returnValue(true);
    spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue(
      $q.when(false)
    );

    spyOn(Orgservice, 'getAdminOrg').and.callFake(function (callback) {
      callback(adminJSONFixture.getAdminOrg, 200);
    });
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(getJSONFixture('core/json/organizations/Orgservice.json').getOrg, 200);
    });

    spyOn(TrialService, 'getTrial').and.returnValue($q.when());
    spyOn(TrialService, 'getTrialsList').and.returnValue($q.when(trialsResponse));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

  }));

  function initController() {
    $controller('CustomerListCtrl', {
      $scope: $scope,
      $state: $state,
      Authinfo: Authinfo,
      Config: Config,
      customerListToggle: customerListToggle
    });

    $scope.$apply();
  }

  describe('Controller', function () {
    beforeEach(initController);
    it('should initialize', function () {
      expect($scope.activeFilter).toBe('all');
    });
  });

  describe('grid column display', function () {
    var testTrialData = {};
    beforeEach(initController);
    beforeEach(function () {
      testTrialData = {
        customerOrgId: '1234-34534-afdagfg-425345-acac',
        customerName: 'ControllerTestOrg',
        customerEmail: 'customer123@cisco.com',
        daysLeft: 50,
        numUsers: 10,
        activeUsers: 3,
        communications: {
          isTrial: true
        },
        licenses: 10,
        deviceLicenses: 5,
        licenseList: [{
          isTrial: false,
          volume: 5,
          name: 'communications'
        }]
      };
    });

    function setTestDataTrial() {
      testTrialData.daysLeft = 30;
      testTrialData.communications.isTrial = true;
    }

    function setTestDataExpired() {
      testTrialData.daysLeft = -10;
      testTrialData.communications.isTrial = true;
    }

    function setTestDataActive() {
      testTrialData.daysLeft = NaN;
      testTrialData.communications.isTrial = false;
    }

    it('should properly calculate trials past the grace period', function () {
      setTestDataExpired();
      testTrialData.daysLeft = -99;
      expect($scope.isPastGracePeriod(testTrialData)).toBe(true);
      setTestDataActive();
      expect($scope.isPastGracePeriod(testTrialData)).toBe(false);
      setTestDataTrial();
      expect($scope.isPastGracePeriod(testTrialData)).toBe(false);
    });

    it('should display N/A when trial is past grace period', function () {
      setTestDataExpired();
      testTrialData.daysLeft = -99;
      expect($scope.getLicenseCountColumnText(testTrialData)).toBe('common.notAvailable');
      expect($scope.getUserCountColumnText(testTrialData)).toBe('common.notAvailable');
    });

    it('should return the correct text for user count', function () {
      setTestDataTrial();
      expect($scope.getUserCountColumnText(testTrialData)).toBe(testTrialData.activeUsers + ' / ' + testTrialData.numUsers);
    });

    it('should return the correct account status', function () {
      setTestDataExpired();
      expect($scope.getAccountStatus(testTrialData)).toBe('expired');
      setTestDataTrial();
      expect($scope.getAccountStatus(testTrialData)).toBe('trial');
      setTestDataActive();
      expect($scope.getAccountStatus(testTrialData)).toBe('active');
    });
  });

  describe('myOrg appears first in orgList', function () {
    beforeEach(initController);

    it('if myOrg not in managedOrgsList, myOrg should be added to the top of managedOrgsList ', function () {
      expect($scope.managedOrgsList).toBeDefined();
      expect($scope.managedOrgsList[0].customerName).toBe('testOrg');
      expect($scope.managedOrgsList.length).toEqual(6);
      expect($scope.managedOrgsList[1].customerName).toBe('Atlas_Test_Trial_vt453w4p8d');
      expect($scope.totalOrgs).toBe(6);
    });

    it('if myOrg is in managedOrgsList, myOrg should not be added to the list', function () {
      var testOrgList = {
        "data": {
          "organizations": [{
            customerOrgId: '1234-34534-afdagfg-425345-afaf',
            customerName: 'ControllerTestOrg',
            customerEmail: 'customer@cisco.com',
            communications: {
              isTrial: true
            }
          }, {
            customerOrgId: '1',
            customerName: 'testOrg'
          }]
        }
      };

      PartnerService.getManagedOrgsList.and.returnValue(testOrgList);
      initController();
      expect($scope.managedOrgsList).toBeDefined();
      expect($scope.managedOrgsList.length).toEqual(2);
      expect($scope.totalOrgs).toBe(2);
    });
  });

  describe('Click setup PSTN', function () {
    beforeEach(initController);

    it('not Terminus customer and has e164 numbers, should route to DID add', function () {
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + testOrg.customerOrgId).respond(404);
      $httpBackend.expectGET(HuronConfig.getCmiV2Url() + '/customers/' + testOrg.customerOrgId + '/numbers?type=external').respond(numberResponse);
      $scope.addNumbers(testOrg);
      $httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('didadd', {
        currentOrg: testOrg
      });
    });

    it('not Terminus customer and has no e164 numbers, should route to PSTN setup', function () {
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + testOrg.customerOrgId).respond(404);
      $httpBackend.expectGET(HuronConfig.getCmiV2Url() + '/customers/' + testOrg.customerOrgId + '/numbers?type=external').respond(noNumberResponse);
      $scope.addNumbers(testOrg);
      $httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: testOrg.customerOrgId,
        customerName: testOrg.customerName,
        customerEmail: testOrg.customerEmail,
        customerCommunicationLicenseIsTrial: testOrg.communications.isTrial
      });
    });

    it('exists as Terminus customer, should route to PSTN setup', function () {
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + testOrg.customerOrgId).respond(200);
      $scope.addNumbers(testOrg);
      $httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: testOrg.customerOrgId,
        customerName: testOrg.customerName,
        customerEmail: testOrg.customerEmail,
        customerCommunicationLicenseIsTrial: testOrg.communications.isTrial
      });
    });
  });

  describe('filterAction', function () {
    beforeEach(initController);

    it('a proper query wshould call out to partnerService and trialservice', function () {
      $scope.filterAction('1234');
      expect($scope.searchStr).toBe('1234');
      //this tests that getManagedOrgsList is  called , it is called once at init , so the count is expected to be 2 here
      expect(PartnerService.getManagedOrgsList.calls.count()).toEqual(2);
      expect(PartnerService.getManagedOrgsList).toHaveBeenCalledWith('1234');
      expect(TrialService.getTrialsList.calls.count()).toEqual(2);
      expect(TrialService.getTrialsList).toHaveBeenCalledWith('1234');
    });

  });

  describe('getSubfields', function () {
    beforeEach(initController);

    it('should return the column from columnGroup for single column group', function () {
      var entry = {
        'licenseList': [{
          'licenseId': 'MS_3c4b0cda-7315-430d-b3d6-97fd5b09991b',
          'licenseType': 'MESSAGING',
        }, {
          'licenseId': 'CF_14aee12e-62f0-431b-afe0-58554d064ec3',
          'licenseType': 'CONFERENCING',
        }]
      };

      var result = $scope.getSubfields(entry, 'meeting');
      expect(result[0].columnGroup).toBe('conferencing');
    });

    it('should return the EE for 2nd webex column if there is no webex license', function () {
      var entry = {
        'licenseList': [{}]
      };

      var result = $scope.getSubfields(entry, 'meeting');
      expect(result[1].offerCode).toBe('EE');
    });

    it('should return webex with license for 2nd webex column if there is one', function () {
      var entry = {
        'licenseList': [{
          'offerName': 'MC',
          'licenseType': 'CONFERENCING',
          'status': 'ACTIVE',
        }, {
          'licenseId': 'CMR_34302adb-1cb4-4501-a6aa-69b31b7e9558_algendel01.webex.com',
          'offerName': 'CMR',
          'licenseType': 'CMR',
          'status': 'ACTIVE',
        }]
      };

      var result = $scope.getSubfields(entry, 'meeting');
      expect(result[1].offerCode).toBe('CMR');
    });
  });

  describe('customerCommunicationLicenseIsTrial flag', function () {
    beforeEach(initController);

    it('should be true if communication license is a trial.', function () {
      var org = {
        customerOrgId: '1234-34534-afdagfg-425345-afaf',
        customerName: 'ControllerTestOrg',
        customerEmail: 'customer@cisco.com',
        communications: {
          isTrial: true
        }
      };
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + org.customerOrgId).respond(200);
      $scope.addNumbers(org);
      $httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: org.customerOrgId,
        customerName: org.customerName,
        customerEmail: org.customerEmail,
        customerCommunicationLicenseIsTrial: true
      });
    });

    it('should be false if communication license is not a trial.', function () {
      var org = {
        customerOrgId: '1234-34534-afdagfg-425345-afaf',
        customerName: 'ControllerTestOrg',
        customerEmail: 'customer@cisco.com',
        communications: {
          isTrial: false
        }
      };
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + org.customerOrgId).respond(200);
      $scope.addNumbers(org);
      $httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: org.customerOrgId,
        customerName: org.customerName,
        customerEmail: org.customerEmail,
        customerCommunicationLicenseIsTrial: false
      });
    });

    it('should be true if trial data is missing.', function () {
      var org = {
        customerOrgId: '1234-34534-afdagfg-425345-afaf',
        customerName: 'ControllerTestOrg',
        customerEmail: 'customer@cisco.com'
      };
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + org.customerOrgId).respond(200);
      $scope.addNumbers(org);
      $httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: org.customerOrgId,
        customerName: org.customerName,
        customerEmail: org.customerEmail,
        customerCommunicationLicenseIsTrial: true
      });
    });

    it('should always be false if isPartner is true.', function () {
      var org = {
        customerOrgId: '1234-34534-afdagfg-425345-afaf',
        customerName: 'ControllerTestOrg',
        customerEmail: 'customer@cisco.com',
        isPartner: true,
        communications: {
          isTrial: true
        }
      };
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + org.customerOrgId).respond(200);
      $scope.addNumbers(org);
      $httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: org.customerOrgId,
        customerName: org.customerName,
        customerEmail: org.customerEmail,
        customerCommunicationLicenseIsTrial: false
      });
    });
  });

  describe('modifyManagedOrgs should be called correctly', function () {
    beforeEach(initController);

    it('should have called PartnerService.modifyManagedOrgs', function () {
      expect(testOrg.customerOrgId).toBe('1234-34534-afdagfg-425345-afaf');
      $scope.modifyManagedOrgs(testOrg.customerOrgId);
      expect(PartnerService.modifyManagedOrgs).toHaveBeenCalled();
    });
  });

  describe('atlasCareTrialsGetStatus should be called, careField should be removed from gridOptions if atlasCareTrials feature toggle is disabled', function () {
    beforeEach(initController);

    it('should have called FeatureToggleService.atlasCareTrialsGetStatus', function () {
      expect(FeatureToggleService.atlasCareTrialsGetStatus).toHaveBeenCalled();
      //care column to be removed if feature toggle is disabled
      expect($scope.gridColumns.length).toEqual(7);
    });
  });
});
