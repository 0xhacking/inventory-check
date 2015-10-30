'use strict';

describe('Controller: aaBuilderNameCtrl', function () {
  var controller, Notification, AutoAttendantCeService;
  var AAModelService, AutoAttendantCeInfoModelService;
  var $rootScope, $scope, $q, $translate, $stateParams;

  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var cesWithNumber = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');
  var aCe = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');
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

  var listCesSpy;
  var saveCeSpy;

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
    _AutoAttendantCeInfoModelService_, _AAModelService_, _AutoAttendantCeService_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $scope = $rootScope;
    $scope.$dismiss = function () {
      return true;
    };

    $translate = _$translate_;
    $stateParams = _$stateParams_;
    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    Notification = _Notification_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

    listCesSpy = spyOn(AutoAttendantCeService, 'listCes').and.returnValue($q.when(angular.copy(ces)));

    controller = $controller('aaBuilderNameCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));

  afterEach(function () {

  });

  describe('saveAARecord', function () {

    beforeEach(function () {
      saveCeSpy = spyOn(AutoAttendantCeService, 'createCe').and.returnValue($q.when(angular.copy(rawCeInfo)));
      spyOn(AutoAttendantCeService, 'updateCe').and.returnValue($q.when(angular.copy(rawCeInfo)));
      spyOn(Notification, 'error');
      spyOn(Notification, 'success');
      spyOn(AutoAttendantCeInfoModelService, 'setCeInfo');
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;

      controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);
      controller.ui.builder = {};
    });

    /*  Commented out as code references AutoAttendant.saveAARecords()
     *
     *
    it('should save a new aaRecord successfully', function () {

      $stateParams.aaName = '';

      controller.saveAARecord();
      $scope.$apply();

      expect(AutoAttendantCeService.createCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      // note we only care about name in this stage of stories
      expect(angular.equals(aaModel.aaRecords[0].callExperienceName, rawCeInfo.callExperienceName)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      // note we only care about name in this stage of stories
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0].getName(), ceInfo.getName())).toEqual(true);

      expect(Notification.success).toHaveBeenCalledWith('autoAttendant.successCreateCe');
    });

    *** */

    it('should issue error message on no name', function () {

      controller.checkNameEntry("");
      $scope.$apply();

      expect(Notification.error).toHaveBeenCalledWith('autoAttendant.invalidBuilderNameMissing');
    });
    it('should return a true value', function () {

      var result = controller.checkNameEntry("Smith");

      $scope.$apply();

      expect(result).toEqual(true);

    });

    /*  Commented out as code references AutoAttendant.saveAARecords()
     *
     *

    it('should issue error message on failure to save', function () {

      saveCeSpy.and.returnValue(
        $q.reject({
          status: 500
        })
      );

      controller.saveAARecord();
      $scope.$apply();

      expect(Notification.error).toHaveBeenCalledWith('autoAttendant.errorCreateCe');
    });
    **** */

    it('should reject adding a dupe CE (no update for now)', function () {

      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName
      });

      controller.name = rawCeInfo.callExperienceName;

      controller.checkNameEntry(controller.name);

      $scope.$apply();

      expect(Notification.error).toHaveBeenCalledWith('autoAttendant.invalidBuilderNameNotUnique');
    });

    it('should have called setCeInfo', function () {

      controller.name = rawCeInfo.callExperienceName;

      controller.saveUiModel();

      $scope.$apply();

      expect(AutoAttendantCeInfoModelService.setCeInfo).toHaveBeenCalled();
    });
  });

});
