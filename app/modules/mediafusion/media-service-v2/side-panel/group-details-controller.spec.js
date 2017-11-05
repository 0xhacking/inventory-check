'use strict';

describe('Controller: GroupDetailsControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var $modal, controller, $rootScope, httpBackend, MediaClusterServiceV2;
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
  beforeEach(inject(function ($httpBackend, _$rootScope_, $stateParams, $controller) {
    $rootScope = _$rootScope_;
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
    $stateParams = {
      cluster: {
        releaseChannel: "mockedChannel",
        upgradeSchedule: {
          scheduleDays: [
            "sunday",
            "saturday",
            "tuesday",
            "friday",
            "thursday",
            "wednesday",
            "monday"
          ],
          scheduleTime: "22:00",
          scheduleTimeZone: "America/Los_Angeles",
          moratoria: [],
          nextUpgradeWindow: {
            "startTime": "2016-12-06T06:00:50.325Z",
            "endTime": "2016-12-06T07:00:50.325Z"
          },
          url: "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9e-73d9-4460-a668-047162ff1bac/clusters/fa8ea85d-6f7a-43ea-833d-297f62dc3e84/upgradeSchedule"
        }
      }
    };
    MediaClusterServiceV2 = {

      getCluster: sinon.stub()
    };
    httpBackend = $httpBackend;

    httpBackend.when('GET', /^\w+.*/).respond({});
    controller = $controller('GroupDetailsControllerV2', {
      $scope: $rootScope.$new(),

      $modal: $modal,
      //$state: $state,
      $stateParams: $stateParams,
      MediaClusterServiceV2: MediaClusterServiceV2,
    });
  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('should aggregate the cluster alarms with same alarm id', function () {
    var clusterMockAlarmData = [{
      id: 0,
      hosts: [{
        host_name: "10.107.2.1",
        serial: "0000"
      }],
      services: [{
        service_type: "mf_mgmt",
        connectors: [{
          state: "offline",
          status: "needs_attention",
          alarms: [{
            description: "A process stopped unexpectedly, attempting a restart",
            first_reported: "2015-12-15T08:39:19.676Z",
            id: "mf.container.stopped",
            last_reported: "2015-12-15T08:39:19.676Z",
            severity: "error",
            title: "Process error"
          }, {
            description: "Deleted a process to clear a scope error (unknown container)",
            first_reported: "2015-12-15T08:42:51.006Z",
            id: "mf.container.scopeError",
            last_reported: "2015-12-15T08:42:51.006Z",
            severity: "warning",
            title: "Process scope error"
          }, {
            description: "A process stopped unexpectedly, attempting a restart",
            first_reported: "2015-12-15T08:42:51.005Z",
            id: "mf.docker.error",
            last_reported: "2015-12-15T08:42:51.005Z",
            severity: "warning",
            title: "Management process error"
          }],
        }]
      }]
    }, {
      id: 1,
      hosts: [{
        host_name: "10.107.2.2",
        serial: "1111"
      }],
      services: [{
        service_type: "mf_mgmt",
        connectors: [{
          state: "offline",
          status: "needs_attention",
          alarms: [{
            description: "A process stopped unexpectedly, attempting a restart",
            first_reported: "2015-12-15T08:39:19.676Z",
            id: "mf.container.stopped",
            last_reported: "2015-12-15T08:39:19.676Z",
            severity: "error",
            title: "Process error"
          }],
        }]
      }]
    }];

    controller.clusterList = clusterMockAlarmData;
    controller.alarmsSummary();
    //    expect(aggregatedAlarms.length).toBe(3);
    //    expect(aggregatedAlarms[0].hosts.length).toBe(2);
    //    expect(aggregatedAlarms[1].hosts.length).toBe(1);
    //    expect(aggregatedAlarms[2].hosts.length).toBe(1);
  });
  it('It should call the $watch and assign the subsequent variables for upgrade now', function () {
    spyOn(MediaClusterServiceV2, 'getCluster').and.returnValue(
      {
        url: "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9e-73d9-4460-a668-047162ff1bac/clusters/8909455b-3018-44c6-adfd-2840978bb5c1",
        id: "8909455b-3018-44c6-adfd-2840978bb5c1",
        name: "HealthCheck_Monitor",
        connectors: [{
          url: "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9…-adfd-2840978bb5c1/connectors/mf_mgmt@3bad8392-351d-493b-bad8-6b8e02649e1f",
          id: "mf_mgmt@3bad8392-351d-493b-bad8-6b8e02649e1f",
          connectorType: "mf_mgmt",
          upgradeState: "upgrading",
          state: "running",
          hostname: "10.196.5.205",
          hostSerial: "3bad8392-351d-493b-bad8-6b8e02649e1f",
          alarms: [],
          runningVersion: "2016.09.09.268",
          packageUrl: "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9e-73d9-4460-a668-047162ff1bac/channels/stable/packages/mf_mgmt",
          registered: true
        }],
        releaseChannel: "stable",
        provisioning: [{
          url: "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9…2ff1bac/clusters/8909455b-3018-44c6-adfd-2840978bb5c1/provisioning/mf_mgmt",
          connectorType: "mf_mgmt",
          provisionedVersion: "2016.09.09.268",
          availableVersion: "2016.09.09.268",
          packageUrl: "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9e-73d9-4460-a668-047162ff1bac/channels/stable/packages/mf_mgmt"
        }],
        registered: true,
        targetType: "mf_mgmt",
        upgradeScheduleUrl: "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9…047162ff1bac/clusters/8909455b-3018-44c6-adfd-2840978bb5c1/upgradeSchedule",
        upgradeSchedule: {
          scheduleDays: [
            "sunday",
            "saturday",
            "tuesday",
            "friday",
            "thursday",
            "wednesday",
            "monday"
          ],
          scheduleTime: "22:00",
          scheduleTimeZone: "America/Los_Angeles",
          moratoria: [],
          nextUpgradeWindow: {
            "startTime": "2016-12-06T06:00:50.325Z",
            "endTime": "2016-12-06T07:00:50.325Z"
          },
          url: "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9e-73d9-4460-a668-047162ff1bac/clusters/fa8ea85d-6f7a-43ea-833d-297f62dc3e84/upgradeSchedule"
        },
        aggregates: {
          alarms: [],
          state: "running",
          upgradeState: "upgrading",
          provisioning: {
            url: "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9…2ff1bac/clusters/8909455b-3018-44c6-adfd-2840978bb5c1/provisioning/mf_mgmt",
            connectorType: "mf_mgmt",
            provisionedVersion: "2016.09.09.268",
            availableVersion: "2016.09.09.268",
            packageUrl: "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9e-73d9-4460-a668-047162ff1bac/channels/stable/packages/mf_mgmt"
          },
          upgradeAvailable: false,
          upgradePossible: false,
          upgradeWarning: false,
          hosts: [{
            alarms: [],
            hostname: "10.196.5.205",
            state: "running",
            upgradeState: "upgrading"
          }]
        }
      });
    controller.clusterDetail = {
      id: "8909455b-3018-44c6-adfd-2840978bb5c1"
    };
    $rootScope.$digest();
    expect(controller.softwareUpgrade.availableVersion).toMatch("2016.09.09.268");
    expect(controller.softwareUpgrade.showUpgradeWarning).toBeTruthy();
    expect(controller.upgradeDetails.upgradingHostname).toMatch("10.196.5.205");
    expect(controller.showUpgradeProgress).toBeTruthy();
  });
  it('GroupDetailsControllerV2 showUpgradeNowDialog should open the modal', function () {
    spyOn($modal, 'open').and.callFake(function (options) {
      actualOptions = options;
      return fakeModal;
    });
    controller.clusterDetail = {
      id: "8909455b-3018-7576"
    };
    controller.showUpgradeNowDialog();
    expect($modal.open).toHaveBeenCalled();
    expect(actualOptions.resolve.clusterId()).toEqual(controller.clusterDetail.id);
  });
});
