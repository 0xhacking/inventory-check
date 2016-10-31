'use strict';

describe('Controller: DevicesCtrl', function () {
  var $scope, $controller, controller, $httpBackend, $timeout;
  var CsdmConfigService, AccountOrgService;

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies($rootScope, _$timeout_, _$controller_, _$httpBackend_, _CsdmConfigService_, _AccountOrgService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    CsdmConfigService = _CsdmConfigService_;
    AccountOrgService = _AccountOrgService_;
  }

  function initSpies() {
    // TODO - eww this is wrong - Just make this init right now
    $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/devices/?type=huron').respond([]);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/nonExistingDevices').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkDisplayName=false&checkOnline=false').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices').respond(200);
    $httpBackend.expectGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkDisplayName=false&checkOnline=false');
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/codes').respond(200);
    //$httpBackend.expectGET(CsdmConfigService.getUrl() + '/organization/null/devices').respond(200);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);

    spyOn(AccountOrgService, 'getAccount').and.returnValue({
      success: _.noop
    });
  }

  function initController() {
    controller = $controller('DevicesCtrl', {
      $scope: $scope
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

  //function visitState(currentStateName, allStates, visitedStates) {
  //  if (visitedStates[currentStateName]) {
  //    return;
  //  }
  //  visitedStates[currentStateName] = true;
  //  var state = allStates[currentStateName];
  //  expect(state).toBeTruthy(currentStateName);
  //  if (state.nextOptions) {
  //    _.each(state.nextOptions, function (next) {
  //      visitState(next, allStates, visitedStates);
  //    });
  //  }
  //  if (state.next) {
  //    visitState(state.next, allStates, visitedStates);
  //  }
  //}

  //describe("addDeviceFlow.chooseSharedSpace", function() {
  //  var responsible = {
  //    deviceType: undefined
  //  };
  //
  //  function verifyResponsiblesAreSet() {
  //    _.forEach(responsible, function(resp) {
  //      expect(resp).toBe(true, resp);
  //    });
  //  }
  //
  //  it("clicking on desk phone", function() {
  //    //call functions that click desk phone
  //    verifyResponsiblesAreSet();
  //  });
  //
  //  it("clicking on room system", function() {
  //    //call functions that click room system
  //    verifyResponsiblesAreSet();
  //  });
  //});

  //it('wizards should visit each state', function () {
  //  _.forEach([controller.wizardWithPlaces(), controller.wizardWithoutPlaces()], function (wizard) {
  //    var visitedStates = {};
  //    _.map(Object.keys(wizard.wizardState), function (s) {
  //      visitedStates[s] = false;
  //    });
  //    visitState(wizard.currentStateName, wizard.wizardState, visitedStates);
  //    _.forEach(visitedStates, function (visited, state) {
  //      expect(visited).toBe(true, state);
  //    });
  //  });
  //});
});
