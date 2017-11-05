'use strict';

describe('Controller: ReassignClusterControllerV2', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var connector, controller, cluster, MediaClusterServiceV2, $q, $translate, modalInstanceMock, windowMock, clusterList, httpMock, Notification;
  beforeEach(inject(function ($controller, _MediaClusterServiceV2_, _Notification_, _$q_, _$translate_, _$httpBackend_) {
    connector = {
      hostname: 'hostname',
      id: 'id'
    };
    cluster = {
      id: 'a',
      name: 'b',
      properties: {
        'mf.group.displayName': 'trichy'
      },
      assigned_property_sets: '606599c8-8e72-491f-9212-153a0877eb84' // or whatever you prefer
    };

    clusterList = [{
      id: 'a',
      name: 'name1',
      targetType: 'mf_mgmt'
    }, {
      id: 'a',
      name: 'name1',
      targetType: 'c_mgmt'
    }];

    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    Notification = _Notification_;
    httpMock = _$httpBackend_;
    httpMock.when('GET', /^\w+.*/).respond({});
    $q = _$q_;
    $translate = _$translate_;
    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };
    spyOn(MediaClusterServiceV2, 'getAll').and.returnValue($q.when(clusterList));

    controller = $controller('ReassignClusterControllerV2', {
      cluster: cluster,
      MediaClusterServiceV2: MediaClusterServiceV2,
      Notification: Notification,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      connector: connector
    });
  }));
  it('check if ReassignClusterControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });
  it('check if moveV2Host is called with  clusterId', function () {
    httpMock.when('POST', /^\w+.*/).respond({});
    controller.clusterDetail = {
      id: 'id'
    };
    spyOn(MediaClusterServiceV2, 'moveV2Host').and.returnValue($q.when({}));
    controller.reassign();
    httpMock.verifyNoOutstandingExpectation();
    expect(controller.saving).toBe(true);
    expect(MediaClusterServiceV2.moveV2Host).toHaveBeenCalled();
  });
  it('should notify error when moveV2Host call fails', function () {
    httpMock.when('POST', /^\w+.*/).respond(500, null);
    controller.clusterDetail = {
      id: 'id'
    };
    controller.selectedCluster = "testCluster1";
    spyOn(MediaClusterServiceV2, 'moveV2Host').and.returnValue($q.reject());
    controller.reassign();
    httpMock.verifyNoOutstandingExpectation();
    expect(MediaClusterServiceV2.moveV2Host).toHaveBeenCalled();
    expect(controller.error).toBe("mediaFusion.reassign.reassignErrorMessage");
  });
  it('check if createClusterV2 is called with  clusterId', function () {
    httpMock.when('POST', /^\w+.*/).respond({});
    controller.clusterDetail = null;
    controller.selectModel = {
      "10.196.5.251": "MFA_TEST3",
      "10.196.5.246": "MFA_TEST4"
    };
    controller.clusters = [{
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "MFA_TEST2"
    }];
    spyOn(MediaClusterServiceV2, 'createClusterV2').and.returnValue($q.when({
      data: ""
    }));
    controller.reassign();
    httpMock.verifyNoOutstandingExpectation();
    expect(controller.saving).toBe(true);
    expect(MediaClusterServiceV2.createClusterV2).toHaveBeenCalled();
  });
  it('should notify error when createClusterV2 call fails', function () {
    httpMock.when('POST', /^\w+.*/).respond(500, null);
    controller.clusterDetail = null;
    spyOn(Notification, 'error');
    spyOn(MediaClusterServiceV2, 'createClusterV2').and.returnValue($q.reject());
    controller.reassign();
    httpMock.verifyNoOutstandingExpectation();
    expect(Notification.error).toHaveBeenCalled();
  });
  it('check if mf_mgmt is filtered into options', function () {
    httpMock.verifyNoOutstandingExpectation();
    expect(controller.options.length).toBe(1);
  });
  it('canContinue should enable continue button when the feild is filled', function () {
    controller.selectedCluster = "testCluster1";
    controller.selectPlaceholder = "testCluster2";
    controller.canContinue();
    expect(controller.canContinue()).toBeTruthy();
  });
  it('canContinue should disable continue button when the feild is empty', function () {
    controller.selectedCluster = '';
    controller.selectPlaceholder = "testCluster2";
    controller.canContinue();
    expect(controller.canContinue()).toBeFalsy();
  });
});
