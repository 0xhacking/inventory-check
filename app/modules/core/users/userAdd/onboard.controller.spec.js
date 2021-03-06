'use strict';

describe('OnboardCtrl: Ctrl', function () {

  function init() {
    this.initModules('Core', 'Hercules', 'Huron', 'Messenger', 'Sunlight', 'WebExApp');
    this.injectDependencies('$httpBackend', '$modal', '$q', '$scope', '$state', '$stateParams', '$previousState', '$timeout', 'Analytics', 'Authinfo', 'CsvDownloadService', 'DialPlanService', 'FeatureToggleService', 'Notification', 'Orgservice', 'SyncService', 'SunlightConfigService', 'TelephonyInfoService', 'Userservice', 'UrlConfig', 'WebExUtilsFact', 'ServiceSetup', 'LogMetricsService');
    initDependencySpies.apply(this);
  }

  function initController() {
    this.initController('OnboardCtrl', {
      $scope: this.$scope
    });
  }

  function initDependencySpies() {
    this.mock = {};
    var current = {
      step: {
        name: 'fakeStep'
      }
    };
    this.$scope.wizard = {};
    this.$scope.wizard.current = current;

    function isLastStep() {
      return false;
    }

    this.$scope.wizard.isLastStep = isLastStep;

    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200, {});

    spyOn(this.$state, 'go');
    spyOn(this.$previousState, 'get').and.returnValue({
      state: {
        name: 'test.state'
      }
    });

    this.mock.internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    this.mock.externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    this.mock.externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');
    this.mock.externalNumberPoolMap = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPoolMap.json');
    this.mock.getUserMe = getJSONFixture('core/json/users/me.json');
    this.mock.getMigrateUsers = getJSONFixture('core/json/users/migrate.json');
    this.mock.getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
    this.mock.sites = getJSONFixture('huron/json/settings/sites.json');
    this.mock.fusionServices = getJSONFixture('core/json/authInfo/fusionServices.json');
    this.mock.headers = getJSONFixture('core/json/users/headers.json');
    this.mock.getMessageServices = getJSONFixture('core/json/authInfo/messagingServices.json');
    this.mock.unlicensedUsers = getJSONFixture('core/json/organizations/unlicensedUsers.json');
    this.mock.allLicensesData = getJSONFixture('core/json/organizations/allLicenses.json');
    this.mock.getCareServices = getJSONFixture('core/json/authInfo/careServices.json');
    this.mock.getCareServicesWithoutCareLicense = getJSONFixture('core/json/authInfo/careServicesWithoutCareLicense.json');
    this.mock.getLicensesUsage = getJSONFixture('core/json/organizations/usage.json');

    spyOn(this.CsvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return this.$q.when(this.mock.headers);
      } else {
        return this.$q.when({});
      }
    }.bind(this));

    spyOn(this.Notification, 'notify');

    spyOn(this.Orgservice, 'getHybridServiceAcknowledged').and.returnValue(this.$q.when(this.mock.fusionServices));
    spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(function (callback) {
      callback(this.mock.unlicensedUsers, 200);
    }.bind(this));
    spyOn(this.Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({}, 200);
    });

    spyOn(this.TelephonyInfoService, 'getInternalNumberPool').and.returnValue(this.mock.internalNumbers);
    spyOn(this.TelephonyInfoService, 'loadInternalNumberPool').and.returnValue(this.$q.when(this.mock.internalNumbers));
    spyOn(this.TelephonyInfoService, 'getExternalNumberPool').and.returnValue(this.mock.externalNumbers);
    spyOn(this.DialPlanService, 'getCustomerDialPlanDetails').and.returnValue(this.$q.when({
      extensionGenerated: 'false'
    }));

    spyOn(this.TelephonyInfoService, 'loadExternalNumberPool').and.returnValue(this.$q.when(this.mock.externalNumbers));
    spyOn(this.TelephonyInfoService, 'loadExtPoolWithMapping').and.returnValue(this.$q.when(this.mock.externalNumberPoolMap));

    spyOn(this.FeatureToggleService, 'getFeaturesForUser').and.returnValue(this.mock.getMyFeatureToggles);
    spyOn(this.FeatureToggleService, 'supportsDirSync').and.returnValue(this.$q.when(false));
    spyOn(this.FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue(this.$q.when(true));
    spyOn(this.FeatureToggleService, 'atlasCareCallbackTrialsGetStatus').and.returnValue(this.$q.when(true));
    spyOn(this.TelephonyInfoService, 'getPrimarySiteInfo').and.returnValue(this.$q.when(this.mock.sites));
    spyOn(this.ServiceSetup, 'listSites').and.returnValue(this.$q.when(this.mock.sites));

    spyOn(this.Userservice, 'onboardUsers');
    spyOn(this.Userservice, 'bulkOnboardUsers');
    spyOn(this.Userservice, 'migrateUsers').and.returnValue(this.mock.getMigrateUsers);
    spyOn(this.Userservice, 'updateUsers');
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.mock.getLicensesUsage));
    spyOn(this.Analytics, 'trackAddUsers').and.returnValue(this.$q.when({}));
  }

  function onboardUsersResponse(statusCode, responseMessage) {
    return {
      data: {
        userResponse: [{
          status: statusCode,
          httpStatus: statusCode,
          message: responseMessage,
          email: 'blah@example.com'
        }, {
          status: statusCode,
          httpStatus: statusCode,
          message: responseMessage,
          email: 'blah@example.com'
        }]
      }
    };
  }

  beforeEach(init);

  describe('Current user name', function () {

    beforeEach(initController);

    it('should return correct string for currentUserDisplayName()', function () {
      this.$scope.currentUser = {
        displayName: 'Testy McTestUser',
        name: {
          givenName: 'Firsty',
          familyName: 'Lasty'
        },
        userName: 'User McUsername'
      };

      expect(this.$scope.currentUserDisplayName()).toEqual('Testy McTestUser');

      this.$scope.currentUser.displayName = '';
      expect(this.$scope.currentUserDisplayName()).toEqual('Firsty Lasty');

      this.$scope.currentUser.name.familyName = '';
      expect(this.$scope.currentUserDisplayName()).toEqual('Firsty');

      this.$scope.currentUser.name.givenName = null;
      this.$scope.currentUser.name.familyName = 'Lasty';
      expect(this.$scope.currentUserDisplayName()).toEqual('Lasty');

      this.$scope.currentUser.name = null;
      expect(this.$scope.currentUserDisplayName()).toEqual('User McUsername');

      this.$scope.currentUser.userName = null;
      expect(this.$scope.currentUserDisplayName()).toEqual('common.unknown');

    });
  });

  describe('Bulk Users DirSync', function () {
    beforeEach(initController);
    var validUserList = [{
      firstName: 'John',
      lastName: 'Doe',
      Email: 'johnDoe@example.com'
    }, {
      firstName: 'Jane',
      lastName: 'Doe',
      Email: 'janeDoe@domain.com'
    }];

    beforeEach(installPromiseMatchers);

    describe('process and save users', function () {
      beforeEach(function () {
        this.$scope.userList = validUserList;
        this.$scope.syncStatusNext();
        this.$scope.$apply();
        this.$timeout.flush();
      });
      it('should load user list into userArray', function () {
        expect(this.$scope.model.numMaxUsers).toEqual(2);
      });
      it('should report existing users', function () {
        this.Userservice.onboardUsers.and.returnValue(this.$q.resolve(onboardUsersResponse(200)));
        var promise = this.$scope.dirsyncProcessingNext();
        this.$scope.$apply();
        expect(promise).toBeResolved();
        expect(this.$scope.model.processProgress).toEqual(100);
        expect(this.$scope.model.numTotalUsers).toEqual(2);
        expect(this.$scope.model.numNewUsers).toEqual(0);
        expect(this.$scope.model.numExistingUsers).toEqual(2);
        expect(this.$scope.model.userErrorArray.length).toEqual(0);
      });
      it('should report error users', function () {
        this.Userservice.onboardUsers.and.returnValue(this.$q.resolve(onboardUsersResponse(403)));
        var promise = this.$scope.dirsyncProcessingNext();
        this.$scope.$apply();
        expect(promise).toBeResolved();
        expect(this.$scope.model.processProgress).toEqual(100);
        expect(this.$scope.model.numTotalUsers).toEqual(2);
        expect(this.$scope.model.numNewUsers).toEqual(0);
        expect(this.$scope.model.numExistingUsers).toEqual(0);
        expect(this.$scope.model.userErrorArray.length).toEqual(2);
      });
      it('should report error users when API fails', function () {
        this.Userservice.onboardUsers.and.returnValue(this.$q.reject(onboardUsersResponse(500)));
        var promise = this.$scope.dirsyncProcessingNext();
        this.$scope.$apply();
        expect(promise).toBeResolved();
        expect(this.$scope.model.processProgress).toEqual(100);
        expect(this.$scope.model.numTotalUsers).toEqual(2);
        expect(this.$scope.model.numNewUsers).toEqual(0);
        expect(this.$scope.model.numExistingUsers).toEqual(0);
        expect(this.$scope.model.userErrorArray.length).toEqual(2);
      });
      it('should stop processing when cancelled', function () {
        this.Userservice.onboardUsers.and.returnValue(this.$q.resolve(onboardUsersResponse(-1)));
        var promise = this.$scope.dirsyncProcessingNext();
        this.$scope.$apply();
        expect(promise).toBeResolved();
        expect(this.$scope.model.processProgress).toEqual(100);
        expect(this.$scope.model.numTotalUsers).toEqual(2);
        expect(this.$scope.model.numNewUsers).toEqual(0);
        expect(this.$scope.model.numExistingUsers).toEqual(0);
        expect(this.$scope.model.userErrorArray.length).toEqual(2);
        this.$scope.cancelProcessCsv();
        this.$scope.$apply();
        expect(promise).toBeResolved();
      });
    });
  });

  describe('setLicenseAvailabity', function () {
    beforeEach(initController);

    it('Should have been initialized', function () {
      expect(this.Orgservice.getLicensesUsage).toHaveBeenCalled();
    });
    it('should get licenses', function () {
      expect(this.$scope.licenses).toBeDefined();
    });
    it('Should calculate the license availabilities correctly', function () {
      expect(this.$scope.messagingLicenseAvailability).toEqual(0);
      expect(this.$scope.communicationLicenseAvailability).toEqual(3);
      expect(this.$scope.conferencingLicenseAvailability).toEqual(1);
    });
  });
  describe('License redirect modal', function () {
    beforeEach(initController);
    beforeEach(function () {
      spyOn(this.$scope, 'licenseCheckModal');
    });
    it('should define the modal when sufficient licenses are not available', function () {
      this.$scope.checkLicenseAvailability('MESSAGING', true);
      expect(this.$scope.licenseCheckModal).toHaveBeenCalled();
    });
    it('should not launch modal when sufficient licenses are available', function () {
      this.$scope.checkLicenseAvailability('COMMUNICATION', false);
      expect(this.$scope.licenseCheckModal).not.toHaveBeenCalled();
    });
  });

  describe('with determining message checkbox visibility', function () {
    beforeEach(initController);
    it('should return false if more than one license', function () {
      var displayMessageCheckbox = this.$scope.checkMessageVisibility([{
        license: 1
      }, {
        license: 2
      }]);
      expect(displayMessageCheckbox).toBeFalsy();
    });

    it('should return true if only one license and no billingServiceId', function () {
      var displayMessageCheckbox = this.$scope.checkMessageVisibility([{
        license: 1
      }], 2);
      expect(displayMessageCheckbox).toBeTruthy();
    });

    it('should return true if only one license and no selectedSubscription', function () {
      var displayMessageCheckbox = this.$scope.checkMessageVisibility([{
        billingServiceId: 1
      }]);
      expect(displayMessageCheckbox).toBeTruthy();
    });

    it('should return false if only one license and billingServiceId does not match selectedSubscription', function () {
      var displayMessageCheckbox = this.$scope.checkMessageVisibility([{
        billingServiceId: 1
      }], 2);
      expect(displayMessageCheckbox).toBeFalsy();
    });

    it('should return true if only one license and billingServiceId match selectedSubscription', function () {
      var displayMessageCheckbox = this.$scope.checkMessageVisibility([{
        billingServiceId: 1
      }], 1);
      expect(displayMessageCheckbox).toBeTruthy();
    });
  });

  describe('With assigning meeting licenses', function () {
    beforeEach(initController);
    beforeEach(function () {
      this.$scope.allLicenses = [{
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
    it('should initialize all licenses correctly', function () {
      this.$scope.populateConf();
      expect(this.$scope.allLicenses[0].confModel).toEqual(false);
      expect(this.$scope.allLicenses[0].label).toEqual('test org');
      expect(this.$scope.allLicenses[1].billing).toEqual('testOrg2');
      expect(this.$scope.allLicenses[1].offerName).toEqual('CS');
    });
    it('should verify userLicenseIds and licenseId are the same', function () {
      var userLicenseIds = 'testABC';
      this.$scope.populateConf();
      expect(this.$scope.allLicenses[0].licenseId).toEqual(userLicenseIds);
      expect(this.$scope.allLicenses[1].licenseId).not.toEqual(userLicenseIds);
    });
  });

  describe('With assigning message licenses', function () {
    describe('Check if single licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'getMessageServices').and.returnValue(this.mock.getMessageServices.singleLicense);
        this.$stateParams.currentUser = {
          licenseID: ['MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0']
        };
      });
      beforeEach(initController);

      it('should define licenses model', function () {
        expect(this.$scope.messageFeatures[1].licenses[0].model).toBeTruthy();
        expect(this.$scope.radioStates.msgRadio).toEqual(false);
      });
    });

    describe('Check if multiple licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getMessageServices').and.returnValue(this.mock.getMessageServices.multipleLicenses);
        this.$stateParams.currentUser = {
          licenseID: ['MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0']
        };
      });
      beforeEach(initController);

      it('should call getAccountLicenses correctly', function () {
        var licenseFeatures = this.$scope.getAccountLicenses();
        expect(licenseFeatures[0].id).toEqual('MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0');
        expect(licenseFeatures[0].idOperation).toEqual('ADD');
        expect(this.$scope.messageFeatures[1].licenses[0].model).toEqual(true);
        expect(this.$scope.radioStates.msgRadio).toEqual(true);
        expect(this.$scope.radioStates.careRadio).toEqual(false);
        expect(this.$scope.enableCareService).toEqual(false);
      });
    });
  });

  describe('With assigning meeting and message licenses on invitations', function () {
    beforeEach(function () {
      this.$stateParams.currentUser = {
        licenseID: [
          'MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0',
          'CF_5761413b-5bad-4d6a-b40d-c157c0f99062'
        ],
        pendingStatus: true,
        invitations: {
          ms: true,
          cf: 'CF_5761413b-5bad-4d6a-b40d-c157c0f99062'
        }
      };
    });
    beforeEach(initController);
    beforeEach(function () {
      this.$scope.allLicenses = [{
        billing: 'testOrg1',
        confModel: false,
        label: 'test org',
        licenseId: 'CF_5761413b-5bad-4d6a-b40d-c157c0f99062',
        offerName: 'CF',
        siteUrl: '',
        volume: 100
      }];
    });
    it('should set MS license to true based on invitation', function () {
      expect(this.$scope.radioStates.msgRadio).toBeTruthy();
    });
    it('should set meeting to true on invitation', function () {
      this.$scope.populateConfInvitations();
      expect(this.$scope.allLicenses[0].confModel).toEqual(true);
    });
  });

  describe('UserAdd DID and DN assignment', function () {
    beforeEach(initController);
    beforeEach(function () {
      this.$scope.usrlist = [{
        "name": "dntodid",
        "address": "dntodid@gmail.com"
      }, {
        "name": "dntodid1",
        "address": "dntodid1@gmail.com"
      }];
      this.$scope.convertSelectedList = [{
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
      this.$scope.radioStates.commRadio = 'true';
      this.$scope.internalNumberPool = this.mock.internalNumbers;
      this.$scope.externalNumberPool = this.mock.externalNumberPool;
      this.$scope.$apply();

    });
    beforeEach(installPromiseMatchers);
    it('mapDidToDn', function () {
      this.$scope.mapDidToDn();
      this.$scope.$apply();
      expect(this.$scope.externalNumberMapping.length).toEqual(2);
      expect(this.$scope.usrlist[0].externalNumber.pattern).toEqual('+14084744532');
      expect(this.$scope.usrlist[0].assignedDn).toEqual('4532');
      expect(this.$scope.usrlist[1].didDnMapMsg).toEqual('usersPage.noExtMappingAvail');

    });

    it('assignServicesNext', function () {
      expect(this.$scope.usrlist[0].externalNumber).not.toBeDefined();
      expect(this.$scope.usrlist[0].assignedDn).not.toBeDefined();
      expect(this.$scope.usrlist[1].externalNumber).not.toBeDefined();
      expect(this.$scope.usrlist[1].assignedDn).not.toBeDefined();
      var promise = this.$scope.assignServicesNext();
      this.$scope.$apply();
      expect(promise).toBeResolved();
      expect(this.$scope.usrlist[0].externalNumber).toBeDefined();
      expect(this.$scope.usrlist[0].assignedDn.pattern).toEqual('4000');
      expect(this.$scope.usrlist[1].externalNumber).toBeDefined();
      expect(this.$scope.usrlist[1].assignedDn.pattern).toEqual('4001');
    });

    it('editServicesSave', function () {
      this.$scope.currentUser = {
        userName: 'johndoe@example.com'
      };
      this.$scope.editServicesSave();
      this.$scope.$apply();
      expect(this.$scope.usrlist.length).toEqual(1);
      expect(this.$scope.usrlist[0]).toEqual(jasmine.objectContaining({
        address: 'johndoe@example.com',
        assignedDn: this.mock.internalNumbers[0],
        externalNumber: this.mock.externalNumbers[0]
      }));
      expect(this.$state.go).toHaveBeenCalledWith('editService.dn');
      expect(this.$scope.editServicesFlow).toBe(true);
      expect(this.$scope.convertUsersFlow).toBe(false);
    });

    it('assignDNForUserList', function () {

      this.$scope.assignDNForUserList();
      this.$scope.$apply();
      expect(this.$scope.usrlist[0].externalNumber.pattern).toEqual('null');
      expect(this.$scope.usrlist[0].assignedDn.pattern).toEqual('4000');
      expect(this.$scope.usrlist[1].externalNumber.pattern).toEqual('null');
      expect(this.$scope.usrlist[1].assignedDn.pattern).toEqual('4001');

    });

    it('convertUsersNext', function () {

      this.$scope.convertUsersNext();
      this.$scope.$apply();
      expect(this.$state.go).toHaveBeenCalledWith("users.convert.services.dn");
      expect(this.$scope.usrlist[0].assignedDn.pattern).toEqual('4000');
      expect(this.$scope.usrlist[1].assignedDn.pattern).toEqual('4001');
    });

    it('assignDNForConvertUsers', function () {

      this.$scope.assignDNForConvertUsers();
      this.$scope.$apply();
      expect(this.Userservice.migrateUsers).toHaveBeenCalled();
    });

    it('checkDidDnDupes', function () {

      this.$scope.loadInternalNumberPool();
      this.$scope.loadExternalNumberPool();
      expect(this.$scope.usrlist.length).toEqual(2);
      this.$scope.assignDNForUserList();
      var result = this.$scope.checkDidDnDupes();
      this.$scope.$apply();
      expect(result).toBeTruthy();
    });

  });

  describe('filterList', function () {
    beforeEach(initController);
    it('a proper query should call out to organizationService', function () {
      this.$scope.filterList('sqtest');
      this.$timeout.flush();
      expect(this.Orgservice.getUnlicensedUsers.calls.count()).toEqual(2);
      expect(this.$scope.showSearch).toEqual(true);
    });
  });

  describe('shouldAddCallService()', function () {
    describe('current user without call service', function () {
      beforeEach(initUserWithoutCall);
      beforeEach(initController);

      describe('should add call service', function () {
        afterEach(expectShouldAddCallService);

        it('if both commRadio and ciscoUC are enabled', function () {
          this.$scope.radioStates.commRadio = true;
          this.$scope.entitlements.ciscoUC = true;
        });

        it('if commRadio is enabled', function () {
          this.$scope.radioStates.commRadio = true;
          this.$scope.entitlements.ciscoUC = false;
        });

        it('if ciscoUC is enabled', function () {
          this.$scope.radioStates.commRadio = false;
          this.$scope.entitlements.ciscoUC = true;
        });
      });

      describe('should not add call service', function () {
        afterEach(expectShouldNotAddCallService);

        it('if neither commRadio or ciscoUC is enabled', function () {
          this.$scope.radioStates.commRadio = false;
          this.$scope.entitlements.ciscoUC = false;
        });
      });
    });

    describe('current user with call should not add call service', function () {
      beforeEach(initUserWithCall);
      beforeEach(initController);
      afterEach(expectShouldNotAddCallService);

      it('if both commRadio and ciscoUC are enabled', function () {
        this.$scope.radioStates.commRadio = true;
        this.$scope.entitlements.ciscoUC = true;
      });

      it('if commRadio is enabled', function () {
        this.$scope.radioStates.commRadio = true;
        this.$scope.entitlements.ciscoUC = false;
      });

      it('if ciscoUC is enabled', function () {
        this.$scope.radioStates.commRadio = false;
        this.$scope.entitlements.ciscoUC = true;
      });

      it('if neither commRadio or ciscoUC is enabled', function () {
        this.$scope.radioStates.commRadio = false;
        this.$scope.entitlements.ciscoUC = false;
      });
    });

    function expectShouldAddCallService() {
      expect(this.$scope.shouldAddCallService()).toBe(true);
    }

    function expectShouldNotAddCallService() {
      expect(this.$scope.shouldAddCallService()).toBe(false);
    }

    function initUserWithoutCall() {
      this.$stateParams.currentUser = {
        entitlements: []
      };
    }

    function initUserWithCall() {
      this.$stateParams.currentUser = {
        entitlements: ['ciscouc']
      };
    }
  });

  describe('hybridCallServiceAware', function () {
    describe('on user without squared-fusion-uc entitlement', function () {
      beforeEach(initUserWithoutHybridCall);
      beforeEach(initController);

      it('should be false', function () {
        expect(this.$scope.hybridCallServiceAware).toBe(false);
      });
    });

    describe('on user with squared-fusion-uc entitlement', function () {
      beforeEach(initUserWithHybridCall);
      beforeEach(initController);

      it('should be true', function () {
        expect(this.$scope.hybridCallServiceAware).toBe(true);
      });
    });

    function initUserWithoutHybridCall() {
      this.$stateParams.currentUser = {
        entitlements: []
      };
    }

    function initUserWithHybridCall() {
      this.$stateParams.currentUser = {
        entitlements: ['squared-fusion-uc']
      };
    }
  });

  describe('editServicesSave()', function () {
    describe('if adding call service', function () {
      beforeEach(initControllerAndEnableCall);
      beforeEach(editServicesSave);

      it('should activateDID and goto editService.dn state', function () {
        expect(this.$state.go).toHaveBeenCalledWith('editService.dn');
      });
    });

    describe('if not adding call service', function () {
      beforeEach(initController);
      beforeEach(initSpy);
      beforeEach(editServicesSave);

      it('should update user license', function () {
        expect(this.$scope.updateUserLicense).toHaveBeenCalled();
      });
    });

    function editServicesSave() {
      this.$scope.editServicesSave();
      this.$scope.$apply();
    }

    function initSpy() {
      spyOn(this.$scope, 'updateUserLicense');
    }
  });

  describe('updateUserLicense()', function () {
    beforeEach(initCurrentUserAndController);

    beforeEach(function () {
      this.$scope.$dismiss = _.noop;
      this.Userservice.onboardUsers.and.returnValue(this.$q.resolve(onboardUsersResponse(200, '')));
    });

    describe('with a current user', function () {
      beforeEach(updateUserLicense);

      it('should call Userservice.onboardUsers() with the current user', function () {
        expect(this.Userservice.onboardUsers).toHaveBeenCalled();
        var onboardedUser = this.Userservice.onboardUsers.calls.mostRecent().args[0][0];
        expect(onboardedUser.address).toEqual(this.$stateParams.currentUser.userName);
      });
    });

    describe('with an existing usrlist array', function () {
      beforeEach(initCustomUsrList);
      beforeEach(updateUserLicense);

      it('should call Userservice.onboardUsers() with the custom user list', function () {
        expect(this.Userservice.onboardUsers).toHaveBeenCalled();
        var onboardedUser = this.Userservice.onboardUsers.calls.mostRecent().args[0][0];
        expect(onboardedUser.address).toEqual(this.usrlist[0].address);
      });
    });

    describe('with spark call line assignment', function () {
      beforeEach(initCustomUsrList);

      it('should use assignedDn and externalNumber for onboarded user', function () {
        _.assign(this.$scope.usrlist[0], {
          assignedDn: {
            uuid: '111',
            pattern: '123',
          },
          externalNumber: {
            uuid: '444',
            pattern: '+456',
          },
        });
        updateUserLicense.apply(this);
        expect(this.Userservice.onboardUsers).toHaveBeenCalled();
        var onboardedUser = this.Userservice.onboardUsers.calls.mostRecent().args[0][0];
        expect(onboardedUser.internalExtension).toBe('123');
        expect(onboardedUser.directLine).toBe('+456');
      });

      it('should ignore "none" externalNumber for onboarded user', function () {
        _.assign(this.$scope.usrlist[0], {
          assignedDn: {
            uuid: '111',
            pattern: '123',
          },
          externalNumber: {
            uuid: 'none',
            pattern: 'TranslatedNone',
          },
        });
        updateUserLicense.apply(this);
        expect(this.Userservice.onboardUsers).toHaveBeenCalled();
        var onboardedUser = this.Userservice.onboardUsers.calls.mostRecent().args[0][0];
        expect(onboardedUser.internalExtension).toBe('123');
        expect(onboardedUser.directLine).toBeUndefined();
      });
    });

    function initCustomUsrList() {
      this.usrlist = [{
        address: 'customTestUser'
      }];
      this.$scope.usrlist = this.usrlist;
    }

    function updateUserLicense() {
      this.$scope.updateUserLicense();
      this.$scope.$apply();
    }
  });

  describe('MC/CMR Checkbox logic', function () {
    beforeEach(initCurrentUserAndController);

    it('should check if CMR gets checked when CF gets checked', function () {
      this.mock.allLicensesData.allLicenses.forEach(function (lic) {
        lic.confLic.forEach(function (cfLic) {
          cfLic.confModel = true; // check CF license
          this.$scope.checkCMR(cfLic.confModel, lic.cmrLic);
          lic.cmrLic.forEach(function (cmrLic) {
            expect(cmrLic).toBeTruthy(); // expect CMR license to be checked
          });
        }.bind(this));
      }.bind(this));
    });

    it('should check if CF gets checked when CMR gets checked', function () {
      this.mock.allLicensesData.allLicenses.forEach(function (lic) {
        lic.confLic.forEach(function (cfLic) {
          this.$scope.checkCMR(cfLic.confModel, lic.cmrLic);
          expect(cfLic.confModel).toBeTruthy(); // expect CF license to be checked
        }.bind(this));
      }.bind(this));
    });

    it('should check if CF remains checked when CMR is unchecked', function () {
      this.mock.allLicensesData.allLicenses.forEach(function (lic) {
        lic.confLic.forEach(function (cfLic) {
          cfLic.confModel = true; // check CF license
          this.$scope.checkCMR(cfLic.confModel, lic.cmrLic);
          expect(cfLic.confModel).toBeTruthy(); // expect CF license to remain checked
        }.bind(this));
      }.bind(this));
    });
  });

  describe('With assigning care licenses', function () {
    describe('Check if dependent services are selected correctly', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServices.careLicense);
        this.$stateParams.currentUser = {
          licenseID: ['CDC_da652e7d-cd34-4545-8f23-936b74359afd']
        };
      });
      beforeEach(initController);
      it('should enable care, when message or call is checked', function () {
        this.$scope.radioStates.msgRadio = true;
        this.$scope.radioStates.commRadio = true;
        this.$scope.controlCare();
        expect(this.$scope.radioStates.careRadio).toBe(false);
        expect(this.$scope.enableCareService).toBe(true);
      });
      it('should disable care, when message or call is unchecked', function () {
        this.$scope.radioStates.msgRadio = false;
        this.$scope.radioStates.commRadio = true;
        this.$scope.controlCare();
        expect(this.$scope.radioStates.careRadio).toBe(false);
        expect(this.$scope.enableCareService).toBe(false);
        this.$scope.radioStates.msgRadio = true;
        this.$scope.radioStates.commRadio = false;
        this.$scope.controlCare();
        expect(this.$scope.radioStates.careRadio).toBe(false);
        expect(this.$scope.enableCareService).toBe(false);
        this.$scope.radioStates.msgRadio = true;
        this.$scope.radioStates.commRadio = true;
        this.$scope.controlCare();
        expect(this.$scope.radioStates.careRadio).toBe(false);
        expect(this.$scope.enableCareService).toBe(true);
      });
    });

    describe('Check if single licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServices.careLicense);
        this.$stateParams.currentUser = {
          licenseID: ['CDC_da652e7d-cd34-4545-8f23-936b74359afd']
        };
      });
      beforeEach(initController);

      it('should have care license', function () {
        expect(this.$scope.careFeatures[1].license.licenseType).toEqual('CARE');
        expect(this.$scope.radioStates.careRadio).toEqual(false);
      });
    });

    describe('Check that careRadio remains false when user does not have the care License', function () {
      var userId = 'dbca1001-ab12-cd34-de56-abcdef123454';

      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServicesWithoutCareLicense.careLicense);
        spyOn(this.LogMetricsService, 'logMetrics').and.callFake(function () {});
        this.$stateParams.currentUser = {
          licenseID: ['MS_cd66217d-a419-4cfb-92b4-a196b7fe3c74'],
          entitlements: ['cloud-contact-center'],
          id: userId
        };
      });
      beforeEach(initController);


      it('should call getAccountLicenses correctly', function () {
        this.$httpBackend.flush();
        this.$scope.radioStates.initialCareRadioState = false;
        this.$scope.getAccountLicenses();
        expect(this.$scope.radioStates.careRadio).toEqual(false);
        this.$httpBackend.verifyNoOutstandingRequest();
      });
    });

    describe('Check if multiple licenses get assigned correctly', function () {
      var userId = 'dbca1001-ab12-cd34-de56-abcdef123454';

      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServices.careLicense);
        spyOn(this.LogMetricsService, 'logMetrics').and.callFake(function () {});
        this.$httpBackend.expectGET(this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/'
          + this.Authinfo.getOrgId() + '/user' + '/' + userId).respond(200);
        this.$httpBackend.expectGET(this.UrlConfig.getScimUrl('null') + '/' + userId).respond(200, this.mock.getUserMe);
        this.$stateParams.currentUser = {
          licenseID: ['CDC_da652e7d-cd34-4545-8f23-936b74359afd'],
          entitlements: ['cloud-contact-center'],
          id: userId
        };
      });
      beforeEach(initController);


      it('should call getAccountLicenses correctly', function () {
        this.$httpBackend.flush();
        this.$scope.radioStates.initialCareRadioState = false;
        var licenseFeatures = this.$scope.getAccountLicenses();
        expect(licenseFeatures[0].id).toEqual('CDC_da652e7d-cd34-4545-8f23-936b74359afd');
        expect(licenseFeatures[0].idOperation).toEqual('ADD');
        expect(this.$scope.careFeatures[1].license.licenseType).toEqual('CARE');
        expect(this.$scope.radioStates.careRadio).toEqual(true);
        expect(this.$scope.enableCareService).toEqual(true);
        expect(this.LogMetricsService.logMetrics.calls.argsFor(0)[1]).toEqual('CAREENABLED');
      });

      it('should call LogMetrics service when care checkbox is de selected', function () {
        this.$httpBackend.flush();
        this.$scope.radioStates.initialCareRadioState = true;
        this.$scope.radioStates.careRadio = false;
        this.$scope.getAccountLicenses();
        expect(this.LogMetricsService.logMetrics.calls.argsFor(0)[1]).toEqual('CAREDISABLED');
      });
    });

    describe('checkDnOverlapsSteeringDigit function', function () {
      var userObj;
      beforeEach(initController);
      beforeEach(function () {
        userObj = {
          assignedDn: {
            pattern: '912'
          }
        };
      });

      it('should be true if pattern starts with telephonyInfo.steeringDigit', function () {
        this.$scope.telephonyInfo = {
          steeringDigit: '9'
        };
        expect(this.$scope.checkDnOverlapsSteeringDigit(userObj)).toBe(true);
      });

      it('should be false if pattern does not start with telephonyInfo.steeringDigit', function () {
        this.$scope.telephonyInfo = {
          steeringDigit: '5'
        };
        expect(this.$scope.checkDnOverlapsSteeringDigit(userObj)).toBe(false);
      });

      it('should be false if telephonyInfo has not been initialized', function () {
        this.$scope.telephonyInfo = undefined;
        expect(this.$scope.checkDnOverlapsSteeringDigit(userObj)).toBe(false);
      });
    });
  });

  function initUserShouldAddCall() {
    this.$scope.radioStates.commRadio = true;
    this.$scope.$apply();
  }

  function initCurrentUser() {
    this.$stateParams.currentUser = {
      userName: 'testUser'
    };
  }

  function initCurrentUserAndController() {
    initCurrentUser.apply(this);
    initController.apply(this);
  }

  function initControllerAndEnableCall() {
    initCurrentUserAndController.apply(this);
    initUserShouldAddCall.apply(this);
  }
});
