'use strict';

describe('Directive: aaTimeOutInvalid', function () {
  var $compile, $rootScope, $scope;
  var AAUiModelService, AutoAttendantCeMenuModelService;
  var element;

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa'
    }
  };

  var schedule = 'openHours';
  var index = '0';
  var menuId = 'menu1';

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.menuId = menuId;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());

  }));

  it('replaces the element with the appropriate content', function () {
    element = $compile("<aa-timeout-invalid aa-schedule='openHours' aa-menu-id='menu1' aa-index='0'></aa-timeout-invalid")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aaTimeoutInvalid");
  });
});
