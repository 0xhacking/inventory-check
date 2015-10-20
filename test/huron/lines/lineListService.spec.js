'use strict';

describe('Service: LineListService', function () {
  var $httpBackend, HuronConfig, LineListService;

  var lines = getJSONFixture('huron/json/lines/numbers.json');
  var count = getJSONFixture('huron/json/lines/count.json');
  var linesExport = getJSONFixture('huron/json/lines/numbersCsvExport.json');

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _HuronConfig_, _LineListService_) {
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    LineListService = _LineListService_;
  }));

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getLineList', function () {
    it('should use default search criteria', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?max=100&order=userid-asc&start=0').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'all').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set search criteria order=internalnumber-desc', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/userlineassociations?max=100&order=internalnumber-desc&start=0').respond(lines);
      LineListService.getLineList(0, 100, 'internalnumber', '-desc', '', 'all').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set search filter, search criteria', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?externalnumber=%25asuna%25&internalnumber=%25asuna%25&max=100&order=userid-asc&predicatejoinoperator=or&start=0&userid=%25asuna%25').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', 'asuna', 'all').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set seach criteria assignedlines=true', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?assignedlines=false&max=100&order=userid-asc&start=0').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'unassignedLines').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set seach criteria assignedlines=false', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?assignedlines=true&max=100&order=userid-asc&start=0').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'assignedLines').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });
  });

  describe('getCount', function () {
    it('should use default search criteria', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociationcounts').respond([count]);
      LineListService.getCount('').then(function (response) {
        expect(angular.equals(response, count)).toBe(true);
      });
    });

    it('should set search filter, search criteria', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociationcounts?externalnumber=%25asuna%25&internalnumber=%25asuna%25&predicatejoinoperator=or&userid=%25asuna%25').respond([count]);
      LineListService.getCount('asuna').then(function (response) {
        expect(angular.equals(response, count)).toBe(true);
      });
    });
  });

  it('should exportCSV', function () {
    $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?max=100&order=internalnumber-asc&start=1').respond(lines);
    $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?max=100&order=internalnumber-asc&start=101').respond([]);
    LineListService.exportCSV({})
      .then(function (response) {
        expect(response.length).toBe(linesExport.length);
      });
  });

});
