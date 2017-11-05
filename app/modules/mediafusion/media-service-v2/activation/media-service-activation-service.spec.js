'use strict';

describe('MediaServiceActivationV2', function () {
  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module('Hercules'));

  // instantiate service
  var Service, $q, $httpBackend, authinfo, Notification, FusionClusterService;
  var extensionEntitlements = ['squared-fusion-media'];
  //var serviceId = "squared-fusion-media";
  var mediaAgentOrgIds = ['mediafusion'];
  var serviceId = "squared-fusion-media";

  beforeEach(function () {
    angular.mock.module(function ($provide) {
      authinfo = {
        getOrgId: sinon.stub()
      };
      authinfo.getOrgId.returns("12345");
      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function (_$q_, _Notification_, $injector, _MediaServiceActivationV2_, _FusionClusterService_) {
    //$rootScope = _$rootScope_;
    Service = _MediaServiceActivationV2_;
    FusionClusterService = _FusionClusterService_;
    $q = _$q_;
    $httpBackend = $injector.get('$httpBackend');
    Notification = _Notification_;
  }));

  it('should return the service enabled status', function (done) {
    $httpBackend
      .when('GET', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services')
      .respond({
        items: [{
          id: extensionEntitlements[0],
          enabled: true,
          acknowledged: false
        }]
      });
    Service.isServiceEnabled(extensionEntitlements[0], function (error, enabled) {
      expect(enabled).toEqual(true);
      done();
    });
    $httpBackend.flush();
  });

  it('should return the service enabled status when service is undefined', function (done) {
    $httpBackend
      .when('GET', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services')
      .respond({
        items: [{
          enabled: true,
          acknowledged: false
        }]
      });
    Service.isServiceEnabled(extensionEntitlements[0], function (error, enabled) {
      expect(enabled).not.toBeDefined();
      done();
    });
    $httpBackend.flush();
  });

  it('should handle the error when the promise call fails', function (done) {
    $httpBackend
      .when('GET', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services')
      .respond(500, null);
    Service.isServiceEnabled(extensionEntitlements[0], function (error, enabled) {
      expect(enabled).not.toBeDefined();
      done();
    });
    $httpBackend.flush();
  });

  it('should set service enabled', function () {
    var data = {
      "enabled": true
    };
    $httpBackend.when('PATCH', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services/' + extensionEntitlements[0], data).respond(200, {});
    Service.setServiceEnabled(extensionEntitlements[0], true);
    expect($httpBackend.flush).not.toThrow();
  });

  it('should set service acknowledged', function () {
    var data = {
      "acknowledged": true
    };
    $httpBackend.when('PATCH', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services/' + extensionEntitlements[0], data).respond(200, {});
    Service.setServiceAcknowledged(extensionEntitlements[0], true);
    expect($httpBackend.flush).not.toThrow();
  });

  it('should set user identity org to media agent org id mapping', function () {
    var data = {
      "identityOrgId": "12345",
      "mediaAgentOrgIds": mediaAgentOrgIds
    };
    $httpBackend.when('PUT', 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1/identity2agent', data).respond(204, {});
    Service.setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIds);
    expect($httpBackend.flush).not.toThrow();
  });

  it('should return the user identity org to media agent org id mapping', function (done) {

    $httpBackend
      .expect('GET', 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1/identity2agent/' + authinfo.getOrgId())
      .respond(200, {
        statusCode: 0,
        identityOrgId: authinfo.getOrgId(),
        mediaAgentOrgIds: mediaAgentOrgIds
      });
    Service.getUserIdentityOrgToMediaAgentOrgMapping().then(done);
    expect($httpBackend.flush).not.toThrow();
  });

  it('MediaServiceActivationV2 setServiceEnabled should be called for enableMediaService', function () {
    $httpBackend.when('GET', 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1/identity2agent/12345').respond({
      statusCode: 0,
      identityOrgId: "5632f806-ad09-4a26-a0c0-a49a13f38873",
      mediaAgentOrgIds: ["5632f806-ad09-4a26-a0c0-a49a13f38873", "mocked"]
    });
    $httpBackend.when('PATCH', /^\w+.*/).respond({});
    $httpBackend.when('PUT', /^\w+.*/).respond({});
    spyOn(Service, 'setServiceEnabled').and.returnValue($q.when({}));
    Service.enableMediaService(serviceId);
    expect($httpBackend.flush).not.toThrow();
  });
  it('enableOrpheusForMediaFusion should handle the error when getUserIdentityOrgToMediaAgentOrgMapping promise fails', function () {
    $httpBackend.when('GET', /^\w+.*/).respond(500, null);
    $httpBackend.when('PUT', /^\w+.*/).respond(500, null);
    $httpBackend.when('PATCH', /^\w+.*/).respond({});
    spyOn(Service, 'setServiceEnabled').and.callThrough();
    spyOn(Service, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.reject({}));
    Service.enableMediaService(serviceId);
    expect($httpBackend.flush).not.toThrow();
  });

  it('MediaServiceActivationV2 isServiceEnabled should be called for getMediaServiceState', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({});
    spyOn(FusionClusterService, 'serviceIsSetUp').and.returnValue($q.when(true));
    Service.getMediaServiceState();
    $httpBackend.verifyNoOutstandingExpectation();
    expect(FusionClusterService.serviceIsSetUp).toHaveBeenCalled();
  });
  it('MediaServiceActivationV2 isServiceEnabled should not be called for getMediaServiceState when isMediaServiceEnabled is set to true', function () {
    Service.setisMediaServiceEnabled(true);
    spyOn(FusionClusterService, 'serviceIsSetUp').and.callThrough();
    Service.getMediaServiceState();
    expect(FusionClusterService.serviceIsSetUp).not.toHaveBeenCalled();
  });
  it('MediaServiceActivationV2 isServiceEnabled should not be called for getMediaServiceState when isMediaServiceEnabled is set to false', function () {
    Service.setisMediaServiceEnabled(false);
    spyOn(FusionClusterService, 'serviceIsSetUp').and.callThrough();
    Service.getMediaServiceState();
    expect(FusionClusterService.serviceIsSetUp).not.toHaveBeenCalled();
  });
  it('MediaServiceActivationV2 deleteUserIdentityOrgToMediaAgentOrgMapping should successfully delete the OrgMapping', function () {
    $httpBackend.when('DELETE', 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1/identity2agent').respond(204);
    Service.deleteUserIdentityOrgToMediaAgentOrgMapping();
  });
  it('Should notify about activation failure when enableMediaService fails', function () {
    $httpBackend.when('PATCH', /^\w+.*/).respond(500, null);
    spyOn(Service, 'setServiceEnabled').and.callThrough();
    spyOn(Notification, 'error');
    Service.enableMediaService(serviceId);
    $httpBackend.flush();
    expect(Notification.error).toHaveBeenCalled();
  });
  it('should disable orpheus for mediafusion org', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({
      statusCode: 0,
      identityOrgId: "5632f806-ad09-4a26-a0c0-a49a13f38873",
      mediaAgentOrgIds: ["5632f806-ad09-4a26-a0c0-a49a13f38873", "squared"]
    });
    $httpBackend.when('DELETE', /^\w+.*/).respond({});
    spyOn(Notification, 'error');
    spyOn(Service, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when({}));
    spyOn(Service, 'deleteUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when({}));
    Service.disableOrpheusForMediaFusion();
    expect($httpBackend.flush).not.toThrow();
    expect(Notification.error).not.toHaveBeenCalled();
  });
  it('should notify error when deleteUserIdentityOrgToMediaAgentOrgMapping fails for disableOrpheusForMediaFusion', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({
      statusCode: 0,
      identityOrgId: "5632f806-ad09-4a26-a0c0-a49a13f38873",
      mediaAgentOrgIds: ["5632f806-ad09-4a26-a0c0-a49a13f38873", "squared"]
    });
    $httpBackend.when('DELETE', /^\w+.*/).respond(500, null);
    spyOn(Notification, 'error');
    spyOn(Service, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when({}));
    spyOn(Service, 'deleteUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when({}));
    Service.disableOrpheusForMediaFusion();
    $httpBackend.flush();
    expect(Notification.error).toHaveBeenCalled();
  });
  it('setUserIdentityOrgToMediaAgentOrgMapping should be called for disableOrpheusForMediaFusion', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({
      statusCode: 0,
      identityOrgId: "5632f806-ad09-4a26-a0c0-a49a13f38873",
      mediaAgentOrgIds: ["5632f806-ad09-4a26-a0c0-a49a13f38873", "mocked", "fusion"]
    });
    $httpBackend.when('PUT', /^\w+.*/).respond({});
    spyOn(Notification, 'error');
    spyOn(Service, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when({}));
    spyOn(Service, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when({}));
    Service.disableOrpheusForMediaFusion();
    expect($httpBackend.flush).not.toThrow();
    expect(Notification.error).not.toHaveBeenCalled();
  });
  it('should notify error when setUserIdentityOrgToMediaAgentOrgMapping fails for disableOrpheusForMediaFusion', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({
      statusCode: 0,
      identityOrgId: "5632f806-ad09-4a26-a0c0-a49a13f38873",
      mediaAgentOrgIds: ["5632f806-ad09-4a26-a0c0-a49a13f38873", "mocked", "fusion"]
    });
    $httpBackend.when('PUT', /^\w+.*/).respond(500, null);
    spyOn(Notification, 'error');
    spyOn(Service, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when({}));
    spyOn(Service, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when({}));
    Service.disableOrpheusForMediaFusion();
    $httpBackend.flush();
    expect(Notification.error).toHaveBeenCalled();
  });
  it('deactivateHybridMedia should be called successfully', function () {
    $httpBackend.when('DELETE', /^\w+.*/).respond({
      statusCode: 204
    });
    Service.deactivateHybridMedia();
    expect($httpBackend.flush).not.toThrow();
  });
});
