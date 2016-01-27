'use strict';

describe('RedirectTargetService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var service;
  var httpBackend;

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", {
      getOrgId: function () {
        return "foo";
      }
    });
    $provide.value("ConfigService", {
      getUrl: function () {
        return "http://server";
      }
    });
  }));

  beforeEach(inject(function (RedirectTargetService, $httpBackend) {
    service = RedirectTargetService;
    httpBackend = $httpBackend;
    httpBackend.whenGET('l10n/en_US.json').respond({});
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should post to the correct hercules endpoint', function () {
    var url = "http://server/organizations/foo/allowedRedirectTargets";
    var body = {
      hostname: "hostname",
      ttlInSeconds: 60 * 60 * 1
    };
    httpBackend.expectPOST(url, body).respond(200);

    service.addRedirectTarget("hostname");
    httpBackend.flush();
  });
});
