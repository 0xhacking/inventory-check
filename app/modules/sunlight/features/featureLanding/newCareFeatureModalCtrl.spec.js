'use strict';

describe('Controller: NewCareFeatureModalCtrl', function () {

  beforeEach(angular.mock.module('Sunlight'));

  var $scope;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };

  beforeEach(inject(function ($rootScope, $controller, $state) {
    $scope = $rootScope.$new();

    spyOn($state, 'go');

    $controller('NewCareFeatureModalCtrl', {
      $scope: $scope,
      $modalInstance: modalFake
    });
  }));

  it("ok function call results in closing the care new feature Modal with the value chosen.", function () {
    var code = "Ch";
    $scope.ok(code);
    expect(modalFake.close).toHaveBeenCalledWith(code);
  });

  it("cancel function call results in dismissing the care new feature Modal.", function () {
    $scope.cancel();
    expect(modalFake.dismiss).toHaveBeenCalledWith("cancel");
  });
});
