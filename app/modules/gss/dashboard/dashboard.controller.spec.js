'use strict';

describe('controller: DashboardCtrl', function () {
  var $controller, $q, $scope, $state, controller, DashboardService, GSSService;
  var component;
  var testData = {
    testIncident: {
      incidentId: 'testIncidentId'
    },
    actionType: 'update'
  };


  beforeEach(angular.mock.module('GSS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initController);
  beforeEach(initSpies);
  beforeEach(loadTestData);

  function dependencies(_$controller_, _$q_, _$rootScope_, _$state_, _DashboardService_, _GSSService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    DashboardService = _DashboardService_;
    GSSService = _GSSService_;
  }

  function initController() {
    controller = $controller('DashboardCtrl', {
      $scope: $scope,
      $state: $state,
      DashboardService: DashboardService,
      GSSService: GSSService
    });

    $scope.$apply();
  }

  function initSpies() {
    spyOn($state, 'go');
    spyOn(DashboardService, 'modifyComponent').and.returnValue($q.when());
  }

  function loadTestData() {
    var testComponent = {
      componentId: 'testComponentId',
      componentName: 'testComponentName',
      status: 'testStatus',
      statusObj: {
        label: 'statusLabel',
        value: 'statusValue'
      }
    };

    var subComponent = _.clone(testComponent, true);
    subComponent.status = 'partial_outage';
    subComponent.statusObj.value = 'partial_outage';

    component = _.clone(testComponent, true);
    component.isOverridden = false;
    component.status = 'operational';
    component.statusObj.value = 'operational';
    component.components = [subComponent];
  }

  it('call goToNewIncidentPage, should go to new incident page', function () {
    controller.goToNewIncidentPage();
    expect($state.go).toHaveBeenCalledWith('gss.incidents.new');
  });

  it('call goToUpdateIncidentPage, should go to update incident page', function () {
    controller.goToUpdateIncidentPage(testData.testIncident);
    expect($state.go).toHaveBeenCalledWith('gss.incidents.update', {
      incident: testData.testIncident,
      actionType: testData.actionType
    });
  });

  it('call goToComponentsPage, should go to the components page', function () {
    controller.goToComponentsPage();
    expect($state.go).toHaveBeenCalledWith('gss.components');
  });

  it('call modifyComponentStatus, DashboardService.modifyComponent should been called', function () {
    controller.modifyComponentStatus(component);
    expect(DashboardService.modifyComponent).toHaveBeenCalled();
  });

  it('call modifySubComponentStatus overridden(false), should not touch parent component status', function () {
    controller.modifySubComponentStatus(component, component.components[0]);
    expect(DashboardService.modifyComponent.calls.count()).toEqual(1);
  });

  it('call modifySubComponentStatus overridden(true), parent component with lower priority, should not touch parent component status', function () {
    component.isOverridden = true;

    controller.modifySubComponentStatus(component, component.components[0]);
    expect(DashboardService.modifyComponent.calls.count()).toEqual(1);
  });
});
