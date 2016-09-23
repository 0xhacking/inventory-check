'use strict';
describe('Controller: ReassignClusterControllerV2', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var redirectTargetPromise, connector, controller, cluster, MediaClusterServiceV2, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock;
  beforeEach(inject(function ($controller, _MediaClusterServiceV2_, _XhrNotificationService_, _$q_, _$translate_) {
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
      targetType: 'c_cal'
    }];

    redirectTargetPromise = {
      then: sinon.stub()
    };
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    XhrNotificationService = _XhrNotificationService_;
    $q = _$q_;
    $translate = _$translate_;
    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };
    controller = $controller('ReassignClusterControllerV2', {
      cluster: cluster,
      MediaClusterServiceV2: MediaClusterServiceV2,
      XhrNotificationService: XhrNotificationService,
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
    controller.clusterDetail = {
      id: 'id'
    };
    spyOn(MediaClusterServiceV2, 'moveV2Host').and.returnValue(redirectTargetPromise);
    controller.reassign();
    expect(controller.saving).toBe(true);
    expect(MediaClusterServiceV2.moveV2Host).toHaveBeenCalled();
  });
  it('check if createClusterV2 is called with  clusterId', function () {
    controller.clusterDetail = null;
    spyOn(MediaClusterServiceV2, 'createClusterV2').and.returnValue(redirectTargetPromise);
    controller.reassign();
    expect(controller.saving).toBe(true);
    expect(MediaClusterServiceV2.createClusterV2).toHaveBeenCalled();
  });
  it('check if mf_mgmt is filtered into options', function () {
    spyOn(MediaClusterServiceV2, 'moveV2Host').and.returnValue(getAll);
    controller.getCluster();
    expect(controller.options.length).tobe(1);

  });
});
