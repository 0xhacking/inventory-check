'use strict';

describe('MediaConfigServiceV2', function () {
  beforeEach(angular.mock.module('Mediafusion'));

  var Service;
  var rootPath;

  beforeEach(inject(function (_MediaConfigServiceV2_, UrlConfig) {
    Service = _MediaConfigServiceV2_;
    rootPath = UrlConfig.getHerculesUrl();
  }));

  it('should return the correct url', function () {
    expect(Service.getUrl()).toBe(rootPath);
  });

  it('should return uss url', function () {
    expect(Service.getUSSUrl()).toBe('https://uss-integration.wbx2.com/uss/api/v1');
  });

  it('should return calliope url', function () {
    expect(Service.getCalliopeUrl()).toBe('https://calliope-integration.wbx2.com/calliope/api/authorization/v1');
  });

});
