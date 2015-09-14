'use strict';

describe('Controller: UserOverviewCtrl', function () {
  var controller, $scope, $httpBackend, $q, Config, Authinfo, Utils, Userservice, FeatureToggleService;

  var $stateParams, currentUser, updatedUser, getUserMe;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, $q, _Config_, _Authinfo_, _Utils_, _Userservice_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $q = $q;
    Config = _Config_;
    Authinfo = _Authinfo_;
    Utils = _Utils_;
    Userservice = _Userservice_;
    FeatureToggleService = _FeatureToggleService_;

    var deferred = $q.defer();
    deferred.resolve('true');
    currentUser = angular.copy(getJSONFixture('core/json/currentUser.json'));
    getUserMe = getJSONFixture('core/json/users/me.json');
    updatedUser = angular.copy(currentUser);

    $stateParams = {
      currentUser: currentUser
    };

    spyOn(Authinfo, 'getOrgId').and.returnValue(currentUser.meta.organizationID);
    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(currentUser, 200);
    });
    spyOn(FeatureToggleService, 'getFeaturesForUser').and.returnValue(deferred.promise);

    // eww
    var userUrl = Config.getScimUrl(Authinfo.getOrgId()) + '/' + currentUser.id;
    $httpBackend.whenGET(userUrl).respond(updatedUser);

    controller = $controller('UserOverviewCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      Config: Config,
      Authinfo: Authinfo,
      Userservice: Userservice,
      FeatureToggleService: FeatureToggleService
    });

    $scope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('init', function () {
    it('should reload the user data from identity response when user list is updated', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      updatedUser.entitlements.push('ciscouc');
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });

    it('should reload the user data from identity response when entitlements are updated', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      updatedUser.entitlements.push('ciscouc');
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });

    it('should set the title to displayName when user data is updated with displayName', function () {
      updatedUser.displayName = "Display Name";
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(controller.titleCard).toEqual("Display Name");
    });

    it('should reload the user data from identity response and set subTitleCard to title', function () {
      updatedUser.title = "Test";
      updatedUser.displayName = "Display Name";
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(controller.subTitleCard).toBe("Test");
    });

    it('should reload the user data from identity response and set title with givenName and FamilyName', function () {
      updatedUser.name = {
        givenName: "Given Name",
        familyName: "Family Name"
      };
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(controller.titleCard).toEqual("Given Name Family Name");
    });

    it('should reload the user data from identity response and set subTitleCard to addresses', function () {
      updatedUser.addresses.push({
        "locality": "AddressLine1"
      });
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(controller.subTitleCard).toBe(" AddressLine1 AddressLine1");

    });

    it('should reload the user data from identity when user list is updated with cloud-contact-center entitlement', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      updatedUser.entitlements.push('cloud-contact-center');
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });

    it('should reload the user data from identity when user list is updated with squared-syncup entitlement', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      updatedUser.entitlements.push('squared-syncup');
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });

    it('should reload user data from identity response when squared-syncup licenseID is updated', function () {
      updatedUser.entitlements.push('squared-syncup');
      updatedUser.licenseID.push('CF_xyz');
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.licenseID.length).toEqual(1);
    });

    it('should reload user data from identity response when contact center licenseID is updated', function () {
      updatedUser.entitlements.push('cloud-contact-center');
      updatedUser.licenseID.push('CC_xyz');
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.licenseID.length).toEqual(1);
    });

    it('should reload user data from identity response when communication licenseID is updated', function () {
      updatedUser.licenseID.push('CO_xyz');
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.licenseID.length).toEqual(1);
    });

    it('should reload user data from identity response when messaging licenseID is updated', function () {
      updatedUser.licenseID.push('MS_xyz');
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.licenseID.length).toEqual(1);
    });

  });

  describe('AuthCodeLink', function () {
    it('should load dropdown items when addGenerateAuthCodeLink method is called on controller', function () {
      controller.addGenerateAuthCodeLink();
      expect(controller.dropDownItems.length).toBe(1);
      expect(controller.dropDownItems[0].name).toBe("generateAuthCode");
      expect(controller.dropDownItems[0].text).toBe("usersPreview.generateActivationCode");
    });

    it('should find existing auth code link when addGenerateAuthCodeLink is called second time', function () {
      controller.addGenerateAuthCodeLink();
      expect(controller.dropDownItems.length).toBe(1);
    });

    it('GenerateAuthCodeLink should be removed when removeGenerateAuthCodeLink method is called on controller', function () {
      controller.removeGenerateAuthCodeLink();
      expect(controller.dropDownItems.length).toBe(0);
    });

  });

});
