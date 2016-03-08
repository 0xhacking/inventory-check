'use strict';

describe('orgService', function () {
  beforeEach(module('Core'));

  var q, deferred;

  var httpBackend, Orgservice, Auth, Authinfo, Config, Log;

  beforeEach(function () {
    module(function ($provide) {
      Auth = {
        setAccessToken: sinon.stub()
      };
      Authinfo = {
        getOrgId: function () {
          return 'bar';
        }
      };
      Config = {
        getAdminServiceUrl: function () {
          return '/adminService/';
        },
        getScomUrl: function () {
          return '/identityService';
        },
        getHerculesUrl: function () {
          return '/hercules';
        },
        entitlements: {
          huron: 'ciscouc',
          squared: 'webex-squared',
          fusion_uc: 'squared-fusion-uc',
          fusion_cal: 'squared-fusion-cal',
          mediafusion: 'squared-fusion-media',
          fusion_mgmt: 'squared-fusion-mgmt',
          room_system: 'spark-room-system',
          fusion_ec: 'squared-fusion-ec'
        }
      };
      Log = {
        debug: sinon.stub()
      };
      $provide.value('Auth', Auth);
      $provide.value('Authinfo', Authinfo);
      $provide.value('Config', Config);
      $provide.value('Log', Log);
    });
  });

  beforeEach(inject(function ($injector, _Orgservice_) {
    Orgservice = _Orgservice_;
    httpBackend = $injector.get('$httpBackend');
    httpBackend.when('GET', 'l10n/en_US.json').respond({});
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should successfully get an organization for a given orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId).respond(200, {});
    Orgservice.getOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an organization for a given orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId).respond(500, {});
    Orgservice.getOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should get an organization for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId).respond(200, {});
    Orgservice.getOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an organization for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId).respond(500, {});
    Orgservice.getOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get an admin organization for a given orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId).respond(200, {});
    Orgservice.getAdminOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an admin organization for a given orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId).respond(500, {});
    Orgservice.getAdminOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get an admin organization for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId).respond(200, {});
    Orgservice.getAdminOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an admin organization for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId).respond(500, {});
    Orgservice.getAdminOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get unlicensed users for random orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/unlicensedUsers').respond(200, {});
    Orgservice.getUnlicensedUsers(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get unlicensed users for random orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/unlicensedUsers').respond(500, {});
    Orgservice.getUnlicensedUsers(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get unlicensed users for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/unlicensedUsers').respond(200, {});
    Orgservice.getUnlicensedUsers(callback);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get unlicensed users for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/unlicensedUsers').respond(500, {});
    Orgservice.getUnlicensedUsers(callback);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should set setup done', function () {
    httpBackend.when('PATCH', Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/setup').respond(200, {});
    var response = Orgservice.setSetupDone();
    httpBackend.flush();
    expect(response).not.toBe(true);
  });

  it('should successfully set organization settings', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    var payload = {
      reportingSiteUrl: 'http://example.com',
      reportingSiteDesc: 'Description',
      helpUrl: 'http://example.com/help',
      isCiscoHelp: true,
      isCiscoSupport: false
    };
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId + '?disableCache=true').respond(200, {});
    httpBackend.when('PATCH', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/settings', payload).respond(200, {});
    Orgservice.setOrgSettings(orgId, payload, callback);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to set organization settings', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    var payload = {
      reportingSiteUrl: 'http://example.com',
      reportingSiteDesc: 'Description',
      helpUrl: 'http://example.com/help',
      isCiscoHelp: true,
      isCiscoSupport: false
    };
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId + '?disableCache=true').respond(200, {});
    httpBackend.when('PATCH', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/settings', payload).respond(500, {});
    Orgservice.setOrgSettings(orgId, payload, callback);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should overwrite current settings with new settings', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    var currentSettings = {
      'orgSettings': ['{"reportingSiteUrl": "http://example.com", "isCiscoSupport": true}']
    };
    var settings = {
      'reportingSiteUrl': 'https://helpMeRhonda.ciscospark.com'
    };
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId + '?disableCache=true').respond(200, currentSettings);

    // Assert PATCH data overwrites current reporting url with new reporting url
    httpBackend.expect('PATCH', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/settings', {
      'reportingSiteUrl': 'https://helpMeRhonda.ciscospark.com',
      'isCiscoSupport': true
    }).respond(200, {});

    Orgservice.setOrgSettings(orgId, settings, callback);

    expect(httpBackend.flush).not.toThrow();
  });

  it('should get Acknowledged', function () {
    var items = [{
      "id": "squared-fusion-cal",
      "enabled": true,
      "acknowledged": true
    }, {
      "id": "squared-fusion-mgmt",
      "enabled": true,
      "acknowledged": true
    }, {
      "id": "squared-fusion-uc",
      "enabled": true,
      "acknowledged": false
    }, {
      "id": "squared-fusion-media",
      "enabled": false,
      "acknowledged": false
    }, {
      "id": "squared-fusion-ec",
      "enabled": true,
      "acknowledged": true
    }];
    httpBackend.when('GET', Config.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/services').respond(200, items);
    var response = Orgservice.getHybridServiceAcknowledged();
    httpBackend.flush();
    angular.forEach(response.items, function (items) {
      if (items.id === Config.entitlements.fusion_cal) {
        expect(items.acknowledged).toBe(true);
      } else if (items.id === Config.entitlements.fusion_uc) {
        expect(items.acknowledged).toBe(false);
      } else if (items.id === Config.entitlements.fusion_ec) {
        expect(items.acknowledged).toBe(true);
      }
    });
  });

  it('should set Acknowledged', function () {
    var data = {
      "acknowledged": true
    };
    httpBackend.when('PATCH', Config.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/' + Config.entitlements.fusion_cal, data).respond(200, {});
    Orgservice.setHybridServiceAcknowledged('calendar-service');
    expect(httpBackend.flush).not.toThrow();
  });

  it('should verify that a proper setting is passed to setEftSetting call', function () {
    Orgservice.setEftSetting().catch(function (response) {
      expect(response).toBe('A proper EFT setting and organization ID is required.');
    });

    Orgservice.setEftSetting('false').catch(function (response) {
      expect(response).toBe('A proper EFT setting and organization ID is required.');
    });

    Orgservice.getEftSetting().catch(function (response) {
      expect(response).toBe('An organization ID is required.');
    });
  });

  it('should get the EFT setting for the org', function () {
    var currentOrgId = '555';
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + currentOrgId + '/settings/eft').respond(200, {
      isEFT: false
    });
    Orgservice.getEftSetting(currentOrgId).then(function (response) {
      expect(response.data.isEFT).toBe(false);
    });
    httpBackend.flush();
  });

  it('should fail to get the EFT setting for the org', function () {
    var currentOrgId = '555';
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + currentOrgId + '/settings/eft').respond(404, {});
    Orgservice.getEftSetting(currentOrgId).catch(function (response) {
      expect(response.status).toBe(404);
    });
    httpBackend.flush();
  });

  it('should successfully set the EFT setting for the org', function () {
    var currentOrgId = '555';
    var isEFT = true;
    httpBackend.when('PUT', Config.getAdminServiceUrl() + 'organizations/' + currentOrgId + '/settings/eft').respond(200, {});
    Orgservice.setEftSetting(isEFT, currentOrgId).then(function (response) {
      expect(response.status).toBe(200);
    });
    httpBackend.flush();
  });

  it('should fail to set the EFT setting for the org', function () {
    var currentOrgId = '555';
    var isEFT = true;
    httpBackend.when('PUT', Config.getAdminServiceUrl() + 'organizations/' + currentOrgId + '/settings/eft').respond(404, {});
    Orgservice.setEftSetting(isEFT, currentOrgId).catch(function (response) {
      expect(response.status).toBe(404);
    });
    httpBackend.flush();
  });

});
