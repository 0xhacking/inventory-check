/* global installPromiseMatchers */

'use strict';

describe('OnboardCtrl: Ctrl', function () {
  var controller, $scope, $timeout, $q, $state, $stateParams, GroupService, Notification, Userservice, TelephonyInfoService, Orgservice, FeatureToggleService, DialPlanService, Authinfo, CsvDownloadService;
  var internalNumbers;
  var externalNumbers;
  var externalNumberPool;
  var externalNumberPoolMap;
  var getUserMe;
  var getMigrateUsers;
  var getMyFeatureToggles;
  var sites;
  var fusionServices;
  var headers;
  var getMessageServices;
  var getLicensesUsage;
  var getLicensesUsageSpy;
  var $controller;
  beforeEach(module('Core'));
  beforeEach(module('Hercules'));
  beforeEach(module('Huron'));
  beforeEach(module('Messenger'));

  beforeEach(inject(function (_$controller_, $rootScope, _$timeout_, _$q_, _$state_, _$stateParams_, _GroupService_, _Notification_, _Userservice_, _TelephonyInfoService_, _Orgservice_, _FeatureToggleService_, _DialPlanService_, _Authinfo_, _CsvDownloadService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $timeout = _$timeout_;
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    GroupService = _GroupService_;
    Notification = _Notification_;
    DialPlanService = _DialPlanService_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;
    TelephonyInfoService = _TelephonyInfoService_;
    FeatureToggleService = _FeatureToggleService_;
    Authinfo = _Authinfo_;
    CsvDownloadService = _CsvDownloadService_;
    var current = {
      step: {
        name: 'fakeStep'
      }
    };
    $scope.wizard = {};
    $scope.wizard.current = current;

    spyOn(GroupService, 'getGroupList').and.callFake(function (callback) {
      callback({});
    });
    spyOn($state, 'go');

    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');
    externalNumberPoolMap = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPoolMap.json');
    getUserMe = getJSONFixture('core/json/users/me.json');
    getMigrateUsers = getJSONFixture('core/json/users/migrate.json');
    getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
    sites = getJSONFixture('huron/json/settings/sites.json');
    fusionServices = getJSONFixture('core/json/authInfo/fusionServices.json');
    headers = getJSONFixture('core/json/users/headers.json');
    getMessageServices = getJSONFixture('core/json/authInfo/messagingServices.json');

    spyOn(Orgservice, 'getHybridServiceAcknowledged').and.returnValue($q.when(fusionServices));
    spyOn(CsvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return $q.when(headers);
      } else {
        return $q.when({});
      }
    });

    spyOn(Notification, 'notify');
    spyOn(Userservice, 'onboardUsers');
    spyOn(Userservice, 'bulkOnboardUsers');
    spyOn(Orgservice, 'getUnlicensedUsers');

    spyOn(TelephonyInfoService, 'getInternalNumberPool').and.returnValue(internalNumbers);
    spyOn(TelephonyInfoService, 'loadInternalNumberPool').and.returnValue($q.when(internalNumbers));
    spyOn(TelephonyInfoService, 'getExternalNumberPool').and.returnValue(externalNumbers);
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.when({
      extensionGenerated: 'false'
    }));
    spyOn(TelephonyInfoService, 'loadExternalNumberPool').and.returnValue($q.when(externalNumbers));
    spyOn(TelephonyInfoService, 'loadExtPoolWithMapping').and.returnValue($q.when(externalNumberPoolMap));
    spyOn(Userservice, 'getUser').and.returnValue(getUserMe);
    spyOn(Userservice, 'migrateUsers').and.returnValue(getMigrateUsers);
    spyOn(FeatureToggleService, 'getFeaturesForUser').and.returnValue(getMyFeatureToggles);
    spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));
    spyOn(TelephonyInfoService, 'getPrimarySiteInfo').and.returnValue($q.when(sites));

  }));

  function initController() {
    controller = $controller('OnboardCtrl', {
      $scope: $scope,
      $state: $state
    });

    $scope.$apply();
  }

  function onBoardUsersResponse(statusCode, responseMessage) {
    return {
      data: {
        userResponse: [{
          status: statusCode,
          message: responseMessage,
          email: 'blah@example.com'
        }, {
          status: statusCode,
          message: responseMessage,
          email: 'blah@example.com'
        }]
      }
    };
  }

  describe('Bulk Users CSV', function () {
    beforeEach(function () {
      initController();
    });
    var twoValidUsers = "First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\nJohn,Doe,John Doe,johndoe@example.com,5001,,true,true,true,true\nJane,Doe,Jane Doe,janedoe@example.com,5002,,f,f,f,f";
    var twoInvalidUsers = "First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\nJohn,Doe,John Doe,johndoe@example.com,5001,,TREU,true,true,true,true,true\nJane,Doe,Jane Doe,janedoe@example.com,5002,,FASLE,false,false,false";

    beforeEach(installPromiseMatchers);

    describe('Upload CSV', function () {
      describe('without file content', function () {
        it('should have 0 upload progress', function () {
          expect($scope.model.uploadProgress).toEqual(0);
        });
        it('should not go to the next step', function () {
          var promise = $scope.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeRejected();
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        });
      });
      describe('with file content', function () {
        beforeEach(function () {
          $scope.model.file = twoValidUsers;
          $scope.$apply();
          $timeout.flush();
        });
        it('should have 100 upload progress when the file model changes', function () {
          expect($scope.model.uploadProgress).toEqual(100);
        });
        it('should go to next step', function () {
          var promise = $scope.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeResolved();
        });
        it('should not allow to go next after resetting file', function () {
          $scope.resetFile();
          $scope.$apply();
          $timeout.flush();
          var promise = $scope.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeRejected();
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        });
      });
      it('should notify error on file size error', function () {
        $scope.onFileSizeError();
        $scope.$apply();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });
      it('should notify error on file type error', function () {
        $scope.onFileTypeError();
        $scope.$apply();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });
    });

    describe('Process CSV and Save Users', function () {
      beforeEach(function () {
        $scope.model.file = twoValidUsers;
        $scope.$apply();
        $timeout.flush();
      });
      it('should report new users', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onBoardUsersResponse(201)));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(2);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(0);
      });
      it('should report existing users', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onBoardUsersResponse(201, 'User Patched')));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(2);
        expect($scope.model.userErrorArray.length).toEqual(0);
      });

      it('should report error users', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onBoardUsersResponse(403)));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(2);
      });

      it('should report error users when API fails', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.reject(onBoardUsersResponse(500)));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(2);
      });

      it('should report error users when invalid CSV', function () {
        $scope.model.file = twoInvalidUsers;
        $scope.$apply();
        $timeout.flush();

        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onBoardUsersResponse(201)));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(2);
      });

      it('should stop processing when cancelled', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onBoardUsersResponse(-1)));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(2);

        $scope.cancelProcessCsv();
        $scope.$apply();
        expect(promise).toBeResolved();
      });
    });
  });

  describe('With assigning meeting licenses', function () {
    beforeEach(initController);
    beforeEach(function () {
      $scope.allLicenses = [{
        billing: 'testOrg1',
        confModel: false,
        label: 'test org',
        licenseId: 'testABC',
        offerName: 'CS',
        siteUrl: 'testOrg1@webex.com',
        volume: 100
      }, {
        billing: 'testOrg2',
        confModel: false,
        label: 'test org',
        licenseId: 'testDEF',
        offerName: 'CS',
        siteUrl: 'testOrg2@webex.com',
        volume: 100
      }];
    });
    it('should initialize allLicenses correctly', function () {
      $scope.populateConf();
      expect($scope.allLicenses[0].confModel).toEqual(false);
      expect($scope.allLicenses[0].label).toEqual('test org');
      expect($scope.allLicenses[1].billing).toEqual('testOrg2');
      expect($scope.allLicenses[1].offerName).toEqual('CS');
    });
    it('should verify userLicenseIds and licenseId are the same', function () {
      var userLicenseIds = 'testABC';
      $scope.populateConf();
      expect($scope.allLicenses[0].licenseId).toEqual(userLicenseIds);
      expect($scope.allLicenses[1].licenseId).not.toEqual(userLicenseIds);
    });
  });

  describe('With assigning message licenses', function () {
    describe('Check if single licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(Authinfo, 'getMessageServices').and.returnValue(getMessageServices.singleLicense);
        $stateParams.currentUser = {
          licenseID: ['MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0']
        };
        initController();
      });

      it('should define licenses model', function () {
        expect($scope.messageFeatures[1].licenses[0].model).toBeTruthy();
        expect($scope.radioStates.msgRadio).toEqual(false);
      });
    });

    describe('Check if multiple licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(Authinfo, 'getMessageServices').and.returnValue(getMessageServices.multipleLicenses);
        $stateParams.currentUser = {
          licenseID: ['MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0']
        };
        initController();
      });

      it('should call getAccountLicenses correctly', function () {
        var licenseFeatures = $scope.getAccountLicenses();
        expect(licenseFeatures[0].id).toEqual('MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0');
        expect(licenseFeatures[0].idOperation).toEqual('ADD');
        expect($scope.messageFeatures[1].licenses[0].model).toEqual(true);
        expect($scope.radioStates.msgRadio).toEqual(true);
      });
    });

  });

  describe('UserAdd DID and DN assignment', function () {
    beforeEach(initController);
    beforeEach(function () {
      $scope.usrlist = [{
        "name": "dntodid",
        "address": "dntodid@gmail.com"
      }, {
        "name": "dntodid1",
        "address": "dntodid1@gmail.com"
      }];
      $scope.convertSelectedList = [{
        "name": {
          "givenName": "dntodid",
          "familyName": ""
        },
        "userName": "dntodid@gmail.com"
      }, {
        "name": {
          "givenName": "dntodid1",
          "familyName": ""
        },
        "userName": "dntodid1@gmail.com"
      }];
      $scope.radioStates.commRadio = 'true';
      $scope.internalNumberPool = internalNumbers;
      $scope.externalNumberPool = externalNumberPool;
      $scope.$apply();

    });
    beforeEach(installPromiseMatchers);
    it('mapDidToDn', function () {
      $scope.mapDidToDn();
      $scope.$apply();
      expect($scope.externalNumberMapping.length).toEqual(2);
      expect($scope.usrlist[0].externalNumber.pattern).toEqual('+14084744532');
      expect($scope.usrlist[0].assignedDn).toEqual('4532');
      expect($scope.usrlist[1].didDnMapMsg).toEqual('usersPage.noExtMappingAvail');

    });
    it('assignServicesNext', function () {

      expect($scope.usrlist[0].externalNumber).not.toBeDefined();
      expect($scope.usrlist[0].assignedDn).not.toBeDefined();
      expect($scope.usrlist[1].externalNumber).not.toBeDefined();
      expect($scope.usrlist[1].assignedDn).not.toBeDefined();
      var promise = $scope.assignServicesNext();
      $scope.$apply();
      expect(promise).toBeResolved();
      expect($scope.usrlist[0].externalNumber).toBeDefined();
      expect($scope.usrlist[0].assignedDn.pattern).toEqual('4000');
      expect($scope.usrlist[1].externalNumber).toBeDefined();
      expect($scope.usrlist[1].assignedDn.pattern).toEqual('4001');
    });

    it('assignDNForUserList', function () {

      $scope.assignDNForUserList();
      $scope.$apply();
      expect($scope.usrlist[0].externalNumber.pattern).toEqual('null');
      expect($scope.usrlist[0].assignedDn.pattern).toEqual('4000');
      expect($scope.usrlist[1].externalNumber.pattern).toEqual('null');
      expect($scope.usrlist[1].assignedDn.pattern).toEqual('4001');

    });

    it('convertUsersNext', function () {

      $scope.convertUsersNext();
      $scope.$apply();
      expect($state.go).toHaveBeenCalledWith("users.convert.services.dn");
      expect($scope.usrlist[0].assignedDn.pattern).toEqual('4000');
      expect($scope.usrlist[1].assignedDn.pattern).toEqual('4001');
    });

    it('assignDNForConvertUsers', function () {

      $scope.assignDNForConvertUsers();
      $scope.$apply();
      expect(Userservice.migrateUsers).toHaveBeenCalled();
    });

    it('checkDidDnDupes', function () {

      $scope.loadInternalNumberPool();
      $scope.loadExternalNumberPool();
      expect($scope.usrlist.length).toEqual(2);
      $scope.assignDNForUserList();
      var result = $scope.checkDidDnDupes();
      $scope.$apply();
      expect(result).toBeTruthy();
    });

  });
  describe('status errors during onboarding', function () {
    beforeEach(initController);

    it('checkClaimedDomain', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onBoardUsersResponse(403, '400084')));
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkOutsideClaimedDomain', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onBoardUsersResponse(403, '400091')));
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkUserExists', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onBoardUsersResponse(403, '400081')));
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkUserExistsInDiffOrg', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onBoardUsersResponse(403, '400090')));
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('check hybrid services without paid licenses', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onBoardUsersResponse(400, '400087')));
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });
});
