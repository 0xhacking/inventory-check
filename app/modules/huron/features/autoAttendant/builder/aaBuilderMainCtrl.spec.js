'use strict';

describe('Controller: AABuilderMainCtrl', function () {
  var controller, Notification, AutoAttendantCeService;
  var AAUiModelService, AAModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService;
  var $rootScope, $scope, $q, $translate, $stateParams;

  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var cesWithNumber = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');
  var aCe = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');
  var a3LaneCe = getJSONFixture('huron/json/autoAttendant/a3LaneCe.json');
  var rawCeInfo = {
    "callExperienceName": "AAA2",
    "callExperienceURL": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b",
    "assignedResources": [{
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3b",
      "type": "directoryNumber",
      "trigger": "incomingCall"
    }]
  };

  var aaModel = {};

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var _resource = AutoAttendantCeInfoModelService.newResource();
      _resource.setId(rawCeInfo.assignedResources[j].id);
      _resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      _resource.setType(rawCeInfo.assignedResources[j].type);
      if (angular.isDefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$q_, _$stateParams_, $controller, _$translate_, _Notification_,
    _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_, _AAUiModelService_, _AAModelService_, _AutoAttendantCeService_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $scope = $rootScope.$new();
    $scope.$dismiss = function () {
      return true;
    };
    $translate = _$translate_;
    $stateParams = _$stateParams_;
    AAUiModelService = _AAUiModelService_;
    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    Notification = _Notification_;

    // aaModel.dataReadyPromise = $q(function () {});
    $stateParams.aaName = '';

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AAUiModelService, 'initUiModel');
    spyOn(AutoAttendantCeInfoModelService, 'getCeInfosList').and.returnValue($q.when($stateParams.aaName));

    controller = $controller('AABuilderMainCtrl as vm', {
      $scope: $scope,
      $stateParams: $stateParams
    });
    $scope.$apply();
  }));

  afterEach(function () {

  });

  describe('saveAARecords', function () {

    beforeEach(function () {
      spyOn(AutoAttendantCeService, 'createCe').and.returnValue($q.when(angular.copy(rawCeInfo)));
      spyOn(AutoAttendantCeService, 'updateCe').and.returnValue($q.when(angular.copy(rawCeInfo)));
      spyOn(Notification, 'success');
      spyOn(Notification, 'error');
      spyOn($scope.vm, 'saveUiModel');
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;
    });

    it('should save a new aaRecord successfully', function () {
      controller.saveAARecords();
      $scope.$apply();

      expect(AutoAttendantCeService.createCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(angular.equals(aaModel.aaRecords[0], rawCeInfo)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0], ceInfo)).toEqual(true);

      expect(Notification.success).toHaveBeenCalledWith('autoAttendant.successCreateCe', jasmine.any(Object));
    });

    it('should update an existing aaRecord successfully', function () {
      aaModel.aaRecords.push(rawCeInfo);

      controller.saveAARecords();
      $scope.$apply();

      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(angular.equals(aaModel.aaRecords[0], rawCeInfo)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0], ceInfo)).toEqual(true);

      expect(Notification.success).toHaveBeenCalledWith('autoAttendant.successUpdateCe', jasmine.any(Object));
    });

  });

  describe('selectAA', function () {

    var readCe;

    beforeEach(function () {
      readCe = spyOn(AutoAttendantCeService, 'readCe').and.returnValue($q.when(angular.copy(aCe)));
      spyOn($scope.vm, 'populateUiModel');
      spyOn(Notification, 'error');
      spyOn(AAModelService, 'newAARecord').and.callThrough();
    });

    it('should create a new aaRecord successfully when no name is given and vm.aaModel.aaRecord is undefined', function () {
      $scope.vm.aaModel = {};
      controller.selectAA('');
      $scope.$apply();

      expect(AAModelService.newAARecord).toHaveBeenCalled();
      expect($scope.vm.populateUiModel).toHaveBeenCalled();
      expect(AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(Notification.error).not.toHaveBeenCalled();
    });

    it('should be able to read an existing new aaRecord successfully when no name is given', function () {
      // when aaModel.aaRecord is defined
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = {};
      controller.selectAA('');
      $scope.$apply();

      // $scope.vm.aaModel should not be initialized again with a new AARecord
      expect(AAModelService.newAARecord).not.toHaveBeenCalled();
      expect(AutoAttendantCeService.readCe).not.toHaveBeenCalled();
      expect(Notification.error).not.toHaveBeenCalled();

      expect($scope.vm.populateUiModel).toHaveBeenCalled();
    });

    it('should be able to read an existing aaRecord successfully when a name is given', function () {
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecords = ces;
      controller.selectAA('AA2');
      $scope.$apply();

      expect(AAModelService.newAARecord).not.toHaveBeenCalled();
      expect(Notification.error).not.toHaveBeenCalled();

      expect($scope.vm.aaModel.aaRecord.callExperienceName).toEqual(aCe.callExperienceName);
      expect($scope.vm.populateUiModel).toHaveBeenCalled();
    });

    it('should return error when the backend return 500 error', function () {
      readCe.and.returnValue(
        $q.reject({
          status: 500
        })
      );
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecords = ces;
      controller.selectAA('AA2');
      $scope.$apply();

      expect(Notification.error).toHaveBeenCalled();
      expect(AAModelService.newAARecord).not.toHaveBeenCalled();
      expect($scope.vm.populateUiModel).not.toHaveBeenCalled();
    });
  });

  describe('populateUiModel', function () {

    it('should initialize new openHours, closedHours and holidays menus successfully if they do not exist', function () {
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = aCe;
      $scope.vm.ui = {};
      controller.populateUiModel();

      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(false);
      expect($scope.vm.ui.isHolidays).toEqual(false);
    });

    it('should build openHours, closedHours and holidays menus successfully from model', function () {
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = a3LaneCe;
      $scope.vm.ui = {};
      controller.populateUiModel();

      expect($scope.vm.ui.isOpenHours).toEqual(true);
      expect($scope.vm.ui.isClosedHours).toEqual(true);
      expect($scope.vm.ui.isHolidays).toEqual(true);
    });

  });

  describe('saveUiModel', function () {

    beforeEach(function () {
      spyOn(AutoAttendantCeInfoModelService, 'setCeInfo');
      spyOn(AutoAttendantCeMenuModelService, 'updateCombinedMenu');
      spyOn(AutoAttendantCeMenuModelService, 'newCeMenu').and.callThrough();
      $scope.vm.aaModel = {};
      $scope.vm.aaModel.aaRecord = {};
      $scope.vm.ui = {};
      $scope.vm.ui.ceInfo = ce2CeInfo(rawCeInfo);
    });

    it('should write UI CeInfo into model', function () {
      controller.saveUiModel();

      expect(AutoAttendantCeInfoModelService.setCeInfo).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, $scope.vm.ui.ceInfo);
    });

    it('should write openHours menu into model', function () {
      $scope.vm.ui.isOpenHours = true;
      $scope.vm.ui.isClosedHours = false;
      $scope.vm.ui.isHolidayss = false;
      $scope.vm.ui.openHours = {};
      controller.saveUiModel();

      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'openHours', $scope.vm.ui.openHours);
    });

    it('should write closedHours menu into model', function () {
      $scope.vm.ui.isOpenHours = false;
      $scope.vm.ui.isClosedHours = true;
      $scope.vm.ui.isHolidays = false;
      $scope.vm.ui.closedHours = {};
      controller.saveUiModel();

      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'closedHours', $scope.vm.ui.closedHours);
    });

    it('should write holidays menu into model', function () {
      $scope.vm.ui.isOpenHours = false;
      $scope.vm.ui.isClosedHours = false;
      $scope.vm.ui.isHolidays = true;
      $scope.vm.ui.holidays = {};
      controller.saveUiModel();

      expect(AutoAttendantCeMenuModelService.updateCombinedMenu).toHaveBeenCalledWith($scope.vm.aaModel.aaRecord, 'holidays', $scope.vm.ui.holidays);
    });

  });
});
