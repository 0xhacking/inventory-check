'use strict';

describe('Controller: HostDeregisterControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var $rootScope, controller, cluster, connector, orgName, MediaClusterServiceV2, Notification, $q, $translate, modalInstanceMock, windowMock;

  beforeEach(inject(function (_$rootScope_, $controller, _Notification_, _$q_, _$translate_) {
    $rootScope = _$rootScope_;
    cluster = {
      id: 'id',
      name: 'b'
    };
    orgName = '123';
    connector = {
      id: 'id'
    };
    MediaClusterServiceV2 = {

      deleteCluster: sinon.stub(),
      defuseV2Connector: sinon.stub()
    };
    Notification = _Notification_;
    $q = _$q_;
    $translate = _$translate_;

    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };
    controller = $controller('HostDeregisterControllerV2', {
      $scope: $rootScope.$new(),
      connector: connector,
      cluster: cluster,
      orgName: orgName,
      MediaClusterServiceV2: MediaClusterServiceV2,
      Notification: Notification,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock
    });

  }));

  it('check if HostDeregisterControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if Deregister is called', function () {
    spyOn(MediaClusterServiceV2, 'defuseV2Connector').and.returnValue($q.when());
    controller.deregister();
    expect(MediaClusterServiceV2.defuseV2Connector).toHaveBeenCalled();
    expect(controller.saving).toBe(true);

  });

  it('check if Deregister is called with  clusterId', function () {

    spyOn(MediaClusterServiceV2, 'defuseV2Connector').and.returnValue($q.when());
    controller.deregister();
    expect(MediaClusterServiceV2.defuseV2Connector).toHaveBeenCalledWith(cluster.id);
  });

  it('Should go to success module of deregister', function () {
    var deregisterDefered = $q.defer();
    spyOn(MediaClusterServiceV2, 'defuseV2Connector').and.returnValue(deregisterDefered.promise);
    deregisterDefered.resolve();
    $rootScope.$apply();

    controller.deregister();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
  it('Should go to failure module of deregister', function () {
    var deregisterDefered = $q.defer();
    spyOn(MediaClusterServiceV2, 'defuseV2Connector').and.returnValue(deregisterDefered.promise);
    deregisterDefered.reject();
    $rootScope.$apply();

    controller.deregister();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
});
