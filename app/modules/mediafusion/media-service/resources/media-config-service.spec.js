'use strict';

describe('MediaConfigService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service, win;
  var rootPath;

  beforeEach(function () {
    module(function ($provide) {
      win = {
        location: {
          search: ''
        },
        document: window.document
      };
      $provide.value('$window', win);
    });
  });

  beforeEach(inject(function ($injector, _MediaConfigService_, Config) {
    Service = _MediaConfigService_;
    rootPath = Config.getHerculesUrl();
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
