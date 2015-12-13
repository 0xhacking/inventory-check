'use strict';

describe('MediaServiceDescriptor', function () {
  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Service, $httpBackend, authinfo, $rootScope;
  var extensionEntitlements = ['squared-fusion-media'];
  var mediaAgentOrgIds = ['mediafusion'];

  beforeEach(function () {
    module(function ($provide) {
      authinfo = {
        getOrgId: sinon.stub()
      };
      authinfo.getOrgId.returns("12345");
      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function ($injector, _MediaServiceDescriptor_) {
    Service = _MediaServiceDescriptor_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should return the service enabled status', function (done) {
    $httpBackend
      .expect('GET', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services')
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

  it('should set service enabled', function () {
    var data = {
      "enabled": true
    };
    $httpBackend.expect('PATCH', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services/' + extensionEntitlements[0], data).respond(200, {});
    Service.setServiceEnabled(extensionEntitlements[0], true);
    $httpBackend.flush();
  });

  it('should set user identity org to media agent org id mapping', function () {
    var data = {
      "identityOrgId": "12345",
      "mediaAgentOrgIds": mediaAgentOrgIds
    };
    $httpBackend.expect('PUT', 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1/identity2agent', data).respond(204, {});
    Service.setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIds);
    $httpBackend.flush();
  });

  it('should return the user identity org to media agent org id mapping', function () {
    $httpBackend
      .expect('GET', 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1/identity2agent/' + authinfo.getOrgId())
      .respond(200, {
        statusCode: 0,
        identityOrgId: authinfo.getOrgId,
        mediaAgentOrgIds: mediaAgentOrgIds
      });
    Service.getUserIdentityOrgToMediaAgentOrgMapping();
    //expect(response.data.mediaAgentOrgIds).toEqual(mediaAgentOrgIds);
    $httpBackend.flush();
  });

});
