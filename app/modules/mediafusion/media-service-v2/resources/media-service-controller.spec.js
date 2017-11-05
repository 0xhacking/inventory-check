'use strict';

describe('Controller: MediaServiceControllerV2', function () {
  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module('Huron'));
  var controller, $scope, httpMock, $q, $modal, $translate, Notification;
  var MediaClusterServiceV2, FusionClusterService, MediaServiceActivationV2;
  beforeEach(inject(function ($rootScope, $state, $controller, _$httpBackend_, _$q_, _$modal_, _$translate_, _FusionClusterService_, _MediaClusterServiceV2_, _MediaServiceActivationV2_, _Notification_) {
    $scope = $rootScope.$new();
    httpMock = _$httpBackend_;
    $q = _$q_;
    $modal = _$modal_;
    $translate = _$translate_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    FusionClusterService = _FusionClusterService_;
    MediaServiceActivationV2 = _MediaServiceActivationV2_;
    Notification = _Notification_;
    httpMock.when('GET', /^\w+.*/).respond({});

    controller = $controller('MediaServiceControllerV2', {
      $scope: $scope,
      $state: $state,
      httpMock: httpMock,
      $q: $q,
      $modal: $modal,
      $translate: $translate,
      FusionClusterService: FusionClusterService,
      MediaClusterServiceV2: MediaClusterServiceV2,
      MediaServiceActivationV2: MediaServiceActivationV2,
      Notification: Notification
    });
  }));
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('should call MediaClusterServiceV2 getall', function () {
    var clusters = [{
      "url": "",
      "id": "cb72e22d-5ed3-46eb-89cc-024babab385c",
      "name": "172.28.131.15",
      "connectors": [{
        "url": "",
        "id": "mf_mgmt@cb72e22d-5ed3-46eb-89cc-024babab385c",
        "connectorType": "mf_mgmt",
        "upgradeState": "upgraded",
        "state": "offline",
        "hostname": "172.28.131.15",
        "hostSerial": "cb72e22d-5ed3-46eb-89cc-024babab385c",
        "alarms": [],
        "runningVersion": "1.0",
        "packageUrl": ""
      }],
      "releaseChannel": "GA",
      "provisioning": [{
        "url": "",
        "connectorType": "mf_mgmt",
        "provisionedVersion": "1.0",
        "availableVersion": "1.0",
        "packageUrl": ""
      }],
      "state": "defused",
      "targetType": "mf_mgmt"
    }, {
      "url": "",
      "id": "efda2314-2397-4419-bd22-9bae4a112155",
      "name": "",
      "connectors": [{
        "url": "",
        "id": "mf_mgmt@efda2314-2397-4419-bd22-9bae4a112155",
        "connectorType": "mf_mgmt",
        "upgradeState": "upgraded",
        "state": "offline",
        "hostname": "192.168.99.100",
        "hostSerial": "efda2314-2397-4419-bd22-9bae4a112155",
        "alarms": [],
        "runningVersion": "ET--1-LI-286-1-ME-9.16.125-1-MG-8.24.94-1",
        "packageUrl": ""
      }],
      "releaseChannel": "GA",
      "provisioning": [{
        "url": "",
        "connectorType": "mf_mgmt",
        "provisionedVersion": "1.0",
        "availableVersion": "1.0",
        "packageUrl": " "
      }],
      "state": "defused",
      "targetType": "mf_mgmt"
    }];
    spyOn(MediaClusterServiceV2, 'getClustersByConnectorType').and.returnValue(clusters);
    controller.clustersUpdated();
    httpMock.flush();
    expect(MediaClusterServiceV2.getClustersByConnectorType).toHaveBeenCalled();
  });
  it('addResourceButtonClicked should open the respective modal', function () {
    spyOn($modal, 'open');
    controller.addResourceButtonClicked();
    expect($modal.open).toHaveBeenCalled();
  });
});

describe('Controller: MediaClusterSettingsControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var controller, $modal;
  var fakeModal = {
    result: {
      then: function (okCallback, cancelCallback) {
        this.okCallback = okCallback;
        this.cancelCallback = cancelCallback;
      }
    },
    close: function (item) {
      this.result.okCallback(item);
    },
    dismiss: function (type) {
      this.result.cancelCallback(type);
    }
  };
  beforeEach(inject(function ($controller, _$modal_) {
    $modal = _$modal_;

    controller = $controller('MediaClusterSettingsControllerV2', {
      $modal: $modal
    });

  }));
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('MediaClusterSettingsControllerV2 showDeregisterDialog should open the respective modal', function () {
    spyOn($modal, 'open').and.returnValue(fakeModal);
    controller.showDeregisterDialog();
    expect($modal.open).toHaveBeenCalled();
  });
});
describe('Controller: MediaAlarmControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var controller;
  beforeEach(inject(function ($controller) {
    controller = $controller('MediaAlarmControllerV2', {});
  }));
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
});
