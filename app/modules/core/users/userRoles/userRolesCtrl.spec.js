'use strict';

describe('Controller: UserRolesCtrl', function () {
  var controller, rootScope, $scope, $stateParams, Authinfo, Orgservice, $controller;
  var fakeUserJSONFixture = getJSONFixture('core/json/sipTestFakeUser.json');
  var currentUser = fakeUserJSONFixture.fakeUser1;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Squared'));
  beforeEach(module('Messenger'));

  beforeEach(inject(function ($rootScope, _$stateParams_, _$controller_, _Authinfo_, _Orgservice_) {
    $scope = $rootScope.$new();
    Orgservice = _Orgservice_;
    $controller = _$controller_;
    Authinfo = _Authinfo_;
    $stateParams = _$stateParams_;
    $stateParams.currentUser = currentUser;

    spyOn(Authinfo, 'getOrgId').and.returnValue('we23f24-4f3f4f-cc7af705-6583-32r3r23r');
    spyOn(Authinfo, 'getUserId').and.returnValue('cc7af705-6583-4f58-b0b6-ea75df64da7e');
    spyOn(Orgservice, 'getOrgCacheOption').and.callFake(function (callback) {
      callback({});
    });
  }));

  function initController() {
    controller = $controller('UserRolesCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }

  describe('UserRolesCtrl Initialization: ', function () {
    beforeEach(initController);

    it('should initialize the UserRolesCtrl controller', function () {
      expect(controller).toBeDefined();
    });
  });

  describe('Setting of user SIP Address: ', function () {
    beforeEach(initController);

    it('should set type cloud-calling and primary SIP Address to $scope.sipAddr', function () {
      expect($scope.sipAddr).toEqual(fakeUserJSONFixture.fakeUser1.sipAddresses[0].value);
    });
  });

  describe('Setting of user SIP Address for another user: ', function () {
    beforeEach(function () {
      $stateParams.currentUser = fakeUserJSONFixture.fakeUser2;
      initController();
    });

    it('should set type cloud-calling SIP Address to $scope.sipAddr', function () {
      expect($scope.sipAddr).toEqual(fakeUserJSONFixture.fakeUser2.sipAddresses[0].value);
    });
  });
});
