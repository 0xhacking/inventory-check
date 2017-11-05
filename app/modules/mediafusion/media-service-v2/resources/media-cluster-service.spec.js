'use strict';

describe('Service: MediaClusterServiceV2', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var $httpBackend, Service, Authinfo;

  beforeEach(inject(function ($injector, _MediaClusterServiceV2_, _Authinfo_) {
    Authinfo = _Authinfo_;
    Authinfo.getOrgId = sinon.stub().returns("orgId");
    Service = _MediaClusterServiceV2_;
    $httpBackend = $injector.get('$httpBackend');
  }));
  afterEach(function () {

  });

  it('should call error callback on failure', function () {
    $httpBackend.when('GET', /^\w+.*/).respond(500, null);
    var callback = sinon.stub();
    Service.fetch().then(null, callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should delete v2 cluster', function () {
    $httpBackend.when('DELETE', /^\w+.*/).respond(204);
    var callback = sinon.stub();
    Service.deleteV2Cluster('connectorId').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should delete v2 cluster with connectors', function () {
    $httpBackend.when('POST', /^\w+.*/).respond(204);
    var callback = sinon.stub();
    Service.deleteClusterWithConnector('clusterId').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });

  it('should update v2 cluster', function () {
    $httpBackend.when('PATCH', /^\w+.*/).respond(204);
    var callback = sinon.stub();
    Service.updateV2Cluster('clusterId', 'clusterName', 'releaseChannel').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });

  it('should move v2 host', function () {
    $httpBackend.when('POST', /^\w+.*/).respond(204);
    var callback = sinon.stub();
    Service.moveV2Host('connectorId', 'fromCluster', 'toCluster').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });

  it('should get a given cluster', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({});
    var callback = sinon.stub();
    Service.get('clusterid').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should getall a given cluster', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({});
    var callback = sinon.stub();
    Service.getAll().then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });

  it('should defuse V2 Connector', function () {
    $httpBackend.when('POST', /^\w+.*/).respond(204);
    var callback = sinon.stub();
    Service.defuseV2Connector('connectorId').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });

  it('should upgrade V2 Connector', function () {
    $httpBackend.when('POST', /^\w+.*/).respond(204);
    var callback = sinon.stub();
    Service.upgradeCluster('connectorId').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });

  it('should return the state and severuty for the state has_alarms', function () {
    var object = Service.getRunningStateSeverity('has_alarms');
    expect(object).toBeDefined();
    expect(object.label).toBeDefined();
    expect(object.value).toBeDefined();
    expect(object.label).toBe('error');
    expect(object.value).toBe(3);
  });

  it('should return the state and severuty for the state running', function () {
    var object = Service.getRunningStateSeverity('running');
    expect(object).toBeDefined();
    expect(object.label).toBeDefined();
    expect(object.value).toBeDefined();
    expect(object.label).toBe('ok');
    expect(object.value).toBe(0);
  });

  it('should return the state and severuty for the state offline', function () {
    var object = Service.getRunningStateSeverity('offline');
    expect(object).toBeDefined();
    expect(object.label).toBeDefined();
    expect(object.value).toBeDefined();
    expect(object.label).toBe('error');
    expect(object.value).toBe(3);
  });

  it('should return the state and severuty for the state has_alarms', function () {
    var object = Service.getRunningStateSeverity('not_installed');
    expect(object).toBeDefined();
    expect(object.label).toBeDefined();
    expect(object.value).toBeDefined();
    expect(object.label).toBe('neutral');
    expect(object.value).toBe(1);
  });

  it('should return the state and severuty for the state has_alarms', function () {
    var object = Service.getRunningStateSeverity('disabled');
    expect(object).toBeDefined();
    expect(object.label).toBeDefined();
    expect(object.value).toBeDefined();
    expect(object.label).toBe('warning');
    expect(object.value).toBe(2);
  });

  it('should merge the alarms', function () {
    var connectors = [{
      "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9…-9062-069343e8241d/connectors/mf_mgmt@d2ed6f11-5a53-4011-9062-069343e8241d",
      "id": "mf_mgmt@d2ed6f11-5a53-4011-9062-069343e8241d",
      "connectorType": "mf_mgmt",
      "upgradeState": "upgraded",
      "state": "running",
      "hostname": "10.47.221.1",
      "hostSerial": "d2ed6f11-5a53-4011-9062-069343e8241d",
      "alarms": [{
        "id": "mf.linus.connectivityError",
        "firstReported": "2016-06-30T18:33:58.740Z",
        "lastReported": "2016-06-30T18:33:58.740Z",
        "severity": "critical",
        "title": "Call switching process connection failure",
        "description": "The call switching process lost connectivity with the cloud."
      }],
      "runningVersion": "2016.06.29.146",
      "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9e-73d9-4460-a668-047162ff1bac/channels/DEV/packages/mf_mgmt",
      "registered": true
    }];

    var object = Service.mergeAllAlarms(connectors);

    expect(object).toBeDefined();
    expect(object[0]).toBeDefined();
    expect(object[0].id).toBeDefined();
    expect(object[0].firstReported).toBeDefined();
    expect(object[0].lastReported).toBeDefined();
    expect(object[0].severity).toBeDefined();
    expect(object[0].title).toBeDefined();

  });

  it('should return the getMostSevereRunningState', function () {
    // body...
    var previous = {
      "stateSeverityValue": -1
    };
    var connector = {
      "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9…-b436-d1805bfc9c0c/connectors/mf_mgmt@b286c14a-6637-46ad-b436-d1805bfc9c0c",
      "id": "mf_mgmt@b286c14a-6637-46ad-b436-d1805bfc9c0c",
      "connectorType": "mf_mgmt",
      "upgradeState": "upgraded",
      "state": "offline",
      "hostname": "172.28.131.16",
      "hostSerial": "b286c14a-6637-46ad-b436-d1805bfc9c0c",
      "alarms": [],
      "runningVersion": "2016.06.29.146",
      "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/2c3c9f9e-73d9-4460-a668-047162ff1bac/channels/DEV/packages/mf_mgmt",
      "registered": true
    };
    var object = Service.getMostSevereRunningState(previous, connector);

    expect(object).toBeDefined();
    expect(object.state).toBeDefined();
    expect(object.stateSeverity).toBeDefined();
    expect(object.stateSeverityValue).toBeDefined();
    expect(object.state).toBe('offline');
    expect(object.stateSeverity).toBe('error');
    expect(object.stateSeverityValue).toBe(3);
  });

  it('should return the buildAggregates', function () {
    var type = 'mf_mgmt';
    var cluster = {
      "url": " ",
      "id": "8aadca1c-805a-422f-8081-300f75281a70",
      "name": "10.22.162.19",
      "connectors": [{
        "url": " ",
        "id": "mf_mgmt@8aadca1c-805a-422f-8081-300f75281a70",
        "connectorType": "mf_mgmt",
        "upgradeState": "upgraded",
        "state": "has_alarms",
        "hostname": "10.22.162.48",
        "hostSerial": "8aadca1c-805a-422f-8081-300f75281a70",
        "alarms": [{
          "id": "mf.docker.error",
          "firstReported": "2016-07-01T22:10:12.994Z",
          "lastReported": "2016-07-01T22:10:12.994Z",
          "severity": "warning",
          "title": "Management process error",
          "description": "No such container: 5415fb12efbde04f7178a34a3c92e14f1185d07d4fca942abbfc0962899a4455\n"
        }],
        "runningVersion": "2016.06.16.124",
        "packageUrl": " ",
        "registered": true
      }],
      "releaseChannel": "GA",
      "provisioning": [{
        "url": " ",
        "connectorType": "mf_mgmt",
        "provisionedVersion": "1.0",
        "availableVersion": "1.0",
        "packageUrl": " "
      }],
      "registered": true,
      "targetType": "mf_mgmt"
    };

    var object = Service.buildAggregates(type, cluster);
    expect(object).toBeDefined();
    expect(object.alarms).toBeDefined();
    expect(object.alarms[0]).toBeDefined();
    expect(object.alarms[0].description).toBeDefined();
    expect(object.alarms[0].severity).toBeDefined();
    expect(object.alarms[0].severity).toBe('warning');
    expect(object.hosts).toBeDefined();
    expect(object.provisioning).toBeDefined();
    expect(object.provisioning.connectorType).toBeDefined();
    expect(object.provisioning.connectorType).toBe('mf_mgmt');
    expect(object.state).toBeDefined();
    expect(object.state).toBe('has_alarms');
    expect(object.upgradeState).toBeDefined();
    expect(object.upgradeState).toBe('upgraded');

  });
  it('MediaClusterServiceV2 getOrganization should be called successfully', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({});
    var done = function () {};
    Service.getOrganization(done);
    expect($httpBackend.flush).not.toThrow();
  });
  it('MediaClusterServiceV2 getClustersV2 successfully should return the data', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({});
    Service.getClustersV2();
    expect($httpBackend.flush).not.toThrow();
  });
});
