(function () {
  'use strict';

  describe('Controller: drLoginForwardController', function () {
    var controller, $controller, $cookies, $window, $translate, $q, $scope, DigitalRiverService, Userservice;

    var getUserMe = getJSONFixture('core/json/users/meDR.json');
    var getUserAuthTokenJson = getJSONFixture('core/json/users/authtoken.json');

    beforeEach(module('Core'));
    beforeEach(module('Huron'));

    beforeEach(inject(function (_$controller_, _$translate_, _$cookies_, $rootScope, _Userservice_, _DigitalRiverService_, _$q_) {
      $controller = _$controller_;
      $window = {location:{}};
      $translate = _$translate_;
      $cookies = _$cookies_;
      Userservice = _Userservice_;
      DigitalRiverService = _DigitalRiverService_;
      $q = _$q_;
      $scope = $rootScope.$new();

      //spyOn(Userservice, 'getUser').and.returnValue($q.when(getUserMe));

      spyOn(Userservice, 'getUser').and.callFake(function (status, callback) {
        callback(getUserMe, 200);
      });

      spyOn(DigitalRiverService, 'getUserAuthToken').and.returnValue($q.when(getUserAuthTokenJson));

    }));

    function initController() {
      controller = $controller('drLoginForwardController', {
        $window: $window,
        $cookies: $cookies,
        $translate: $translate,
        DigitalRiverService: DigitalRiverService,
        Userservice: Userservice
      });

    }

    describe('should return userauthtoken', function () {
      beforeEach(function () {
        initController();
      });

      it('should return userauthtoken', function () {
        expect(Userservice.getUser).toHaveBeenCalled();
        $scope.$apply();
        expect(DigitalRiverService.getUserAuthToken).toHaveBeenCalled();
        expect($cookies.atlasDrCookie).toEqual('RkpqykhUQJxNcKZ8TeG7Tt4cwa7WAsdKHfGftERvsDX7CeQlBP/UHB8638AiO8kiFMtEVOgyNCvKH9ljAEb38g==');
        expect($window.location.href).toContain('www.digitalriver.com');
      });
    });



    describe('should have unexpected error', function () {
      beforeEach(function () {
        DigitalRiverService.getUserAuthToken.and.returnValue($q.reject());
        initController();
      });

      it('should have unexpected error', function () {
        expect(Userservice.getUser).toHaveBeenCalled();
        $scope.$apply();
        expect(DigitalRiverService.getUserAuthToken).toHaveBeenCalled();
        expect(controller.error).toEqual('digitalRiver.validation.unexpectedError');
      });
    }); 

  });

})();
