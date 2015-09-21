/**
 * Created by shailesi on 20/08/15.
 */

"use strict";

describe(' sunlightConfigService', function () {
  var sunlightConfigService, $httpBackend, $rootScope, Config, sunlightUserConfigUrl, userData, userId, orgId;
  var errorData = {
    'errorType': 'Internal Server Error'
  };

  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_SunlightConfigService_, _$httpBackend_, _Config_) {
    sunlightConfigService = _SunlightConfigService_;
    $httpBackend = _$httpBackend_;
    Config = _Config_;
    sunlightUserConfigUrl = Config.getSunlightConfigServiceUrl() + "/user/";
    userData = getJSONFixture('sunlight/json/sunlightTestUser.json');
    userId = '111';
    orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
  }));

  it('should get userInfo for a given userId', function () {

    $httpBackend.whenGET(sunlightUserConfigUrl + userId).respond(200, userData);

    sunlightConfigService.getUserInfo(userId).then(function (response) {
      expect(response.data.orgId).toBe(orgId);
      expect(response.data.userId).toBe(userId);
    });
    $httpBackend.flush();

  });

  it('should fail to get userInfo for a given userId when there is an http error', function () {
    $httpBackend.whenGET(sunlightUserConfigUrl + userId).respond(500, errorData);

    sunlightConfigService.getUserInfo(userId).then(function (response) {}, function (response) {
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();

  });

  it('should fail to get userInfo when userId is not defined', function () {
    sunlightConfigService.getUserInfo(undefined).then(function (data) {}, function (data) {
      expect(data).toBe('usedId cannot be null or undefined');
    });
  });

  it('should update userInfo in sunlight config service', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));

    $httpBackend.whenPUT(sunlightUserConfigUrl + userId).respond(200, {});

    sunlightConfigService.updateUserInfo(userInfo, userId).then(function (response) {
      expect(response.status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should fail to update userInfo in sunlight config service when there is an http error', function () {
    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));
    $httpBackend.whenPUT(sunlightUserConfigUrl + userId).respond(500, errorData);
    sunlightConfigService.updateUserInfo(userInfo, userId).then(function (response) {}, function (response) {
      expect(JSON.stringify(response.data)).toBe(JSON.stringify(errorData));
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

});
