'use strict';

describe('Controller: CallParkDetailCtrl', function () {
  var controller, $scope, $modalInstance, $q, CallPark;

  beforeEach(module('uc.callpark'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _CallPark_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    CallPark = _CallPark_;

    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);
    spyOn(CallPark, 'create').and.returnValue($q.when());
    spyOn(CallPark, 'createByRange').and.returnValue($q.when());

    controller = $controller('CallParkDetailCtrl', {
      $scope: $scope,
      $modalInstance: $modalInstance,
      CallPark: CallPark
    });

    $scope.$apply();
  }));

  describe('addCallPark', function () {
    it('should close modal on success', function () {
      controller.addCallPark();
      $scope.$apply();
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss modal on error', function () {
      CallPark.create.and.returnValue($q.reject());
      controller.addCallPark();
      $scope.$apply();
      expect($modalInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('addCallParkByRange', function () {
    it('should close modal on success', function () {
      controller.addCallParkByRange();
      $scope.$apply();
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss modal on error', function () {
      CallPark.createByRange.and.returnValue($q.reject());
      controller.addCallParkByRange();
      $scope.$apply();
      expect($modalInstance.dismiss).toHaveBeenCalled();
    });
  });

});
