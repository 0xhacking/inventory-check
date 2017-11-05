'use strict';

describe('Controller: HostDetailsControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var $selectedRole, $q, $clusterId, httpBackend, $rootScope, $modal, controller, $stateParams, $state, MediaClusterServiceV2, Notification;
  var actualOptions;
  var fakeModal = {
    result: {
      then: function (confirmCallback, cancelCallback) {
        this.confirmCallBack = confirmCallback;
        this.cancelCallback = cancelCallback;
      }
    },
    close: function (item) {
      this.result.confirmCallBack(item);
    },
    dismiss: function (type) {
      this.result.cancelCallback(type);
    }
  };
  beforeEach(inject(function ($httpBackend, _$rootScope_, _$q_, $controller, _MediaClusterServiceV2_, _Notification_, $translate) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $stateParams = {
      "groupName": "Bangalore - Site 1",
      "selectedClusters": [{
        "cluster_type": "mf_mgmt",
        "id": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e",
        "name": "10.196.5.247",
        "hosts": [{
          "host_name": "10.196.5.247",
          "serial": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e",
          "alarms": [{
            "id": "mf.linus.connectivityError",
            "first_reported": "2016-05-15T04:52:07.810Z",
            "last_reported": "2016-05-18T17:40:45.160Z",
            "severity": "critical",
            "title": "Call switching process connection failure",
            "description": "The call switching process lost connectivity with the cloud. (Type: O)"
          }],
          "services": [{
            "display_name": "Media Connector",
            "service_type": "mf_mgmt",
            "state": "running",
            "status": "needs_attention",
            "version": "2016.05.18.61"
          }],
          "offline": false,
          "state": "running",
          "status": "needs_attention"
        }],
        "provisioning": [],
        "provisioning_data": {
          "approved_packages": [{
            "service": {
              "display_name": "Media Connector",
              "service_type": "mf_mgmt"
            },
            "version": "1.0"
          }],
          "not_approved_packages": []
        },
        "services": [{
          "enabled": true,
          "display_name": "Media Connector",
          "service_type": "mf_mgmt",
          "connectors": [{
            "connector_status": {
              "operational": false,
              "services": {
                "cloud": [],
                "onprem": []
              }
            },
            "state": "running",
            "version": "2016.05.18.61",
            "host": {
              "host_name": "10.196.5.247",
              "serial": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e"
            },
            "alarms": [{
              "id": "mf.linus.connectivityError",
              "first_reported": "2016-05-15T04:52:07.810Z",
              "last_reported": "2016-05-18T17:40:45.160Z",
              "severity": "critical",
              "title": "Call switching process connection failure",
              "description": "The call switching process lost connectivity with the cloud. (Type: O)"
            }],
            "status": "needs_attention"
          }],
          "alarm_count": 1,
          "running_hosts": 1,
          "state": "running",
          "needs_attention": true,
          "status": "needs_attention"
        }],
        "properties": {
          "fms.releaseChannel": "DEV",
          "mf.group.displayName": "Bangalore - Site 1"
        },
        "assigned_property_sets": ["50795e4c-87ca-44d7-bb21-f684494c1a0d"],
        "running_hosts": "0[object Object]",
        "needs_attention": true,
        "software_upgrade_available": false,
        "any_service_connectors_enabled": {
          "connector_status": {
            "operational": false,
            "services": {
              "cloud": [],
              "onprem": []
            }
          },
          "state": "running",
          "version": "2016.05.18.61",
          "host": {
            "host_name": "10.196.5.247",
            "serial": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e"
          },
          "alarms": [{
            "id": "mf.linus.connectivityError",
            "first_reported": "2016-05-15T04:52:07.810Z",
            "last_reported": "2016-05-18T17:40:45.160Z",
            "severity": "critical",
            "title": "Call switching process connection failure",
            "description": "The call switching process lost connectivity with the cloud. (Type: O)"
          }],
          "status": "needs_attention"
        }
      }],
      "clusterId": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e",
      "properties": {
        "fms.releaseChannel": "DEV",
        "mf.group.displayName": "Bangalore - Site 1"
      },
      "connector": {
        "connector_status": {
          "operational": false,
          "services": {
            "cloud": [],
            "onprem": []
          }
        },
        "state": "running",
        "version": "2016.05.18.61",
        "host": {
          "host_name": "10.196.5.247",
          "serial": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e"
        },
        "alarms": [{
          "id": "mf.linus.connectivityError",
          "first_reported": "2016-05-15T04:52:07.810Z",
          "last_reported": "2016-05-18T17:40:45.160Z",
          "severity": "critical",
          "title": "Call switching process connection failure",
          "description": "The call switching process lost connectivity with the cloud. (Type: O)"
        }],
        "status": "needs_attention"
      },
      "hostLength": 1
    };

    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    Notification = _Notification_;

    $modal = {
      open: sinon.stub().returns({
        result: {
          then: function (callback) {
            callback({
              postponed: 12
            });
          }
        }
      })
    };
    httpBackend = $httpBackend;
    httpBackend.when('GET', /^\w+.*/).respond({});
    controller = $controller('HostDetailsControllerV2', {
      $modal: $modal,
      $q: $q,
      $scope: $rootScope.$new(),
      $stateParams: $stateParams,
      $state: $state,
      MediaClusterServiceV2: MediaClusterServiceV2,
      Notification: Notification,
      $translate: $translate,
      $selectedRole: $selectedRole,
      $clusterId: $clusterId
    });

  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('should open modal for reassignCluster call', function () {
    spyOn($modal, 'open').and.callFake(function (options) {
      actualOptions = options;
      return fakeModal;
    });
    controller.reassignCluster({
      preventDefault: function () {}
    });
    $rootScope.$digest();
    expect(actualOptions.resolve.cluster()).toEqual(controller.cluster);
    expect(actualOptions.resolve.connector()).toEqual(controller.connector);
    expect($modal.open).toHaveBeenCalled();

  });

  it('showDeregisterHostDialog should open modal', function () {
    spyOn($modal, 'open').and.callFake(function (options) {
      actualOptions = options;
      return fakeModal;
    });
    spyOn(MediaClusterServiceV2, 'getOrganization').and.returnValue($q.when({
      data: {
        success: true,
        displayName: "fakeDisplayName"
      }
    }));
    controller.hostcount = 1;
    controller.organization = {
      displayName: "fakeName"
    };

    controller.showDeregisterHostDialog({
      preventDefault: function () {}
    });
    httpBackend.flush();
    $rootScope.$digest();
    expect(actualOptions.resolve.cluster()).toEqual(controller.cluster);
    expect(actualOptions.resolve.orgName()).toEqual(controller.organization.displayName);
    expect(actualOptions.resolve.connector()).toEqual(controller.connector);
    expect($modal.open).toHaveBeenCalled();
  });

  it('showDeregisterHostDialog should open modal when hostcount not equal to 1', function () {
    controller.hostcount = 0;

    controller.showDeregisterHostDialog({
      preventDefault: function () {}
    });
    $rootScope.$digest();
    expect($modal.open.calledOnce).toBe(true);

  });
});
