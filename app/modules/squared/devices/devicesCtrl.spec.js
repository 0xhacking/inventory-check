'use strict';

describe('Controller: DevicesCtrl', function () {
  var $scope, $state, $controller, controller, $httpBackend, $timeout, $q;
  var CsdmConfigService, AccountOrgService, Authinfo, FeatureToggleService, Userservice;

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies($rootScope, _$state_, _$timeout_, _$controller_, _$httpBackend_, _$q_, _CsdmConfigService_, _AccountOrgService_, _Authinfo_, _FeatureToggleService_, _Userservice_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    $q = _$q_;
    CsdmConfigService = _CsdmConfigService_;
    AccountOrgService = _AccountOrgService_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    Userservice = _Userservice_;
  }

  function initSpies() {
    // TODO - eww this is wrong - Just make this init right now
    $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/devices/?type=huron').respond([]);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/nonExistingDevices').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkDisplayName=false&checkOnline=false').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices').respond(200);
    $httpBackend.expectGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkDisplayName=false&checkOnline=false');
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/codes').respond(200);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);

    spyOn(Userservice, 'getUser').and.callFake(function (userId, callback) {
      callback({
        data: {
          meta: {}
        }
      });
    });

    spyOn(AccountOrgService, 'getAccount').and.returnValue({
      success: _.noop
    });
  }

  function initController() {
    controller = $controller('DevicesCtrl', {
      $scope: $scope,
      $state: $state
    });
    $scope.$apply();
  }

  it('should init controller', function () {
    expect(controller).toBeDefined();
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
  });

  it('polls for devices every 30 second', function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.expectGET(CsdmConfigService.getUrl() + '/organization/null/devices');
    $timeout.flush(30500);
    //$timeout.verifyNoPendingTasks();
    //$scope.$digest();
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
  });

  describe('startAddDeviceFlow function', function () {
    var displayName;
    var userCisUuid;
    var firstName;
    var email;
    var orgId;
    var adminOrgId;
    var isEntitledToHuron;
    var isEntitledToRoomSystem;
    var showDarling;
    var showATA;
    beforeEach(function () {
      isEntitledToHuron = true;
      isEntitledToRoomSystem = true;
      showDarling = true;
      showATA = true;
      displayName = 'displayName';
      firstName = 'firstName';
      userCisUuid = 'userCisUuid';
      email = 'email@address.com';
      orgId = 'orgId';
      adminOrgId = 'adminOrgId';
      spyOn(controller, 'isEntitledToHuron').and.returnValue(isEntitledToHuron);
      spyOn(Authinfo, 'isDeviceMgmt').and.returnValue(isEntitledToRoomSystem);
      spyOn(Authinfo, 'getUserId').and.returnValue(userCisUuid);
      spyOn(Authinfo, 'getPrimaryEmail').and.returnValue(email);
      spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
      spyOn($state, 'go');
      controller.adminDisplayName = displayName;
      controller.adminFirstName = firstName;
      controller.showDarling = showDarling;
      controller.adminOrgId = adminOrgId;
    });

    it('should set the wizardState with correct fields for the wizard if places toggle is on', function () {
      controller.showATA = showATA;
      controller.startAddDeviceFlow();
      $scope.$apply();
      expect($state.go).toHaveBeenCalled();
      var wizardState = $state.go.calls.mostRecent().args[1].wizard.state().data;
      expect(wizardState.title).toBe('addDeviceWizard.newDevice');
      expect(wizardState.function).toBe('addDevice');
      expect(wizardState.showDarling).toBe(showDarling);
      expect(wizardState.showATA).toBe(showATA);
      expect(wizardState.adminOrganizationId).toBe(adminOrgId);
      expect(wizardState.isEntitledToHuron).toBe(isEntitledToHuron);
      expect(wizardState.isEntitledToRoomSystem).toBe(isEntitledToRoomSystem);
      expect(wizardState.account.organizationId).toBe(orgId);
      expect(wizardState.recipient.displayName).toBe(displayName);
      expect(wizardState.recipient.firstName).toBe(firstName);
      expect(wizardState.recipient.cisUuid).toBe(userCisUuid);
      expect(wizardState.recipient.email).toBe(email);
      expect(wizardState.recipient.organizationId).toBe(adminOrgId);
    });

    it('should set the wizardState with correct fields for the wizard if places toggle is off', function () {
      controller.showATA = showATA;
      controller.startAddDeviceFlow();
      $scope.$apply();
      expect($state.go).toHaveBeenCalled();
      var wizardState = $state.go.calls.mostRecent().args[1].wizard.state().data;
      expect(wizardState.title).toBe('addDeviceWizard.newDevice');
      expect(wizardState.function).toBe('addDevice');
      expect(wizardState.showDarling).toBe(showDarling);
      expect(wizardState.showATA).toBe(showATA);
      expect(wizardState.adminOrganizationId).toBe(adminOrgId);
      expect(wizardState.isEntitledToHuron).toBe(isEntitledToHuron);
      expect(wizardState.isEntitledToRoomSystem).toBe(isEntitledToRoomSystem);
      expect(wizardState.account.organizationId).toBe(orgId);
      expect(wizardState.recipient.displayName).toBe(displayName);
      expect(wizardState.recipient.firstName).toBe(firstName);
      expect(wizardState.recipient.cisUuid).toBe(userCisUuid);
      expect(wizardState.recipient.email).toBe(email);
      expect(wizardState.recipient.organizationId).toBe(adminOrgId);
    });
  });

  describe('Feature toggle loading', function () {
    beforeEach(function () {
      spyOn(FeatureToggleService, 'atlasDarlingGetStatus').and.returnValue($q.when(true));
      spyOn(FeatureToggleService, 'csdmATAGetStatus').and.returnValue($q.when(true));
      spyOn(FeatureToggleService, 'csdmPstnGetStatus').and.returnValue($q.when(true));
      spyOn(FeatureToggleService, 'atlasDeviceExportGetStatus').and.returnValue($q.when(true));
    });

    it('should resolve toggle loading', function () {
      spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.when(true));
      controller = $controller('DevicesCtrl', {
        $scope: $scope,
        $state: $state,
        FeatureToggleService: FeatureToggleService
      });
      expect(controller.addDeviceIsDisabled).toBeTruthy();
      $scope.$digest();
      expect(controller.addDeviceIsDisabled).toBeFalsy();
    });

    it('should resolve toggle loading if a promise fails', function () {
      var deferred = $q.defer();
      spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue(deferred.promise);
      controller = $controller('DevicesCtrl', {
        $scope: $scope,
        $state: $state
      });
      expect(controller.addDeviceIsDisabled).toBeTruthy();
      deferred.reject();
      $scope.$digest();
      expect(controller.addDeviceIsDisabled).toBeFalsy();
    });
  });

  describe('export device data', function () {
    var $modal, DeviceExportService, fakeModal, Notification;
    beforeEach(inject(function (_$modal_, _DeviceExportService_, _Notification_) {
      $modal = _$modal_;
      DeviceExportService = _DeviceExportService_;
      Notification = _Notification_;
    }));

    beforeEach(function () {

      fakeModal = {
        result: {
          then: function (okCallback, cancelCallback) {
            this.okCallback = okCallback;
            this.cancelCallback = cancelCallback;
          }
        },
        opened: {
          then: function (okCallback) {
            okCallback();
          }
        },
        close: function (item) {
          this.result.okCallback(item);
        },
        dismiss: function (type) {
          this.result.cancelCallback(type);
        }
      };
      spyOn($modal, 'open').and.returnValue(fakeModal);
      spyOn(Notification, 'success');
      spyOn(Notification, 'warning');
      spyOn(DeviceExportService, 'exportDevices');

    });

    it('starts export and shows progress dialog after acknowledged in initial dialog', function () {
      controller.startDeviceExport();
      expect($modal.open).toHaveBeenCalled();  // initial dialog
      fakeModal.close(); // user acks the export
      expect($modal.open).toHaveBeenCalled(); // progress dialog
      expect(DeviceExportService.exportDevices).toHaveBeenCalled();
      expect(controller.exporting).toBeTruthy();
    });

    it('does not export device data after cancelled in initial dialog', function () {
      controller.startDeviceExport();
      expect($modal.open).toHaveBeenCalled();
      fakeModal.dismiss(); // used cancels the export
      expect(DeviceExportService.exportDevices).not.toHaveBeenCalled();
      expect(controller.exporting).toBeFalsy();
    });

    it('exports status 100 indicates export progress finished', function () {
      controller.startDeviceExport();
      fakeModal.close();
      expect(controller.exporting).toBeTruthy();

      controller.exportStatus(100);
      expect(Notification.success).toHaveBeenCalledWith('spacesPage.export.deviceListReadyForDownload', 'spacesPage.export.exportCompleted');
      expect(controller.exporting).toBeFalsy();
    });

    it('export cancelled (for some reason) mid-flight closes the dialog and shows a toaster', function () {
      controller.startDeviceExport();
      fakeModal.close();
      expect(controller.exporting).toBeTruthy();

      controller.exportStatus(-1);
      expect(Notification.warning).toHaveBeenCalledWith('spacesPage.export.deviceExportFailedOrCancelled');
      expect(controller.exporting).toBeFalsy();
    });

  });

});
